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
      byteToBool
    } from '@massalabs/as-types';
import {
cancelCall,
NEXT_CALL_ID_KEY,
registerCall,
TASK_COUNT_KEY,
processTask
} from '../internals';
import { u256 } from 'as-bignum/assembly';

  
// Storage keys
export const PROJECTS_KEY = stringToBytes('projects');
export const PROJECT_COUNT_KEY = stringToBytes('projectCount');
export const VESTING_CONTRACT_ADDRESS_KEY = stringToBytes('vestingContractAddress');
export const OWNER_KEY = stringToBytes('owner');
export const VESTING_SCHEDULES_KEY_PREFIX = stringToBytes('vestingSchedules::');
export const NEXT_VESTING_ID_KEY = stringToBytes('nextVestingId');
export const PROJECT_UPDATES_KEY_PREFIX = stringToBytes('projectUpdates::');

// Event names
export const PROJECT_CREATED_EVENT = 'PROJECT_CREATED';
export const PROJECT_FUNDED_EVENT = 'PROJECT_FUNDED';
export const VESTING_SCHEDULE_CREATED_EVENT = 'VESTING_SCHEDULE_CREATED';
export const VESTING_SCHEDULE_UPDATED_EVENT = 'VESTING_SCHEDULE_UPDATED';
export const VESTING_SCHEDULE_COMPLETED_EVENT = 'VESTING_SCHEDULE_COMPLETED';
export const TOKENS_RELEASED_EVENT = 'TOKENS_RELEASED';

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
  public initialVestingTriggered: bool = false // Flag to indicate if initial vesting has been triggered
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
const lockPeriod = args.nextU64().expect('Missing lock period');
const releaseInterval = args.nextU64().expect('Missing release interval');
const releasePercentage = args.nextU64().expect('Missing release percentage');
const image = args.nextString().expect('Missing image');

assert(fundingGoal > 0, "Funding goal must be greater than 0");
assert(title.length > 0, "Title cannot be empty");
assert(description.length > 0, "Description cannot be empty");
assert(releasePercentage > 0 && releasePercentage <= 100, "Release percentage must be between 1 and 100");
assert(releaseInterval > 0, "Release interval must be greater than 0");

const projectId = getNextProjectId();
const creator = Context.caller();
const beneficiary = new Address(beneficiaryAddress);
const creationPeriod = Context.currentPeriod();

const newProject = new Project(
  projectId,
  creator,
  title,
  description,
  fundingGoal,
  0, // Initial amount raised is 0
  beneficiary,
  category,
  lockPeriod,
  releaseInterval,
  releasePercentage,
  image,
  creationPeriod,
  0, // Initialize vestingScheduleId to 0
  false // Initialize initialVestingTriggered to false
);

Storage.set(
  new Args().add(PROJECTS_KEY).add(projectId).serialize(),
  newProject.serialize()
);

// Initialize updates storage for the new project
Storage.set(getProjectUpdatesKey(projectId), new Args().add([] as string[]).serialize());

incrementProjectCount();

generateEvent(PROJECT_CREATED_EVENT);

// Schedule the initial vesting trigger call
const triggerPeriod = creationPeriod + lockPeriod;
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

generateEvent(`Initial vesting trigger scheduled for project ${projectId} at period ${triggerSlot.period}`);
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

  for (let i: u64 = 0; i < projectCount; i++) {
    const projectKey = new Args().add(PROJECTS_KEY).add(i).serialize();
    // Check if a project exists at this potential ID
    if (Storage.has(projectKey)) {
      // Since the project exists, we add its ID to the list
      projectIds.push(i);
    }
  }

  const args = new Args();
  // Add the array length first
  args.add<u64>(projectIds.length);
  // Then add each U64 ID individually
  for (let i = 0; i < projectIds.length; i++) {
    args.add(projectIds[i]);
  }

  generateEvent(`Returning ${projectIds.length} project IDs (via getAllProjects).`);

  return args.serialize();
}

export function fundProject(binArgs: StaticArray<u8>): void {
const args = new Args(binArgs);
const projectId = args.nextU64().expect('Missing project ID');

// Get the amount of MAS sent with the call
const amountSent = Context.transferredCoins();
assert(amountSent > 0, "Must send MAS to fund a project");

// Construct the storage key for the project
const projectKey = new Args().add(PROJECTS_KEY).add(projectId).serialize();

// Check if the project exists
assert(Storage.has(projectKey), `Project with ID ${projectId} not found`);

// Get and deserialize the project
const projectData = Storage.get(projectKey);
let project = new Project();
project.deserialize(projectData);

// Add the amount to the total raised
project.amountRaised += amountSent;

// Save the updated project back to storage
Storage.set(projectKey, project.serialize());

generateEvent(PROJECT_FUNDED_EVENT);

// If initial vesting has been triggered, call addToVestingSchedule (internal call)
if (project.initialVestingTriggered) {
    // Ensure the vesting schedule ID is set
    assert(project.vestingScheduleId > 0, `Vesting schedule ID not set for project ${projectId} after initial trigger`);

    // Call addToVestingSchedule internally
    addToVestingScheduleInternal(project.vestingScheduleId, amountSent);

    generateEvent(VESTING_SCHEDULE_UPDATED_EVENT);
}
// Note: If initial vesting hasn't been triggered yet, the funds are just added to amountRaised.
// The triggerInitialVesting function will handle vesting the total amount at the lock end.
}

export function addUpdate(binArgs: StaticArray<u8>): void {
const args = new Args(binArgs);
const projectId = args.nextU64().expect('Missing project ID');
const updateMessage = args.nextString().expect('Missing update message');

const projectKey = new Args().add(PROJECTS_KEY).add(projectId).serialize();

assert(Storage.has(projectKey), `Project with ID ${projectId} not found`);

let project = new Project();
project.deserialize(Storage.get(projectKey));

// Check if the caller is the project creator
assert(Context.caller().equals(project.creator), "Only the project creator can add updates");

const updatesKey = getProjectUpdatesKey(projectId);

// Retrieve existing updates or initialize an empty array
let updates: string[] = [];
if (Storage.has(updatesKey)) {
    const updatesData = Storage.get(updatesKey);
    // Deserialize the array of strings
    updates = new Args(updatesData).nextStringArray().expect('Failed to deserialize project updates');
}

// Add the new update
updates.push(updateMessage);

// Serialize and save the updated updates array
Storage.set(updatesKey, new Args().add(updates).serialize());

generateEvent(`Update added to project ${projectId}`);
}

// New function to get project updates
export function getProjectUpdates(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID');

  const updatesKey = getProjectUpdatesKey(projectId);

  // Check if updates exist for this project
  if (!Storage.has(updatesKey)) {
      return new Args().add([] as string[]).serialize(); // Return empty array if no updates
  }

  // Get and return the serialized updates array
  return Storage.get(updatesKey);
}

// New function to trigger the initial vesting schedule
export function triggerInitialVesting(binArgs: StaticArray<u8>): void {
  // Note: This function is called by a deferred call, Context.caller() will be the contract itself.

  const args = new Args(binArgs);
  const projectId = args.nextU64().expect('Missing project ID for vesting trigger');

  const projectKey = new Args().add(PROJECTS_KEY).add(projectId).serialize();
  assert(Storage.has(projectKey), `Project with ID ${projectId} not found for vesting trigger`);

  let project = new Project();
  project.deserialize(Storage.get(projectKey));

  // Ensure initial vesting hasn't been triggered already
  assert(!project.initialVestingTriggered, `Initial vesting already triggered for project ${projectId}`);

  // Get the amount raised at the end of the lock period
  const amountToVest = project.amountRaised;

  // If no funds were raised, no vesting schedule is needed
  if (amountToVest === 0) {
      generateEvent(`No funds raised for project ${projectId} during lock period. Initial vesting skipped.`);
      project.initialVestingTriggered = true; // Mark as triggered to prevent future triggers
      Storage.set(projectKey, project.serialize());
      return;
  }

  // Call createVestingSchedule internally
  // Need to pass beneficiary, amountToVest, lockPeriod (from project), releaseInterval, releasePercentage
  // createVestingScheduleInternal will generate the vestingId
  const vestingScheduleId = createVestingScheduleInternal(
      project.beneficiary,
      amountToVest,
      // Pass 0 for lock period to the vesting contract, as the lock is handled by this deferred call timing
      0 as u64,
      project.releaseInterval,
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
let amountToRelease = (schedule.totalAmount * schedule.releasePercentage) / 100;
let remainingAmount = schedule.totalAmount - schedule.amountClaimed;

if (amountToRelease > remainingAmount) {
  amountToRelease = remainingAmount; // Ensure we don't release more than remains
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