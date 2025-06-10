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
import { u256 } from 'as-bignum/assembly';

export const PERIODS_PER_DAY: u64 = 86400 / 15;
 
// Storage keys
export const PROJECTS_KEY = stringToBytes('projects');
export const PROJECT_COUNT_KEY = stringToBytes('projectCount');
export const VESTING_CONTRACT_ADDRESS_KEY = stringToBytes('vestingContractAddress');
export const OWNER_KEY = stringToBytes('owner');
export const VESTING_SCHEDULES_KEY_PREFIX = stringToBytes('vesting_schedule_');
export const NEXT_VESTING_ID_KEY = stringToBytes('next_vesting_id');
export const TOTAL_DONATIONS_KEY = stringToBytes('total_donations');
export const TOTAL_SUPPORTERS_KEY = stringToBytes('total_supporters');
export const DONATORS_KEY_PREFIX = stringToBytes('donators_');
export const PROJECT_DONORS_KEY_PREFIX = stringToBytes('project_donors_');
export const PROJECT_MILESTONES_KEY_PREFIX = stringToBytes('project_milestones_');
export const PROJECT_UPDATES_KEY_PREFIX = stringToBytes('project_updates_');
export const USER_VESTING_SCHEDULES_KEY_PREFIX = stringToBytes('user_vesting_schedules_');


// Event names
export const PROJECT_CREATED_EVENT = 'PROJECT_CREATED';
export const PROJECT_FUNDED_EVENT = 'PROJECT_FUNDED';
export const VESTING_SCHEDULE_CREATED_EVENT = 'VESTING_SCHEDULE_CREATED';
export const VESTING_SCHEDULE_UPDATED_EVENT = 'VESTING_SCHEDULE_UPDATED';
export const VESTING_SCHEDULE_COMPLETED_EVENT = 'VESTING_SCHEDULE_COMPLETED';
export const TOKENS_RELEASED_EVENT = 'TOKENS_RELEASED';
export const MILESTONE_ADDED_EVENT = 'MILESTONE_ADDED';
export const UPDATE_ADDED_EVENT = 'UPDATE_ADDED';

// Add ProjectMilestone class back
class ProjectMilestone implements Serializable {
  public id: string;
  public title: string;
  public description: string;
  public deadline: string;
  public completed: bool;
  public progress: u64;

  constructor() {
    this.id = '';
    this.title = '';
    this.description = '';
    this.deadline = '';
    this.completed = false;
    this.progress = 0;
  }

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.id)
      .add(this.title)
      .add(this.description)
      .add(this.deadline)
      .add(this.completed)
      .add(this.progress)
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: u64 = 0): Result<i32> {
    const args = new Args(data, i32(offset));
    this.id = args.nextString().expect('Failed to deserialize milestone ID');
    this.title = args.nextString().expect('Failed to deserialize milestone title');
    this.description = args.nextString().expect('Failed to deserialize milestone description');
    this.deadline = args.nextString().expect('Failed to deserialize milestone deadline');
    this.completed = args.nextBool().expect('Failed to deserialize milestone completed status');
    this.progress = args.nextU64().expect('Failed to deserialize milestone progress');
    return new Result(args.offset);
  }
}

// Add ProjectUpdate class back
class ProjectUpdate implements Serializable {
  public id: string;
  public date: string;
  public title: string;
  public content: string;
  public author: string;

  constructor() {
    this.id = '';
    this.date = '';
    this.title = '';
    this.content = '';
    this.author = '';
  }

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.id)
      .add(this.date)
      .add(this.title)
      .add(this.content)
      .add(this.author)
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: u64 = 0): Result<i32> {
    const args = new Args(data, i32(offset));
    this.id = args.nextString().expect('Failed to deserialize update ID');
    this.date = args.nextString().expect('Failed to deserialize update date');
    this.title = args.nextString().expect('Failed to deserialize update title');
    this.content = args.nextString().expect('Failed to deserialize update content');
    this.author = args.nextString().expect('Failed to deserialize update author');
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
  public nextReleasePeriod: u64 = 0 // Period of the next scheduled release
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

  return new Result(args.offset);
}
}

// Helper to get the storage key for a specific vesting schedule
function getVestingScheduleKey(id: u64): StaticArray<u8> {
  return new Args().add(VESTING_SCHEDULES_KEY_PREFIX).add(id).serialize();
}

// Helper to get the next available vesting ID
function getNextVestingId(): u64 {
  let nextId: u64 = 0;
  if (Storage.has(NEXT_VESTING_ID_KEY)) {
      const storedId = Storage.get(NEXT_VESTING_ID_KEY);
      nextId = new Args(storedId).nextU64().expect('Failed to deserialize next vesting ID');
  }
  return nextId;
}

// Helper to increment the next vesting ID
function incrementNextVestingId(): void {
  let nextId = getNextVestingId();
  nextId++;
  Storage.set(NEXT_VESTING_ID_KEY, new Args().add(nextId).serialize());
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
function getVestingContractAddress(): Address {
  assert(Storage.has(VESTING_CONTRACT_ADDRESS_KEY), "Vesting contract address not set");
  const addrBytes = Storage.get(VESTING_CONTRACT_ADDRESS_KEY);
  return new Address(bytesToString(addrBytes));
}

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
const lockPeriodInDays = args.nextU64().expect('Missing lock period');
const releaseIntervalInDays = args.nextU64().expect('Missing release interval');
const releasePercentage = args.nextU64().expect('Missing release percentage');
const image = args.nextString().expect('Missing image');

assert(fundingGoal > 0, "Funding goal must be greater than 0");
assert(title.length > 0, "Title cannot be empty");
assert(description.length > 0, "Description cannot be empty");
assert(releasePercentage > 0 && releasePercentage <= 100, "Release percentage must be between 1 and 100");
assert(releaseIntervalInDays > 0, "Release interval must be greater than 0");

const projectId = getNextProjectId();
const creator = Context.caller();
const beneficiary = new Address(beneficiaryAddress);
const creationPeriod = Context.currentPeriod();

// Convert days to Massa periods
const lockPeriodInPeriods = lockPeriodInDays * PERIODS_PER_DAY;
const releaseIntervalInPeriods = releaseIntervalInDays * PERIODS_PER_DAY;

const newProject = new Project(
  projectId,
  creator,
  title,
  description,
  fundingGoal,
  0, // Initial amount raised is 0
  beneficiary,
  category,
  lockPeriodInPeriods, // Storing lock period in periods
  releaseIntervalInPeriods, // Storing release interval in periods
  releasePercentage,
  image,
  creationPeriod,
  0, // Initialize vestingScheduleId to 0
  false, // Initialize initialVestingTriggered to false
  0 // Initialize totalAmountRaisedAtLockEnd to 0
);

Storage.set(
  new Args().add(PROJECTS_KEY).add(projectId).serialize(),
  newProject.serialize()
);

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

generateEvent(`Initial vesting trigger scheduled for project ${projectId} at period ${triggerSlot.period}. Actual lock period: ${lockPeriodInDays} days.`);
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
      20_000_000, // Gas
      0 // No coins sent with this trigger call
    );

    deferredCallRegister(
      Context.callee().toString(),
      'triggerInitialVesting',
      newTriggerSlot,
      20_000_000,
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
  const amountToVest = project.totalAmountRaisedAtLockEnd;

  // If no funds were raised, no vesting schedule is needed
  if (amountToVest === 0) {
      generateEvent(`No funds raised for project ${projectId} during lock period. Initial vesting skipped.`);
      project.initialVestingTriggered = true; // Mark as triggered to prevent future triggers
      Storage.set(projectKey, project.serialize());
      return;
  }

  // Call createVestingSchedule internally
  // Need to pass beneficiary, amountToVest, lockPeriod (0), releaseInterval, releasePercentage
  const vestingScheduleId = createVestingScheduleInternal(
      project.beneficiary,
      amountToVest,
      0 as u64, // Initial lock period is already handled by deferred calls
      project.releaseInterval, // Already in periods
      project.releasePercentage
  );

  // Store the vesting ID and mark initial vesting as triggered
  project.vestingScheduleId = vestingScheduleId;
  project.initialVestingTriggered = true;
  Storage.set(projectKey, project.serialize());

  generateEvent(`Initial vesting triggered for project ${projectId}. Schedule ID: ${vestingScheduleId}. Amount: ${amountToVest}`);
}

// --- Vesting Functions (Internal) ---

// Internal function to create a new vesting schedule
// Returns the new vesting ID
function createVestingScheduleInternal(
  beneficiary: Address,
  totalAmount: u64,
  lockPeriod: u64, // In periods
  releaseInterval: u64, // In periods
  releasePercentage: u64 // Percentage out of 100
): u64 {

assert(totalAmount > 0, "Total amount must be greater than 0");
assert(releasePercentage > 0 && releasePercentage <= 100, "Release percentage must be between 1 and 100");
assert(releaseInterval > 0, "Release interval must be greater than 0");

const vestingId = getNextVestingId();
// The start period for the first release is calculated here in the vesting logic
const startPeriod = Context.currentPeriod() + lockPeriod;

const schedule = new vestingSchedule(
  vestingId,
  beneficiary,
  totalAmount,
  0, // amountClaimed starts at 0
  lockPeriod, // Storing the initial lock period for reference
  releaseInterval,
  releasePercentage,
  startPeriod // Storing the period of the first scheduled release
);

// Store the new vesting schedule
Storage.set(getVestingScheduleKey(vestingId), schedule.serialize());

// Update user-specific vesting schedules mapping
let userVestingSchedules = loadUserVestingSchedules(beneficiary);
userVestingSchedules.push(vestingId);
storeUserVestingSchedules(beneficiary, userVestingSchedules);

// Schedule the first release call for this specific schedule
const releaseArgs = new Args().add(vestingId).serialize();
const releaseSlot = findCheapestSlot(
  startPeriod,
  startPeriod + 10, // Search window
  30_000_000, // Gas
  0 // No coins sent with the deferred call
);

deferredCallRegister(
  Context.callee().toString(), // Call this contract (itself)
  'releaseVestedTokens', // Call the internal release function
  releaseSlot,
  30_000_000, // Gas
  releaseArgs,
  0 // No coins sent with deferred call
);

generateEvent(VESTING_SCHEDULE_CREATED_EVENT);

// Return the vesting ID
return vestingId;
}

// Internal function to add funds to an existing vesting schedule
function addToVestingScheduleInternal(
  vestingId: u64,
  amountToAdd: u64 // Amount sent with the fundProject call
): void {

const scheduleKey = getVestingScheduleKey(vestingId);

// Check if the vesting schedule exists
assert(Storage.has(scheduleKey), `Vesting schedule with ID ${vestingId} not found for topping up`);

let schedule = new vestingSchedule();
schedule.deserialize(Storage.get(scheduleKey));

assert(amountToAdd > 0, "Amount to add to vesting schedule must be greater than 0");

// Add the transferred coins to the total amount
schedule.totalAmount += amountToAdd;

// Save the updated schedule
Storage.set(scheduleKey, schedule.serialize());

generateEvent(`Added ${amountToAdd} MAS to vesting schedule ID ${vestingId}. New total: ${schedule.totalAmount}`);
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
  generateEvent(`Vesting schedule with ID ${vestingId} not found or already completed.`);
  return;
}

let schedule = new vestingSchedule();
schedule.deserialize(Storage.get(scheduleKey));

// Ensure it's time for this release
const currentPeriod = Context.currentPeriod();
generateEvent(`Current period: ${currentPeriod}, Next release period for ID ${vestingId}: ${schedule.nextReleasePeriod}`);
if (currentPeriod < schedule.nextReleasePeriod) {
  generateEvent(`Not yet time for release for ID ${vestingId}`);
  return;
}

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
    // We need to handle potential transfer failures gracefully.
    // In a real scenario, you might want error handling or a pull mechanism.
    Coins.transferCoins(beneficiaryAddress, amountToRelease);
    generateEvent(TOKENS_RELEASED_EVENT);

    // Update vesting schedule
    schedule.amountClaimed += amountToRelease;
    generateEvent(`Updated amount claimed for ID ${vestingId}: ${schedule.amountClaimed}`);
}

// If there's still amount left to claim after this release
if (schedule.amountClaimed < schedule.totalAmount) {
  // Schedule the next release based on the current period + interval
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
  // Vesting completed - remove the schedule from storage
  Storage.del(scheduleKey);
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
  return new Args().add(getNextVestingId()).serialize();
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

// Helper to get the next available milestone ID for a project
function getNextMilestoneId(projectId: u64): u64 {
  const key = new Args().add(PROJECT_MILESTONES_KEY_PREFIX).add(projectId).add(stringToBytes('next_id')).serialize();
  let nextId: u64 = 0;
  if (Storage.has(key)) {
      const storedId = Storage.get(key);
      nextId = new Args(storedId).nextU64().expect('Failed to deserialize next milestone ID');
  }
  return nextId;
}

// Helper to increment the next milestone ID for a project
function incrementNextMilestoneId(projectId: u64): void {
  const key = new Args().add(PROJECT_MILESTONES_KEY_PREFIX).add(projectId).add(stringToBytes('next_id')).serialize();
  let nextId = getNextMilestoneId(projectId);
  nextId++;
  Storage.set(key, new Args().add(nextId).serialize());
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

// New function to add a milestone to a project (stored separately)
export function addMilestone(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');
  const title = args.nextString().expect('Missing milestone title');
  const description = args.nextString().expect('Missing milestone description');
  const deadline = args.nextString().expect('Missing milestone deadline');
  const progress = args.nextU64().expect('Missing milestone progress');

  const projectKey = new Args().add(PROJECTS_KEY).add(projectId).serialize();
  assert(Storage.has(projectKey), `Project with ID ${projectId} not found`);

  let project = new Project();
  project.deserialize(Storage.get(projectKey));

  assert(Context.caller().toString() == project.creator.toString(), "Only project creator can add milestones");

  const milestoneId = getNextMilestoneId(projectId);
  const newMilestone = new ProjectMilestone();
  newMilestone.id = milestoneId.toString(); // Convert u64 to string for ProjectMilestone ID
  newMilestone.title = title;
  newMilestone.description = description;
  newMilestone.deadline = deadline;
  newMilestone.progress = progress;
  newMilestone.completed = false;

  const milestoneKey = new Args().add(PROJECT_MILESTONES_KEY_PREFIX).add(projectId).add(milestoneId).serialize();
  Storage.set(milestoneKey, newMilestone.serialize());
  incrementNextMilestoneId(projectId);

  generateEvent(MILESTONE_ADDED_EVENT);
}

// New function to get all milestones for a project (retrieved separately)
export function getMilestones(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');

  const milestones: ProjectMilestone[] = [];
  let currentMilestoneId: u64 = 0;
  while (true) {
    const milestoneKey = new Args().add(PROJECT_MILESTONES_KEY_PREFIX).add(projectId).add(currentMilestoneId).serialize();
    if (Storage.has(milestoneKey)) {
      let milestone = new ProjectMilestone();
      milestone.deserialize(Storage.get(milestoneKey));
      milestones.push(milestone);
      currentMilestoneId++;
    } else {
      break;
    }
  }
  args.addSerializableObjectArray(milestones);
  return args.serialize();
}

// New function to add an update to a project (stored separately)
export function addProjectUpdate(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');
  const title = args.nextString().expect('Missing update title');
  const content = args.nextString().expect('Missing update content');

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

  const updateKey = new Args().add(PROJECT_UPDATES_KEY_PREFIX).add(projectId).add(updateId).serialize();
  Storage.set(updateKey, newUpdate.serialize());
  incrementNextUpdateId(projectId);

  generateEvent(UPDATE_ADDED_EVENT);
}

// New function to get all updates for a project (retrieved separately)
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
  
  args.addSerializableObjectArray(updates);
  return args.serialize();
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