import {
  Context,
  Storage,
  Address,
  generateEvent,
  deferredCallRegister,
  findCheapestSlot,
  Coins,
  call
} from '@massalabs/massa-as-sdk';
import {
      Args,
      Serializable,
      Result,
      stringToBytes,
      bytesToString,
      boolToByte,
      byteToBool,
      bytesToSerializableObjectArray,
      serializableObjectsArrayToBytes
    } from '@massalabs/as-types';
import {
cancelCall,
NEXT_CALL_ID_KEY,
registerCall,
TASK_COUNT_KEY,
processTask
} from '../internals';


export const PERIODS_PER_DAY: u64 = 5400;
 
// Storage keys
export const PROJECTS_KEY = stringToBytes('projects');
export const PROJECT_COUNT_KEY = stringToBytes('projectCount');
export const VESTING_CONTRACT_ADDRESS_KEY = stringToBytes('vestingContractAddress');
export const OWNER_KEY = stringToBytes('owner');
export const VESTING_SCHEDULES_KEY_PREFIX = stringToBytes('vesting_schedule_');
export const NEXT_VESTING_ID_KEY = stringToBytes('next_vesting_id');
export const PROJECT_VESTING_ID_KEY_PREFIX = stringToBytes('project_vesting_id_');
export const TOTAL_DONATIONS_KEY = stringToBytes('total_donations');
export const TOTAL_SUPPORTERS_KEY = stringToBytes('total_supporters');
export const DONATORS_KEY_PREFIX = stringToBytes('donators_');
export const PROJECT_DONORS_KEY_PREFIX = stringToBytes('project_donors_');
export const PROJECT_MILESTONES_KEY_PREFIX = stringToBytes('project_milestones_');
export const PROJECT_UPDATES_KEY_PREFIX = stringToBytes('project_updates_');
export const USER_VESTING_SCHEDULES_KEY_PREFIX = stringToBytes('user_vesting_schedules_');
export const PROJECT_DONOR_AMOUNTS_KEY_PREFIX = stringToBytes('project_donor_amounts_');
export const PROJECT_VESTING_SCHEDULES_KEY_PREFIX = stringToBytes('project_vesting_schedules_');
export const VESTING_VOTES_KEY_PREFIX = stringToBytes('vesting_votes_');
export const VESTING_VOTING_SESSION_KEY_PREFIX = stringToBytes('vesting_voting_session_');
export const VESTING_VOTING_PERIOD_KEY_PREFIX = stringToBytes('vesting_voting_period_');
// Event names
export const PROJECT_CREATED_EVENT = 'PROJECT_CREATED';
export const PROJECT_FUNDED_EVENT = 'PROJECT_FUNDED';
export const VESTING_SCHEDULE_CREATED_EVENT = 'VESTING_SCHEDULE_CREATED';
export const VESTING_SCHEDULE_UPDATED_EVENT = 'VESTING_SCHEDULE_UPDATED';
export const VESTING_SCHEDULE_COMPLETED_EVENT = 'VESTING_SCHEDULE_COMPLETED';
export const TOKENS_RELEASED_EVENT = 'TOKENS_RELEASED';
export const UPDATE_ADDED_EVENT = 'UPDATE_ADDED';



// Update ProjectUpdate class to add image field
class ProjectUpdate implements Serializable {
  public id: string;
  public date: string;
  public title: string;
  public content: string;
  public author: string;
  public image: string; // New field

  constructor() {
    this.id = '';
    this.date = '';
    this.title = '';
    this.content = '';
    this.author = '';
    this.image = '';
  }

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.id)
      .add(this.date)
      .add(this.title)
      .add(this.content)
      .add(this.author)
      .add(this.image) 
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: u64 = 0): Result<i32> {
    const args = new Args(data, i32(offset));
    this.id = args.nextString().expect('Failed to deserialize update ID');
    this.date = args.nextString().expect('Failed to deserialize update date');
    this.title = args.nextString().expect('Failed to deserialize update title');
    this.content = args.nextString().expect('Failed to deserialize update content');
    this.author = args.nextString().expect('Failed to deserialize update author');
    this.image = args.nextString().expect('Failed to deserialize update image');
    return new Result(args.offset);
  }
}

class vestingSchedule implements Serializable {
constructor(
  public id: u64 = 0,
  public beneficiary: Address = new Address(''),
  public totalAmount: u64 = 0,
  public amountClaimed: u64 = 0,
  public lockPeriod: u64 = 0, // In periods (initial lock period relative to vesting schedule creation)
  public releaseInterval: u64 = 0, // In periods
  public releasePercentage: u64 = 0, // Percentage out of 100
  public nextReleasePeriod: u64 = 0, // Period of the next scheduled release
  public isCompleted: bool = false // New field to track completion status
) {}

serialize(): StaticArray<u8> {
  return new Args()
    .add(this.id)
    .add(this.beneficiary as Serializable)
    .add(this.totalAmount)
    .add(this.amountClaimed)
    .add(this.lockPeriod)
    .add(this.releaseInterval)
    .add(this.releasePercentage)
    .add(this.nextReleasePeriod)
    .add(this.isCompleted)
    .serialize();
}

deserialize(data: StaticArray<u8>, offset: u64 = 0): Result<i32> {
  const args = new Args(data, i32(offset));

  this.id = args.nextU64().expect('Failed to deserialize vesting schedule ID.');
  this.beneficiary = args.nextSerializable<Address>().expect('Failed to deserialize beneficiary.');
  this.totalAmount = args.nextU64().expect('Failed to deserialize totalAmount.');
  this.amountClaimed = args.nextU64().expect('Failed to deserialize amountClaimed.');
  this.lockPeriod = args.nextU64().expect('Failed to deserialize lockPeriod.');
  this.releaseInterval = args.nextU64().expect('Failed to deserialize releaseInterval.');
  this.releasePercentage = args.nextU64().expect('Failed to deserialize releasePercentage.');
  this.nextReleasePeriod = args.nextU64().expect('Failed to deserialize nextReleasePeriod.');
  this.isCompleted = args.nextBool().expect('Failed to deserialize isCompleted.');

  return new Result(args.offset);
}
}

// Helper to get the storage key for a specific vesting schedule
function getVestingScheduleKey(id: u64): StaticArray<u8> {
  return new Args().add(VESTING_SCHEDULES_KEY_PREFIX).add(id).serialize();
}

// Helper to get the next available vesting ID (GLOBAL)
function getNextVestingId(): u64 {
  let nextId: u64 = 0;
  if (Storage.has(NEXT_VESTING_ID_KEY)) {
      const storedId = Storage.get(NEXT_VESTING_ID_KEY);
      nextId = new Args(storedId).nextU64().expect('Failed to deserialize next vesting ID');
  }
  generateEvent(`getNextVestingId: Returning ${nextId}`);
  return nextId;
}

// Helper to increment the next vesting ID (GLOBAL)
function incrementNextVestingId(): void {
  let nextId = getNextVestingId(); // This will log the current ID
  nextId++;
  Storage.set(NEXT_VESTING_ID_KEY, new Args().add(nextId).serialize());
  generateEvent(`incrementNextVestingId: Set NEXT_VESTING_ID_KEY to ${nextId}`);
}

class Project implements Serializable {
constructor(
  public projectId: u64 = 0,
  public creator: Address = new Address(''),
  public title: string = '',
  public description: string = '',
  public fundingGoal: u64 = 0,
  public amountRaised: u64 = 0,
  public beneficiary: Address = new Address(''),
  public category: string = '',
  public lockPeriod: u64 = 0, // In periods (1 period = 15 seconds in Massa)
  public releaseInterval: u64 = 0, // In periods (1 period = 15 seconds in Massa)
  public releasePercentage: u64 = 0, // Percentage out of 100
  public image: string = '', // Optional project image
  public creationPeriod: u64 = 0, // Period when the project was created
  public vestingScheduleId: u64 = 0, // ID of the associated vesting schedule
  public initialVestingTriggered: bool = false, // Flag to indicate if initial vesting has been triggered
  public totalAmountRaisedAtLockEnd: u64 = 0 // New field to store total amount raised at the end of the lock period
) {}

serialize(): StaticArray<u8> {
  const args = new Args();
  args.add(this.projectId);
  args.add(this.creator as Serializable);
  args.add(this.title);
  args.add(this.description);
  args.add(this.fundingGoal);
  args.add(this.amountRaised);
  args.add(this.beneficiary as Serializable);
  args.add(this.category);
  args.add(this.lockPeriod);
  args.add(this.releaseInterval);
  args.add(this.releasePercentage);
  args.add(this.image);
  args.add(this.creationPeriod);
  args.add(this.vestingScheduleId);
  args.add(this.initialVestingTriggered);
  args.add(this.totalAmountRaisedAtLockEnd);
  return args.serialize();
}

deserialize(data: StaticArray<u8>, offset: u64 = 0): Result<i32> {
  const args = new Args(data, i32(offset));
  this.projectId = args.nextU64().expect('Failed to deserialize projectId');
  this.creator = args.nextSerializable<Address>().expect('Failed to deserialize creator');
  this.title = args.nextString().expect('Failed to deserialize title');
  this.description = args.nextString().expect('Failed to deserialize description');
  this.fundingGoal = args.nextU64().expect('Failed to deserialize fundingGoal');
  this.amountRaised = args.nextU64().expect('Failed to deserialize amountRaised');
  this.beneficiary = args.nextSerializable<Address>().expect('Failed to deserialize beneficiary');
  this.category = args.nextString().expect('Failed to deserialize category');
  this.lockPeriod = args.nextU64().expect('Failed to deserialize lockPeriod');
  this.releaseInterval = args.nextU64().expect('Failed to deserialize releaseInterval');
  this.releasePercentage = args.nextU64().expect('Failed to deserialize releasePercentage');
  this.image = args.nextString().expect('Failed to deserialize image');
  this.creationPeriod = args.nextU64().expect('Failed to deserialize creationPeriod');
  this.vestingScheduleId = args.nextU64().expect('Failed to deserialize vestingScheduleId');
  this.initialVestingTriggered = args.nextBool().expect('Failed to deserialize initialVestingTriggered');
  this.totalAmountRaisedAtLockEnd = args.nextU64().expect('Failed to deserialize totalAmountRaisedAtLockEnd');
  return new Result(args.offset);
}
}

// Helper function to get the next project ID
function getNextProjectId(): u64 {
  let projectCount: u64 = 0;
  if (Storage.has(PROJECT_COUNT_KEY)) {
      projectCount = new Args(Storage.get(PROJECT_COUNT_KEY)).nextU64().expect('Failed to deserialize project count');
  }
  return projectCount;
}

// Helper function to increment the project count
function incrementProjectCount(): void {
  let projectCount = getNextProjectId();
  projectCount++;
  Storage.set(PROJECT_COUNT_KEY, new Args().add(projectCount).serialize());
}

// Helper to get the storage key for project updates
function getProjectUpdatesKey(projectId: u64): StaticArray<u8> {
  return new Args().add(PROJECT_UPDATES_KEY_PREFIX).add(projectId).serialize();
}

// Helper to get the stored Vesting Contract Address (Might not be needed if fully internal)
/*function getVestingContractAddress(): Address {
  assert(Storage.has(VESTING_CONTRACT_ADDRESS_KEY), "Vesting contract address not set");
  const addrBytes = Storage.get(VESTING_CONTRACT_ADDRESS_KEY);
  return new Address(bytesToString(addrBytes));
}*/

export function constructor(binArgs: StaticArray<u8>): void {
  assert(Context.isDeployingContract(), "ProjectManager: Not in deployment context");

  const args = new Args(binArgs);
  const admin = args.nextString().expect('Invalid admin');

  // Store the contract owner (deployer)
  Storage.set(OWNER_KEY, stringToBytes(admin));

  // Initialize project count if not already present
  if (!Storage.has(PROJECT_COUNT_KEY)) {
    Storage.set(PROJECT_COUNT_KEY, new Args().add(0 as u64).serialize());
  }

  // Initialize Vesting specific storage
  if (!Storage.has(NEXT_VESTING_ID_KEY)) {
    Storage.set(NEXT_VESTING_ID_KEY, new Args().add(0 as u64).serialize());
  }

  // Initialize statistics storage
  if (!Storage.has(TOTAL_DONATIONS_KEY)) {
    Storage.set(TOTAL_DONATIONS_KEY, new Args().add(0 as u64).serialize());
  }
  if (!Storage.has(TOTAL_SUPPORTERS_KEY)) {
    Storage.set(TOTAL_SUPPORTERS_KEY, new Args().add(0 as u64).serialize());
  }

  generateEvent("ProjectManager contract initialized successfully");
}

// New function to set the address of the Vesting contract (owner only) - Might not be needed if fully internal
export function setVestingContractAddress(binArgs: StaticArray<u8>): void {
  const ownerStr = Storage.get(OWNER_KEY);
  const owner = new Address(bytesToString(ownerStr));
  assert(Context.caller().equals(owner), "Unauthorized caller: only owner can set Vesting contract address");

  const args = new Args(binArgs);
  const vestingAddress = args.nextString().expect('Missing Vesting contract address');
  const vestingContract = new Address(vestingAddress);

  Storage.set(VESTING_CONTRACT_ADDRESS_KEY, stringToBytes(vestingContract.toString()));

  generateEvent(`Vesting contract address set to: ${vestingAddress}`);
}

export function createProject(binArgs: StaticArray<u8>): void {
const args = new Args(binArgs);
const title = args.nextString().expect('Missing project title');
const description = args.nextString().expect('Missing project description');
const fundingGoal = args.nextU64().expect('Missing funding goal');
const beneficiaryAddress = args.nextString().expect('Missing beneficiary address');
const category = args.nextString().expect('Missing project category');
const lockPeriodInPeriods = args.nextU64().expect('Missing lock period'); // Changed to periods
const releaseIntervalInPeriods = args.nextU64().expect('Missing release interval'); // Changed to periods
const releasePercentage = args.nextU64().expect('Missing release percentage');
const image = args.nextString().expect('Missing image');

assert(fundingGoal > 0, "Funding goal must be greater than 0");
assert(title.length > 0, "Title cannot be empty");
assert(description.length > 0, "Description cannot be empty");
assert(releasePercentage > 0 && releasePercentage <= 100, "Release percentage must be between 1 and 100");
assert(releaseIntervalInPeriods > 0, "Release interval must be greater than 0"); // Assert on periods directly

const projectId = getNextProjectId();
const creator = Context.caller();
const beneficiary = new Address(beneficiaryAddress);
const creationPeriod = Context.currentPeriod();

const vestingId = createVestingScheduleInternal(
  projectId,
  beneficiary,
  0, // Initial amount is 0
  lockPeriodInPeriods,
  releaseIntervalInPeriods,
  releasePercentage
);

const newProject = new Project(
  projectId,
  creator,
  title,
  description,
  fundingGoal,
  0, // amountRaised starts at 0
  beneficiary,
  category,
  lockPeriodInPeriods,
  releaseIntervalInPeriods,
  releasePercentage,
  image,
  creationPeriod,
  vestingId,
  false, // Initialize initialVestingTriggered to false
  0 // Initialize totalAmountRaisedAtLockEnd to 0
);

const projectKey = new Args().add(PROJECTS_KEY).add(projectId).serialize();
Storage.set(projectKey, newProject.serialize());

// Initialize updates storage for the new project
Storage.set(getProjectUpdatesKey(projectId), new Args().add([] as string[]).serialize());

incrementProjectCount();

generateEvent(PROJECT_CREATED_EVENT);

// Schedule the initial vesting trigger call to happen soon, and let triggerInitialVesting reschedule if needed.
const triggerPeriod = creationPeriod + 10; // Schedule to trigger 10 periods from now
const triggerArgs = new Args().add(projectId).serialize();

// Find a suitable slot for the deferred call
const triggerSlot = findCheapestSlot(
  triggerPeriod,
  triggerPeriod + 10, // Search window
  20_000_000, // Gas
  0 // No coins sent with this trigger call
);

deferredCallRegister(
  Context.callee().toString(), // Call this contract
  'triggerInitialVesting',
  triggerSlot,
  20_000_000, // Gas
  triggerArgs,
  0 // No coins sent with deferred call
);

generateEvent(`Initial vesting trigger scheduled for project ${projectId} at period ${triggerSlot.period}. Actual lock period: ${lockPeriodInPeriods} periods.`); // Updated message
}

export function getProject(binArgs: StaticArray<u8>): StaticArray<u8> {
const args = new Args(binArgs);
const projectId = args.nextU64().expect('Missing project ID');

// Construct the storage key for the project
const projectKey = new Args().add(PROJECTS_KEY).add(projectId).serialize();

// Check if the project exists
assert(Storage.has(projectKey), `Project with ID ${projectId} not found`);

// Get and return the serialized project data
return Storage.get(projectKey);
}

// New function to get all project IDs (renamed to replace the old getAllProjects)
export function getAllProjects(_: StaticArray<u8>): StaticArray<u8> {
  let projectIds: u64[] = [];
  let projectCount = getNextProjectId(); // Total number of projects created
  const projects: Project[] = [];

  for (let i: u64 = 0; i < projectCount; i++) {
    const projectKey = new Args().add(PROJECTS_KEY).add(i).serialize();
    // Check if a project exists at this potential ID
    if (Storage.has(projectKey)) {
      const projectData = Storage.get(projectKey);
      const project = new Project();
      project.deserialize(projectData);
      projects.push(project);
      // Since the project exists, we add its ID to the list
      projectIds.push(i);
    }
  }

  const args = new Args();
  args.addSerializableObjectArray(projects);
  
  // Add the array length first
  args.add<u64>(projectIds.length as u64);
  // Then add each U64 ID individually
  for (let i: u64 = 0; i < (projectIds.length as u64); i++) {
    args.add(projectIds[i as i32]);
  }

  generateEvent(`Returning ${projectIds.length} project IDs (via getAllProjects).`);

  return args.serialize();
}

export function fundProject(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');

  const amountSent = Context.transferredCoins();
  assert(amountSent > 0, "Must send MAS to fund a project");

  const projectKey = new Args().add(PROJECTS_KEY).add(projectId).serialize();
  assert(Storage.has(projectKey), `Project with ID ${projectId} not found`);

  let project = new Project();
  project.deserialize(Storage.get(projectKey));

  // Check if the lock period has ended. If so, no more donations are allowed.
  const currentPeriod = Context.currentPeriod();
  const lockEndPeriod = project.creationPeriod + project.lockPeriod;

  assert(currentPeriod <= lockEndPeriod, `Project ${projectId} is no longer accepting donations. Lock period ended at period ${lockEndPeriod}. Current period: ${currentPeriod}.`);

  // Add the amount to the total raised
  project.amountRaised += amountSent;
  project.totalAmountRaisedAtLockEnd = project.amountRaised; // Update this with every donation during lock period

  // Save the updated project back to storage
  Storage.set(projectKey, project.serialize());

  // Update global total donations
  let totalDonations = new Args(Storage.get(TOTAL_DONATIONS_KEY)).nextU64().expect('Failed to deserialize total donations');
  totalDonations += amountSent;
  Storage.set(TOTAL_DONATIONS_KEY, new Args().add(totalDonations).serialize());

  // Update global total supporters
  const donatorKey = new Args().add(DONATORS_KEY_PREFIX).add(Context.caller().toString()).serialize();
  if (!Storage.has(donatorKey)) {
    Storage.set(donatorKey, boolToByte(true)); // Mark this address as a unique donator
    let totalSupporters = new Args(Storage.get(TOTAL_SUPPORTERS_KEY)).nextU64().expect('Failed to deserialize total supporters');
    totalSupporters++;
    Storage.set(TOTAL_SUPPORTERS_KEY, new Args().add(totalSupporters).serialize());
  }

  // Track unique donors per project
  const callerAddressStr = Context.caller().toString();
  let projectDonors = loadProjectDonors(projectId);

  let isNewDonorForProject = true;
  for (let i: u64 = 0; i < (projectDonors.length as u64); i++) {
    if (projectDonors[i as i32] === callerAddressStr) {
      isNewDonorForProject = false;
      break;
    }
  }

  if (isNewDonorForProject) {
    projectDonors.push(callerAddressStr);
    storeProjectDonors(projectId, projectDonors);
  }

  // Store/Update donor amount for this project
  let prevAmount = loadProjectDonorAmount(projectId, Context.caller());
  storeProjectDonorAmount(projectId, Context.caller(), prevAmount + amountSent);

  generateEvent(PROJECT_FUNDED_EVENT);

  // The initial vesting trigger is already scheduled in createProject, it will handle vesting logic
  // after the lock period has passed using totalAmountRaisedAtLockEnd.
  generateEvent(`Added ${amountSent} MAS to project ${projectId}. Total raised: ${project.amountRaised}.`);
}

export function triggerInitialVesting(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID for vesting trigger');

  const projectKey = new Args().add(PROJECTS_KEY).add(projectId).serialize();
  assert(Storage.has(projectKey), `Project with ID ${projectId} not found for vesting trigger`);

  let project = new Project();
  project.deserialize(Storage.get(projectKey));

  // Calculate the actual end period of the lock period
  const lockEndPeriod = project.creationPeriod + project.lockPeriod; // project.lockPeriod is already in periods
  const currentPeriod = Context.currentPeriod();

  generateEvent(`Triggering vesting for project ${projectId}. Current period: ${currentPeriod}, Lock end period: ${lockEndPeriod}`);

  // If the current period is before the lock end period, reschedule the trigger
  if (currentPeriod < lockEndPeriod) {
    const reschedulePeriod = currentPeriod + 10; // Reschedule 10 periods from now
    const newTriggerSlot = findCheapestSlot(
      reschedulePeriod,
      reschedulePeriod + 10, // Search window
      500_000_000, // Increased gas limit
      0 // No coins sent with this trigger call
    );

    deferredCallRegister(
      Context.callee().toString(),
      'triggerInitialVesting',
      newTriggerSlot,
      500_000_000, // Increased gas limit
      binArgs, // Pass the same arguments
      0
    );
    generateEvent(`Rescheduled initial vesting trigger for project ${projectId} to period ${newTriggerSlot.period}. Still in lock period.`);
    return;
  }

  // Ensure initial vesting hasn't been triggered already after the lock period has passed
  if (project.initialVestingTriggered) {
    generateEvent(`Initial vesting already triggered for project ${projectId}. Skipping.`);
    return;
  }

  // Get the amount raised at the end of the lock period
  // Set totalAmountRaisedAtLockEnd to the actual amount raised
  project.totalAmountRaisedAtLockEnd = project.amountRaised; 
  const amountToVest = project.totalAmountRaisedAtLockEnd;

  // If no funds were raised, no vesting schedule is needed
  if (amountToVest === 0) {
      generateEvent(`No funds raised for project ${projectId} during lock period. Initial vesting skipped.`);
      project.initialVestingTriggered = true; // Mark as triggered to prevent future triggers
      Storage.set(projectKey, project.serialize());
      return;
  }

  // Create the vesting schedule
  const vestingId = createVestingScheduleInternal(
    projectId,
    project.beneficiary,
    amountToVest,
    project.lockPeriod, // Pass 0 for lockPeriod here, as the initial lock period has elapsed
    project.releaseInterval,
    project.releasePercentage
  );

  // Update the project with the new vesting schedule ID and initialVestingTriggered flag
  project.vestingScheduleId = vestingId;
  project.initialVestingTriggered = true;
  Storage.set(projectKey, project.serialize());

  generateEvent(`Initial vesting triggered for project ${projectId}. Schedule ID: ${vestingId}. Amount: ${amountToVest}`);

}

// --- Vesting Functions (Internal) ---

// Internal function to create a new vesting schedule
// Returns the new vesting ID
function createVestingScheduleInternal(
  projectId: u64,
  beneficiary: Address,
  totalAmount: u64,
  lockPeriod: u64, // In periods
  releaseInterval: u64, // In periods
  releasePercentage: u64 // Percentage out of 100
): u64 {/*
  assert(totalAmount > 0, 'Total amount for vesting schedule must be greater than 0');
  assert(lockPeriod >= 0, 'Lock period must be non-negative');
  assert(releaseInterval > 0, 'Release interval must be greater than 0');*/
  assert(releasePercentage > 0 && releasePercentage <= 100, 'Release percentage must be between 1 and 100');

  const vestingId = getNextVestingId(); // Use global ID
  incrementNextVestingId(); // Increment global ID

  const currentPeriod = Context.currentPeriod();
  // The start period for the first release is calculated here in the vesting logic
const startPeriod = Context.currentPeriod() + lockPeriod; 
  // Adjust nextReleasePeriod: if lockPeriod is 0, schedule for the next period
  const actualNextReleasePeriod = lockPeriod === 0 ? currentPeriod + 1 : currentPeriod + lockPeriod;

  const schedule = new vestingSchedule(
      vestingId,
      beneficiary,
      totalAmount,
      0, // amountClaimed
      lockPeriod,
      releaseInterval,
      releasePercentage,
      actualNextReleasePeriod, // Use adjusted nextReleasePeriod
      false // isCompleted
  );

  Storage.set(getVestingScheduleKey(vestingId), schedule.serialize());

    // Update user-specific vesting schedules mapping
  let userVestingSchedules = loadUserVestingSchedules(beneficiary);
  userVestingSchedules.push(vestingId);
  storeUserVestingSchedules(beneficiary, userVestingSchedules);
  // Update project-specific vesting schedules mapping
  let projectVestingSchedules = loadProjectVestingSchedules(projectId);
  projectVestingSchedules.push(vestingId);
  storeProjectVestingSchedules(projectId, projectVestingSchedules);

    // Schedule the first release call for this specific schedule
  const releaseArgs = new Args().add(vestingId).serialize();
  const releaseSlot = findCheapestSlot(
    startPeriod,
    startPeriod + 10, // Search window
    500_000_000, // Increased gas limit
    0 // No coins sent with the deferred call
  );
  deferredCallRegister(
    Context.callee().toString(), // Call this contract (itself)
    'releaseVestedTokens',
    releaseSlot,
    500_000_000, // Increased gas limit
    releaseArgs,
    0 // No coins sent with deferred call
  );
  

  generateEvent(
      `${VESTING_SCHEDULE_CREATED_EVENT}: ${vestingId},${beneficiary.toString()},${totalAmount},${lockPeriod},${releaseInterval},${releasePercentage}`
  );

  return vestingId;
}

// This function is called by the deferred call mechanism (internal call)
export function releaseVestedTokens(binArgs: StaticArray<u8>): void {
  // Note: This function is called by a deferred call, Context.caller() will be the contract itself.
  generateEvent('releaseVestedTokens function called internally');

  const args = new Args(binArgs);
  // Get the vesting schedule ID from the deferred call arguments
  const vestingId = args.nextU64().expect('Missing vesting schedule ID for release');

  const scheduleKey = getVestingScheduleKey(vestingId);

  // Check if the vesting schedule exists
  if (!Storage.has(scheduleKey)) {
    generateEvent(`Vesting schedule with ID ${vestingId} not found.`);
    return;
  }

  let schedule = new vestingSchedule();
  schedule.deserialize(Storage.get(scheduleKey));

  // If schedule is already completed, do nothing
  if (schedule.isCompleted) {
    generateEvent(`Vesting schedule ${vestingId} is already completed.`);
    return;
  }

  // Ensure it's time for this release
  const currentPeriod = Context.currentPeriod();
  generateEvent(`Current period: ${currentPeriod}, Next release period for ID ${vestingId}: ${schedule.nextReleasePeriod}`);
  if (currentPeriod < schedule.nextReleasePeriod) {
    generateEvent(`Not yet time for release for ID ${vestingId}`);
    return;
  }

  // Find the project ID for this vesting schedule
  let projectId: u64 = 0;
  let foundProject = false;
  let projectCount = getNextProjectId();
  
  for (let i: u64 = 0; i < projectCount; i++) {
    const projectVestingSchedules = loadProjectVestingSchedules(i);
    for (let j: u64 = 0; j < (projectVestingSchedules.length as u64); j++) {
      if (projectVestingSchedules[j as i32] === vestingId) {
        projectId = i;
        foundProject = true;
        break;
      }
    }
    if (foundProject) break;
  }
  
  assert(foundProject, `Could not find project for vesting schedule ${vestingId}`);

  // Start a new voting session
  startVotingSession(vestingId, projectId);

  // Schedule the voting result processing
  const votingSessionKey = getVotingSessionKey(vestingId);
  let votingSession = new VotingSession();
  votingSession.deserialize(Storage.get(votingSessionKey));

  const processVotingArgs = new Args().add(vestingId).add(projectId).serialize();
  const processVotingSlot = findCheapestSlot(
    votingSession.endPeriod + 1, // Process right after voting ends
    votingSession.endPeriod + 2, // Search window
    500_000_000, // Gas
    0 // No coins sent
  );

  deferredCallRegister(
    Context.callee().toString(),
    'processVotingAndRelease',
    processVotingSlot,
    500_000_000, // Gas
    processVotingArgs,
    0 // No coins sent
  );

  generateEvent(`Voting session started for vesting schedule ${vestingId}. Results will be processed at period ${processVotingSlot.period}`);
}

// New function to process voting results and handle release
export function processVotingAndRelease(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const vestingId = args.nextU64().expect('Missing vesting schedule ID');
  const projectId = args.nextU64().expect('Missing project ID');

  // Process voting results
  const shouldProceed = processVotingResult(vestingId, projectId);

  if (!shouldProceed) {
    generateEvent(`Release cancelled for vesting schedule ${vestingId} due to stop vote majority`);
    return;
  }

  // If we should proceed, perform the release
  const scheduleKey = getVestingScheduleKey(vestingId);
  let schedule = new vestingSchedule();
  schedule.deserialize(Storage.get(scheduleKey));

  generateEvent(`Total amount for ID ${vestingId}: ${schedule.totalAmount}, Already claimed: ${schedule.amountClaimed}`);
  
  // Calculate amount to release based on the *original total amount*
  let amountToRelease = (schedule.totalAmount * schedule.releasePercentage) / 100;

  // Ensure we don't release more than remains
  let remainingAmount = schedule.totalAmount - schedule.amountClaimed;
  if (amountToRelease > remainingAmount) {
    amountToRelease = remainingAmount;
    generateEvent(`Adjusted release amount to remaining for ID ${vestingId}: ${amountToRelease}`);
  }

  // If there's still amount to release
  if (amountToRelease > 0) {
    const beneficiaryAddress = schedule.beneficiary;
    generateEvent(`Attempting to transfer ${amountToRelease} MAS to ${beneficiaryAddress.toString()} for ID ${vestingId}`);

    // Transfer MAS to beneficiary from this contract's balance
    Coins.transferCoins(beneficiaryAddress, amountToRelease);
    generateEvent(TOKENS_RELEASED_EVENT);

    // Update vesting schedule
    schedule.amountClaimed += amountToRelease;
    generateEvent(`Updated amount claimed for ID ${vestingId}: ${schedule.amountClaimed}`);
  }

  // If there's still amount left to claim after this release
  if (schedule.amountClaimed < schedule.totalAmount) {
    // Schedule the next release based on the current period + interval
    const currentPeriod = Context.currentPeriod();
    schedule.nextReleasePeriod = currentPeriod + schedule.releaseInterval;

    const nextReleaseArgs = new Args().add(vestingId).serialize();
    const nextReleaseSlot = findCheapestSlot(
      schedule.nextReleasePeriod,
      schedule.nextReleasePeriod + 10, // Search window
      20_000_000, // Gas
      0 // No coins sent
    );

    // Store current state before registering next call
    Storage.set(scheduleKey, schedule.serialize());

    deferredCallRegister(
      Context.callee().toString(),
      'releaseVestedTokens',
      nextReleaseSlot,
      20_000_000, // Gas
      nextReleaseArgs,
      0 // No coins sent
    );
    generateEvent(`Next release for ID ${vestingId} scheduled for period ${nextReleaseSlot.period}`);
    // The nextReleasePeriod needs to be set to the actual scheduled period from the slot.
    schedule.nextReleasePeriod = nextReleaseSlot.period;

    // Update the schedule again with the actual scheduled period
    Storage.set(scheduleKey, schedule.serialize());
  } else {
    // Mark vesting as completed but keep it in storage
    schedule.isCompleted = true;
    Storage.set(scheduleKey, schedule.serialize());
    generateEvent(VESTING_SCHEDULE_COMPLETED_EVENT);
  }
}

// --- Vesting View Functions (Internal) ---

// Get info for a specific vesting schedule ID
export function getVestingSchedule(binArgs: StaticArray<u8>): StaticArray<u8> {
const args = new Args(binArgs);
const vestingId = args.nextU64().expect('Missing vesting schedule ID');
const scheduleKey = getVestingScheduleKey(vestingId);
assert(Storage.has(scheduleKey), `Vesting schedule with ID ${vestingId} not found`);
return Storage.get(scheduleKey);
}

export function getTotalVested(binArgs: StaticArray<u8>): StaticArray<u8> { // Changed return to StaticArray<u8> to be consistent with other getters
 const args = new Args(binArgs);
const vestingId = args.nextU64().expect('Missing vesting schedule ID');
const scheduleKey = getVestingScheduleKey(vestingId);
assert(Storage.has(scheduleKey), `Vesting schedule with ID ${vestingId} not found`);
const schedule = new vestingSchedule();
schedule.deserialize(Storage.get(scheduleKey));
return new Args().add(schedule.amountClaimed).serialize(); // Return as serialized Args
}

export function getLockedAmount(binArgs: StaticArray<u8>): StaticArray<u8> {
 const args = new Args(binArgs);
const vestingId = args.nextU64().expect('Missing vesting schedule ID');
const scheduleKey = getVestingScheduleKey(vestingId);
assert(Storage.has(scheduleKey), `Vesting schedule with ID ${vestingId} not found`);
const schedule = new vestingSchedule();
schedule.deserialize(Storage.get(scheduleKey));
return new Args().add(schedule.totalAmount - schedule.amountClaimed).serialize();
}

// Add a function to get the next vesting ID (useful for frontend)
export function viewNextVestingId(_: StaticArray<u8>): StaticArray<u8> {
  // Revert to global next vesting ID view
  const nextId = getNextVestingId();
  return new Args().add(nextId).serialize();
}

// The stop function remains largely the same, but might need to handle stopping a specific schedule
// For now, it stops the call associated with NEXT_CALL_ID_KEY if used, or needs adaptation for deferred calls.
// Assuming deferred calls are managed by the VM and don't rely on a single NEXT_CALL_ID_KEY for all tasks.
// We'll keep the basic structure, but note its functionality depends on Massa VM task management details.
export function stop(_: StaticArray<u8>): void {

const ownerStr = Storage.get(OWNER_KEY);
const owner = new Address(bytesToString(ownerStr));
assert(Context.caller().equals(owner), "Unauthorized");

// This part might need adjustment if multiple deferred calls are active.
// If you need to stop a specific vesting schedule's releases, you'd need a way to identify its call ID.
// For simplicity now, this function's utility for stopping specific vesting schedules is limited.
// assert(Storage.has(NEXT_CALL_ID_KEY), 'No deferred call to stop');
// cancelCall(Storage.get(NEXT_CALL_ID_KEY));

generateEvent("Owner stop function executed. Note: Stopping specific deferred calls requires call ID tracking.");
}

// Re-added export for processTask if it's part of the internals and needed
export { processTask };

// Add exports at the end of the file
export { Project, vestingSchedule };

// Helper to store project donors (addresses as strings)
function storeProjectDonors(projectId: u64, donors: string[]): void {
  const key = new Args().add(PROJECT_DONORS_KEY_PREFIX).add(projectId).serialize();
  const args = new Args();
  args.add<u64>(donors.length as u64);
  for (let i: u64 = 0; i < (donors.length as u64); i++) {
    args.add<string>(donors[i as i32]);
  }
  Storage.set(key, args.serialize());
}

// Helper to load project donors (addresses as strings)
function loadProjectDonors(projectId: u64): string[] {
  const key = new Args().add(PROJECT_DONORS_KEY_PREFIX).add(projectId).serialize();
  if (!Storage.has(key)) {
    return [];
  }
  const data = Storage.get(key);
  const args = new Args(data);
  const length = args.nextU64().expect('Failed to deserialize length');
  const donors: string[] = [];
  for (let i: u64 = 0; i < length; i++) {
    donors.push(args.nextString().expect('Failed to deserialize donor address'));
  }
  return donors;
}

// Helper to get the next available update ID for a project
function getNextUpdateId(projectId: u64): u64 {
  const key = new Args().add(PROJECT_UPDATES_KEY_PREFIX).add(projectId).add(stringToBytes('next_id')).serialize();
  let nextId: u64 = 0;
  if (Storage.has(key)) {
      const storedId = Storage.get(key);
      nextId = new Args(storedId).nextU64().expect('Failed to deserialize next update ID');
  }
  return nextId;
}

// Helper to increment the next update ID for a project
function incrementNextUpdateId(projectId: u64): void {
  const key = new Args().add(PROJECT_UPDATES_KEY_PREFIX).add(projectId).add(stringToBytes('next_id')).serialize();
  let nextId = getNextUpdateId(projectId);
  nextId++;
  Storage.set(key, new Args().add(nextId).serialize());
}

// Update addProjectUpdate to accept image
export function addProjectUpdate(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');
  const title = args.nextString().expect('Missing update title');
  const content = args.nextString().expect('Missing update content');
  const image = args.nextString().expect('Missing update image');

  const projectKey = new Args().add(PROJECTS_KEY).add(projectId).serialize();
  assert(Storage.has(projectKey), `Project with ID ${projectId} not found`);

  let project = new Project();
  project.deserialize(Storage.get(projectKey));

  assert(Context.caller().toString() == project.creator.toString(), "Only project creator can add updates");

  const updateId = getNextUpdateId(projectId);
  const newUpdate = new ProjectUpdate();
  newUpdate.id = updateId.toString(); // Convert u64 to string for ProjectUpdate ID
  newUpdate.date = Context.currentPeriod().toString(); // Use current period as a timestamp for simplicity
  newUpdate.title = title;
  newUpdate.content = content;
  newUpdate.author = Context.caller().toString(); // Author is the caller
  newUpdate.image = image;

  const updateKey = new Args().add(PROJECT_UPDATES_KEY_PREFIX).add(projectId).add(updateId).serialize();
  Storage.set(updateKey, newUpdate.serialize());
  incrementNextUpdateId(projectId);

  generateEvent(UPDATE_ADDED_EVENT);
}

// getProjectUpdates already returns all fields, so no change needed
export function getProjectUpdates(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');

  const updates: ProjectUpdate[] = [];
  let currentUpdateId: u64 = 0;
  while (true) {
    const updateKey = new Args().add(PROJECT_UPDATES_KEY_PREFIX).add(projectId).add(currentUpdateId).serialize();
    if (Storage.has(updateKey)) {
      let update = new ProjectUpdate();
      update.deserialize(Storage.get(updateKey));
      updates.push(update);
      currentUpdateId++;
    } else {
      break;
    }
  }
  
  const returnArgs = new Args();
  returnArgs.addSerializableObjectArray(updates);
  return returnArgs.serialize();
}

// New function to get the total amount of MAS donated across all projects
export function getTotalDonations(_: StaticArray<u8>): StaticArray<u8> {
  assert(Storage.has(TOTAL_DONATIONS_KEY), "Total donations not initialized");
  return Storage.get(TOTAL_DONATIONS_KEY);
}

// New function to get the total number of projects that have received funding
export function getTotalProjectsFunded(_: StaticArray<u8>): StaticArray<u8> {
  let fundedProjectsCount: u64 = 0;
  let projectCount = getNextProjectId(); // Total number of projects created

  for (let i: u64 = 0; i < projectCount; i++) {
    const projectKey = new Args().add(PROJECTS_KEY).add(i).serialize();
    if (Storage.has(projectKey)) {
      const projectData = Storage.get(projectKey);
      const project = new Project();
      project.deserialize(projectData);
      if (project.amountRaised > 0) {
        fundedProjectsCount++;
      }
    }
  }
  return new Args().add(fundedProjectsCount).serialize();
}

// New function to get the total number of unique supporters
export function getTotalSupporters(_: StaticArray<u8>): StaticArray<u8> {
  assert(Storage.has(TOTAL_SUPPORTERS_KEY), "Total supporters not initialized");
  return Storage.get(TOTAL_SUPPORTERS_KEY);
}

// New function to get the number of unique supporters for a specific project
export function getProjectSupportersCount(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');
  const projectDonors = loadProjectDonors(projectId);
  return new Args().add(projectDonors.length as u64).serialize();
}

// Helper to load user-specific vesting schedule IDs
function loadUserVestingSchedules(userAddress: Address): u64[] {
  const key = new Args().add(USER_VESTING_SCHEDULES_KEY_PREFIX).add(userAddress as Serializable).serialize();
  if (!Storage.has(key)) {
    return [];
  }
  const data = Storage.get(key);
  const args = new Args(data);
  const length = args.nextU64().expect('Failed to deserialize length');
  const vestingIds: u64[] = [];
  for (let i: u64 = 0; i < length; i++) {
    vestingIds.push(args.nextU64().expect('Failed to deserialize vesting ID'));
  }
  return vestingIds;
}

// Helper to store user-specific vesting schedule IDs
function storeUserVestingSchedules(userAddress: Address, vestingIds: u64[]): void {
  const key = new Args().add(USER_VESTING_SCHEDULES_KEY_PREFIX).add(userAddress as Serializable).serialize();
  const args = new Args();
  args.add<u64>(vestingIds.length as u64);
  for (let i: u64 = 0; i < (vestingIds.length as u64); i++) {
    args.add<u64>(vestingIds[i as i32]);
  }
  Storage.set(key, args.serialize());
}

export function getUserVestingSchedules(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const userAddress = new Address(args.nextString().expect('Missing user address'));
  const vestingIds = loadUserVestingSchedules(userAddress);
  const returnArgs = new Args();
  returnArgs.add<u64>(vestingIds.length as u64);
  for (let i: u64 = 0; i < (vestingIds.length as u64); i++) {
    returnArgs.add<u64>(vestingIds[i as i32]);
  }
  return returnArgs.serialize();
}

export function getProjectCreationDate(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');
  const projectKey = new Args().add(PROJECTS_KEY).add(projectId).serialize();
  assert(Storage.has(projectKey), `Project with ID ${projectId} not found`);

  let project = new Project();
  project.deserialize(Storage.get(projectKey));

  return new Args().add(project.creationPeriod).serialize();
}

export function getCurrentMassaPeriod(_: StaticArray<u8>): StaticArray<u8> {
  return new Args().add(Context.currentPeriod()).serialize();
}

function loadProjectVestingSchedules(projectId: u64): u64[] {
  const key = new Args().add(PROJECT_VESTING_SCHEDULES_KEY_PREFIX).add(projectId).serialize();
  if (!Storage.has(key)) return [];
  const data = Storage.get(key);
  const args = new Args(data);
  const length = args.nextU64().expect('Failed to deserialize length');
  const vestingIds: u64[] = [];
  for (let i: u64 = 0; i < length; i++) {
    vestingIds.push(args.nextU64().expect('Failed to deserialize vesting ID'));
  }
  return vestingIds;
}

function storeProjectVestingSchedules(projectId: u64, vestingIds: u64[]): void {
  const key = new Args().add(PROJECT_VESTING_SCHEDULES_KEY_PREFIX).add(projectId).serialize();
  const args = new Args();
  args.add<u64>(vestingIds.length as u64);
  for (let i: u64 = 0; i < (vestingIds.length as u64); i++) {
    args.add<u64>(vestingIds[i as i32]);
  }
  Storage.set(key, args.serialize());
}

// New function to get all vesting schedules for a project
export function getProjectVestingSchedules(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');
  const vestingIds = loadProjectVestingSchedules(projectId);
  const returnArgs = new Args();
  returnArgs.add<u64>(vestingIds.length as u64);
  for (let i: u64 = 0; i < (vestingIds.length as u64); i++) {
    returnArgs.add<u64>(vestingIds[i as i32]);
  }
  return returnArgs.serialize();
}

// Helper to store donor amount for a project
function storeProjectDonorAmount(projectId: u64, donor: Address, amount: u64): void {
  const key = new Args().add(PROJECT_DONOR_AMOUNTS_KEY_PREFIX).add(projectId).add(donor as Serializable).serialize();
  Storage.set(key, new Args().add(amount).serialize());
}

// Helper to load donor amount for a project
function loadProjectDonorAmount(projectId: u64, donor: Address): u64 {
  const key = new Args().add(PROJECT_DONOR_AMOUNTS_KEY_PREFIX).add(projectId).add(donor as Serializable).serialize();
  if (!Storage.has(key)) return 0;
  return new Args(Storage.get(key)).nextU64().expect('Failed to deserialize donor amount');
}

// Helper to get all project IDs a user has donated to
function getAllProjectsUserDonatedTo(user: Address): u64[] {
  let donatedProjectIds: u64[] = [];
  let projectCount = getNextProjectId();
  for (let i: u64 = 0; i < projectCount; i++) {
    const amount = loadProjectDonorAmount(i, user);
    if (amount > 0) {
      donatedProjectIds.push(i);
    }
  }
  return donatedProjectIds;
}

// New getter: getUserDonations(address) -> returns array of {projectId, amount}
export function getUserDonations(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const userAddress = new Address(args.nextString().expect('Missing user address'));
  const donatedProjectIds = getAllProjectsUserDonatedTo(userAddress);
  const returnArgs = new Args();
  returnArgs.add<u64>(donatedProjectIds.length as u64);
  for (let i: u64 = 0; i < (donatedProjectIds.length as u64); i++) {
    const pid = donatedProjectIds[i as i32];
    const amount = loadProjectDonorAmount(pid, userAddress);
    returnArgs.add<u64>(pid);
    returnArgs.add<u64>(amount);
  }
  return returnArgs.serialize();
}

// New class to track voting session
class VotingSession implements Serializable {
  constructor(
    public isActive: bool = false,
    public startPeriod: u64 = 0,
    public endPeriod: u64 = 0,
    public totalVotingPower: u64 = 0,
    public continueVotes: u64 = 0,
    public stopVotes: u64 = 0
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.isActive)
      .add(this.startPeriod)
      .add(this.endPeriod)
      .add(this.totalVotingPower)
      .add(this.continueVotes)
      .add(this.stopVotes)
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: u64 = 0): Result<i32> {
    const args = new Args(data, i32(offset));
    this.isActive = args.nextBool().expect('Failed to deserialize isActive');
    this.startPeriod = args.nextU64().expect('Failed to deserialize startPeriod');
    this.endPeriod = args.nextU64().expect('Failed to deserialize endPeriod');
    this.totalVotingPower = args.nextU64().expect('Failed to deserialize totalVotingPower');
    this.continueVotes = args.nextU64().expect('Failed to deserialize continueVotes');
    this.stopVotes = args.nextU64().expect('Failed to deserialize stopVotes');
    return new Result(args.offset);
  }
}

// New class to track individual votes
class Vote implements Serializable {
  constructor(
    public voter: Address = new Address(''),
    public votingPower: u64 = 0,
    public vote: bool = false // true for continue, false for stop
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.voter as Serializable)
      .add(this.votingPower)
      .add(this.vote)
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: u64 = 0): Result<i32> {
    const args = new Args(data, i32(offset));
    this.voter = args.nextSerializable<Address>().expect('Failed to deserialize voter');
    this.votingPower = args.nextU64().expect('Failed to deserialize votingPower');
    this.vote = args.nextBool().expect('Failed to deserialize vote');
    return new Result(args.offset);
  }
}

// Helper to get the storage key for a vesting schedule's voting session
function getVotingSessionKey(vestingId: u64): StaticArray<u8> {
  return new Args().add(VESTING_VOTING_SESSION_KEY_PREFIX).add(vestingId).serialize();
}

// Helper to get the storage key for a vesting schedule's votes
function getVotesKey(vestingId: u64): StaticArray<u8> {
  return new Args().add(VESTING_VOTES_KEY_PREFIX).add(vestingId).serialize();
}

// Function to start a voting session for a vesting schedule
function startVotingSession(vestingId: u64, projectId: u64): void {
  const scheduleKey = getVestingScheduleKey(vestingId);
  assert(Storage.has(scheduleKey), `Vesting schedule ${vestingId} not found`);
  
  let schedule = new vestingSchedule();
  schedule.deserialize(Storage.get(scheduleKey));
  
  // Get all project donors and their amounts
  const donors = loadProjectDonors(projectId);
  let totalVotingPower: u64 = 0;
  
  // Calculate total voting power
  for (let i: u64 = 0; i < (donors.length as u64); i++) {
    const donor = new Address(donors[i as i32]);
    const amount = loadProjectDonorAmount(projectId, donor);
    totalVotingPower += amount;
  }
  
  const currentPeriod = Context.currentPeriod();
  const votingSession = new VotingSession(
    true, // isActive
    currentPeriod, // startPeriod
    currentPeriod + 10, // endPeriod (10 periods from now)
    totalVotingPower,
    0, // continueVotes
    0  // stopVotes
  );
  
  Storage.set(getVotingSessionKey(vestingId), votingSession.serialize());
  generateEvent(`Voting session started for vesting schedule ${vestingId}`);
}

// Function to vote on a release
export function voteOnRelease(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const vestingId = args.nextU64().expect('Missing vesting ID');
  const vote = args.nextBool().expect('Missing vote');
  
  const scheduleKey = getVestingScheduleKey(vestingId);
  assert(Storage.has(scheduleKey), `Vesting schedule ${vestingId} not found`);
  
  let schedule = new vestingSchedule();
  schedule.deserialize(Storage.get(scheduleKey));
  
  const votingSessionKey = getVotingSessionKey(vestingId);
  assert(Storage.has(votingSessionKey), `No active voting session for vesting schedule ${vestingId}`);
  
  let votingSession = new VotingSession();
  votingSession.deserialize(Storage.get(votingSessionKey));
  
  const currentPeriod = Context.currentPeriod();
  assert(votingSession.isActive && currentPeriod <= votingSession.endPeriod, 
    `Voting session is not active or has ended for vesting schedule ${vestingId}`);
  
  const caller = Context.caller();
  
  // Get all project donors to find the project ID
  let projectId: u64 = 0;
  let foundProject = false;
  let projectCount = getNextProjectId();
  
  for (let i: u64 = 0; i < projectCount; i++) {
    const projectVestingSchedules = loadProjectVestingSchedules(i);
    for (let j: u64 = 0; j < (projectVestingSchedules.length as u64); j++) {
      if (projectVestingSchedules[j as i32] === vestingId) {
        projectId = i;
        foundProject = true;
        break;
      }
    }
    if (foundProject) break;
  }
  
  assert(foundProject, `Could not find project for vesting schedule ${vestingId}`);
  
  // Check if caller is a donor
  const donorAmount = loadProjectDonorAmount(projectId, caller);
  assert(donorAmount > 0, `Caller is not a donor for project ${projectId}`);
  
  // Check if caller has already voted
  const votesKey = getVotesKey(vestingId);
  let votes: Vote[] = [];
  if (Storage.has(votesKey)) {
    const votesData = Storage.get(votesKey);
    const votesResult = bytesToSerializableObjectArray<Vote>(votesData);
    if (votesResult.isOk()) {
      votes = votesResult.unwrap();
    }
    
    // Check if caller has already voted
    for (let i: u64 = 0; i < (votes.length as u64); i++) {
      if (votes[i as i32].voter.equals(caller)) {
        assert(false, `Caller has already voted for vesting schedule ${vestingId}`);
      }
    }
  }
  
  // Add new vote
  const newVote = new Vote(caller, donorAmount, vote);
  votes.push(newVote);
  Storage.set(votesKey, serializableObjectsArrayToBytes(votes));
  
  // Update voting session
  if (vote) {
    votingSession.continueVotes += donorAmount;
  } else {
    votingSession.stopVotes += donorAmount;
  }
  Storage.set(votingSessionKey, votingSession.serialize());
  
  generateEvent(`Vote recorded for vesting schedule ${vestingId}: ${vote ? 'continue' : 'stop'} with power ${donorAmount}`);
}

// Function to process voting results
function processVotingResult(vestingId: u64, projectId: u64): bool {
  const votingSessionKey = getVotingSessionKey(vestingId);
  assert(Storage.has(votingSessionKey), `No voting session found for vesting schedule ${vestingId}`);
  
  let votingSession = new VotingSession();
  votingSession.deserialize(Storage.get(votingSessionKey));
  
  const currentPeriod = Context.currentPeriod();
  assert(currentPeriod > votingSession.endPeriod, `Voting period has not ended for vesting schedule ${vestingId}`);
  
  // Calculate if stop votes have majority
  const stopVotesPercentage = (votingSession.stopVotes * 100) / votingSession.totalVotingPower;
  
  if (stopVotesPercentage > 50) {
    // Stop votes have majority, return funds to donors
    const scheduleKey = getVestingScheduleKey(vestingId);
    let schedule = new vestingSchedule();
    schedule.deserialize(Storage.get(scheduleKey));
    
    const remainingAmount = schedule.totalAmount - schedule.amountClaimed;
    if (remainingAmount > 0) {
      // Get all donors and their amounts
      const donors = loadProjectDonors(projectId);
      for (let i: u64 = 0; i < (donors.length as u64); i++) {
        const donor = new Address(donors[i as i32]);
        const donorAmount = loadProjectDonorAmount(projectId, donor);
        const donorPercentage = (donorAmount * 100) / schedule.totalAmount;
        const refundAmount = (remainingAmount * donorPercentage) / 100;
        
        if (refundAmount > 0) {
          Coins.transferCoins(donor, refundAmount);
          generateEvent(`Refunded ${refundAmount} MAS to ${donor.toString()} for vesting schedule ${vestingId}`);
        }
      }
    }
    
    // Mark vesting schedule as completed
    schedule.isCompleted = true;
    Storage.set(scheduleKey, schedule.serialize());
    generateEvent(`Vesting schedule ${vestingId} marked as completed due to stop vote majority`);
    
    return false; // Return false to indicate release should not proceed
  }
  
  return true; // Return true to indicate release should proceed
}

// New getter function for voting session
export function getVotingSession(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const vestingId = args.nextU64().expect('Missing vesting ID');
  
  const votingSessionKey = getVotingSessionKey(vestingId);
  assert(Storage.has(votingSessionKey), `No voting session found for vesting schedule ${vestingId}`);
  
  return Storage.get(votingSessionKey);
}

// New getter function for votes
export function getVotes(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const vestingId = args.nextU64().expect('Missing vesting ID');
  
  const votesKey = getVotesKey(vestingId);
  if (!Storage.has(votesKey)) {
    // Return empty array if no votes exist
    return new Args().add<u64>(0).serialize();
  }
  
  return Storage.get(votesKey);
}

// New getter function for project supporters with amounts
export function getProjectSupporters(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');
  
  const donors = loadProjectDonors(projectId);
  const returnArgs = new Args();
  returnArgs.add<u64>(donors.length as u64);
  
  for (let i: u64 = 0; i < (donors.length as u64); i++) {
    const donor = new Address(donors[i as i32]);
    const amount = loadProjectDonorAmount(projectId, donor);
    returnArgs.add(donor as Serializable);
    returnArgs.add(amount);
  }
  
  return returnArgs.serialize();
}

// New getter function for supporter's donation amount
export function getSupporterDonationAmount(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');
  const supporterAddress = args.nextString().expect('Missing supporter address');
  
  const supporter = new Address(supporterAddress);
  const amount = loadProjectDonorAmount(projectId, supporter);
  
  return new Args().add(amount).serialize();
}

// New class to hold detailed project information
class ProjectDetails implements Serializable {
  constructor(
    public createdPeriod: u64 = 0,
    public lockEndPeriod: u64 = 0,
    public isLocked: bool = false,
    public isFundingComplete: bool = false,
    public isVestingCompleted: bool = false,
    public hasStartedReleasing: bool = false,
    public totalReleases: u64 = 0,
    public claimedReleases: u64 = 0,
    public nextReleasePeriod: u64 = 0,
    public firstReleasePeriod: u64 = 0,
    public lastReleasePeriod: u64 = 0,
    public currentPeriod: u64 = 0,
    public releasePercentage: u64 = 0,
    public releaseInterval: u64 = 0,
    public claimedAmount: u64 = 0,
    public totalAmount: u64 = 0
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.createdPeriod)
      .add(this.lockEndPeriod)
      .add(this.isLocked)
      .add(this.isFundingComplete)
      .add(this.isVestingCompleted)
      .add(this.hasStartedReleasing)
      .add(this.totalReleases)
      .add(this.claimedReleases)
      .add(this.nextReleasePeriod)
      .add(this.firstReleasePeriod)
      .add(this.lastReleasePeriod)
      .add(this.currentPeriod)
      .add(this.releasePercentage)
      .add(this.releaseInterval)
      .add(this.claimedAmount)
      .add(this.totalAmount)
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: u64 = 0): Result<i32> {
    const args = new Args(data, i32(offset));
    this.createdPeriod = args.nextU64().expect('Failed to deserialize createdPeriod');
    this.lockEndPeriod = args.nextU64().expect('Failed to deserialize lockEndPeriod');
    this.isLocked = args.nextBool().expect('Failed to deserialize isLocked');
    this.isFundingComplete = args.nextBool().expect('Failed to deserialize isFundingComplete');
    this.isVestingCompleted = args.nextBool().expect('Failed to deserialize isVestingCompleted');
    this.hasStartedReleasing = args.nextBool().expect('Failed to deserialize hasStartedReleasing');
    this.totalReleases = args.nextU64().expect('Failed to deserialize totalReleases');
    this.claimedReleases = args.nextU64().expect('Failed to deserialize claimedReleases');
    this.nextReleasePeriod = args.nextU64().expect('Failed to deserialize nextReleasePeriod');
    this.firstReleasePeriod = args.nextU64().expect('Failed to deserialize firstReleasePeriod');
    this.lastReleasePeriod = args.nextU64().expect('Failed to deserialize lastReleasePeriod');
    this.currentPeriod = args.nextU64().expect('Failed to deserialize currentPeriod');
    this.releasePercentage = args.nextU64().expect('Failed to deserialize releasePercentage');
    this.releaseInterval = args.nextU64().expect('Failed to deserialize releaseInterval');
    this.claimedAmount = args.nextU64().expect('Failed to deserialize claimedAmount');
    this.totalAmount = args.nextU64().expect('Failed to deserialize totalAmount');
    return new Result(args.offset);
  }
}

// Function to get detailed project information
export function getProjectDetails(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');

  const projectKey = new Args().add(PROJECTS_KEY).add(projectId).serialize();
  assert(Storage.has(projectKey), `Project with ID ${projectId} not found`);

  let project = new Project();
  project.deserialize(Storage.get(projectKey));

  const currentPeriod = Context.currentPeriod();
  const lockEndPeriod = project.creationPeriod + project.lockPeriod;
  const isLocked = currentPeriod <= lockEndPeriod;
  const isFundingComplete = project.amountRaised >= project.fundingGoal;

  // Get vesting schedule information
  let isVestingCompleted: bool = false;
  let hasStartedReleasing: bool = false;
  let totalReleases: u64 = 0;
  let claimedReleases: u64 = 0;
  let nextReleasePeriod: u64 = 0;
  let firstReleasePeriod: u64 = 0;
  let lastReleasePeriod: u64 = 0;
  let releasePercentage: u64 = project.releasePercentage;
  let releaseInterval: u64 = project.releaseInterval;
  let claimedAmount: u64 = 0;
  let totalAmount: u64 = 0;

  const scheduleKey = getVestingScheduleKey(project.vestingScheduleId);
  if (Storage.has(scheduleKey)) {
    let schedule = new vestingSchedule();
    schedule.deserialize(Storage.get(scheduleKey));

    isVestingCompleted = schedule.isCompleted;
    hasStartedReleasing = schedule.amountClaimed > 0;
    releasePercentage = schedule.releasePercentage;
    releaseInterval = schedule.releaseInterval;
    claimedAmount = schedule.amountClaimed;
    totalAmount = schedule.totalAmount;
    // Calculate total releases needed
    if (schedule.releasePercentage > 0) {
      totalReleases = (100 + schedule.releasePercentage - 1) / schedule.releasePercentage; // Ceiling division
    }
    // Calculate claimed releases
    if (schedule.amountClaimed > 0 && schedule.totalAmount > 0 && schedule.releasePercentage > 0) {
      claimedReleases = (schedule.amountClaimed * 100) / (schedule.totalAmount * schedule.releasePercentage);
    }
    nextReleasePeriod = schedule.nextReleasePeriod;
    firstReleasePeriod = project.creationPeriod + project.lockPeriod;
    lastReleasePeriod = firstReleasePeriod + (totalReleases - 1) * schedule.releaseInterval;
  }

  const details = new ProjectDetails(
    project.creationPeriod,
    lockEndPeriod,
    isLocked,
    isFundingComplete,
    isVestingCompleted,
    hasStartedReleasing,
    totalReleases,
    claimedReleases,
    nextReleasePeriod,
    firstReleasePeriod,
    lastReleasePeriod,
    currentPeriod,
    releasePercentage,
    releaseInterval,
    claimedAmount,
    totalAmount
  );

  return details.serialize();
}