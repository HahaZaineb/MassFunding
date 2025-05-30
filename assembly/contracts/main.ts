import {
  Context,
  Storage,
  Address,
  generateEvent,
  deferredCallRegister,
  findCheapestSlot,
  Coins,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  Serializable,
  Result,
  stringToBytes,
  bytesToString
} from '@massalabs/as-types';
import {
  cancelCall,
  NEXT_CALL_ID_KEY,
  registerCall,
  TASK_COUNT_KEY,
} from '../internals';
export { processTask } from '../internals';

const VESTING_INFO_KEY = stringToBytes('vestingInfo');
const OWNER_KEY = stringToBytes('owner');
const LAST_EXECUTION_STATUS_KEY = stringToBytes('lastExecutionStatus');

class vestingSchedule implements Serializable {
  constructor(
    public beneficiary: Address = new Address(''),
    public totalAmount: u64 = 0,
    public amountClaimed: u64 = 0,
    public lockPeriod: u64 = 0,
    public releaseInterval: u64 = 0,
    public releasePercentage: u64 = 0,
    public nextReleasePeriod: u64 = 0
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.beneficiary)
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

export function constructor(binArgs: StaticArray<u8>): void {
  assert(Context.isDeployingContract(), "Not in deployment context");

  const args = new Args(binArgs);
  const period = args.nextU64().expect('Unable to decode period');
  
  Storage.set(OWNER_KEY, stringToBytes(Context.caller().toString()));
  
  Storage.set(TASK_COUNT_KEY, new Args().add(0 as u64).serialize());
  registerCall(period);
  
  generateEvent("Contract initialized successfully");
}

// ... (previous imports and constants remain the same)

export function createVestingSchedule(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs);
  const beneficiary = args.nextString().expect('Missing beneficiary address');
  const totalAmount = args.nextU64().expect('Missing total amount');
  const lockPeriod = args.nextU64().expect('Missing lock period');
  const releaseInterval = args.nextU64().expect('Missing release interval');
  const releasePercentage = args.nextU64().expect('Missing release percentage');

  assert(totalAmount > 0, "Total amount must be greater than 0");
  assert(releasePercentage > 0 && releasePercentage <= 100, "Release percentage must be between 1 and 100");
  assert(releaseInterval > 0, "Release interval must be greater than 0");

  const callerAddress = Context.caller();
  const calleeAddress = Context.callee();

  // Check if enough MAS was sent with the call
  const coinsSent = Context.transferredCoins();
  assert(coinsSent >= totalAmount, 'Insufficient MAS sent');
  generateEvent(`Coins sent with call: ${coinsSent}`);

  // Get balance before (for logging)
  const contractBalanceBefore = Coins.balanceOf(calleeAddress.toString());
  generateEvent(`Contract MAS balance before: ${contractBalanceBefore}`);

  // Transfer MAS to beneficiary immediately (for vesting setup)
  Coins.transferCoins(new Address(beneficiary), totalAmount);
  generateEvent(`Transferred ${totalAmount} MAS to beneficiary: ${beneficiary}`);

  // Get balance after transfer (for logging)
  const contractBalanceAfter = Coins.balanceOf(calleeAddress.toString());
  generateEvent(`Contract MAS balance after: ${contractBalanceAfter}`);

  // Verify transfer reduced contract balance (optional, depending on logic)
  assert(
    contractBalanceAfter <= contractBalanceBefore - totalAmount,
    "MAS transfer failed"
  );

  const startPeriod = Context.currentPeriod() + lockPeriod;

  const schedule = new vestingSchedule(
    new Address(beneficiary),
    totalAmount,
    0,
    lockPeriod,
    releaseInterval,
    releasePercentage,
    startPeriod
  );

  const releaseArgs = new Args().add(beneficiary).serialize();
  const releaseSlot = findCheapestSlot(
    startPeriod,
    startPeriod + 10,
    20_000_000,
    releaseArgs.length
  );

  const callId = deferredCallRegister(
    Context.callee().toString(),
    'releaseVestedTokens',
    releaseSlot,
    20_000_000,
    releaseArgs,
    0
  );
  generateEvent(`Deferred call registered with ID: ${callId}`);

  schedule.nextReleasePeriod = releaseSlot.period;
  Storage.set(VESTING_INFO_KEY, schedule.serialize());

  generateEvent(`Vesting schedule created for ${beneficiary}`);
  generateEvent(`First release scheduled for period ${releaseSlot.period}`);
}

export function releaseVestedTokens(binArgs: StaticArray<u8>): void {
  generateEvent('releaseVestedTokens function called');
  
  if (Storage.has(LAST_EXECUTION_STATUS_KEY)) {
    const lastStatus = Storage.get(LAST_EXECUTION_STATUS_KEY);
    if (bytesToString(lastStatus) === 'failed') {
      generateEvent('Previous execution failed.');
      return;
    }
  }
  
  const args = new Args(binArgs);
  const providedBeneficiary = args.nextString().expect('Missing beneficiary address');

  let storedData = Storage.get(VESTING_INFO_KEY);
  if (storedData.length == 0) {
    generateEvent('No vesting schedule found');
    return;
  }
  
  let schedule = new vestingSchedule();
  schedule.deserialize(storedData);

  if (!new Address(providedBeneficiary).equals(schedule.beneficiary)) {
    generateEvent('Beneficiary mismatch');
    return;
  }
  
  const currentPeriod = Context.currentPeriod();
  generateEvent(`Current period: ${currentPeriod}, Next release period: ${schedule.nextReleasePeriod}`);
  if (currentPeriod < schedule.nextReleasePeriod) {
    generateEvent('Not yet time for release');
    return;
  }

  generateEvent(`Total amount: ${schedule.totalAmount}, Already claimed: ${schedule.amountClaimed}`);
  let amountToRelease = (schedule.totalAmount * schedule.releasePercentage) / 100;
  let remainingAmount = schedule.totalAmount - schedule.amountClaimed;
  
  if (amountToRelease > remainingAmount) { 
    amountToRelease = remainingAmount; 
    generateEvent(`Adjusted release amount to remaining: ${amountToRelease}`);
  }
  
  const contractBalanceBefore = Coins.balanceOf(Context.callee().toString());
  const beneficiaryBalanceBefore = Coins.balanceOf(schedule.beneficiary.toString());
  generateEvent(`Contract MAS balance before: ${contractBalanceBefore}`);
  generateEvent(`Beneficiary MAS balance before: ${beneficiaryBalanceBefore}`);
  
  // Transfer MAS to beneficiary
  Coins.transferCoins(schedule.beneficiary, amountToRelease);
  
  // Verify transfer was successful
  const contractBalanceAfter = Coins.balanceOf(Context.callee().toString());
  const beneficiaryBalanceAfter = Coins.balanceOf(schedule.beneficiary.toString());
  generateEvent(`Contract MAS balance after: ${contractBalanceAfter}`);
  generateEvent(`Beneficiary MAS balance after: ${beneficiaryBalanceAfter}`);
  
  assert(
    beneficiaryBalanceAfter > beneficiaryBalanceBefore,
    "MAS transfer failed"
  );

  schedule.amountClaimed += amountToRelease;
  generateEvent(`Released ${amountToRelease} MAS to ${schedule.beneficiary.toString()}`);

  if (schedule.amountClaimed < schedule.totalAmount) {
    schedule.nextReleasePeriod = currentPeriod + schedule.releaseInterval;
    const releaseArgs = new Args().add(providedBeneficiary).serialize();
    const newReleaseSlot = findCheapestSlot(
      schedule.nextReleasePeriod,
      schedule.nextReleasePeriod + 10,
      20_000_000,
      releaseArgs.length
    );
    
    Storage.set(VESTING_INFO_KEY, schedule.serialize());
    
    const newCallId = deferredCallRegister(
      Context.callee().toString(),
      'releaseVestedTokens',
      newReleaseSlot,
      20_000_000,
      releaseArgs,
      0
    );
    generateEvent(`Next release scheduled for period ${newReleaseSlot.period} with ID: ${newCallId}`);
    schedule.nextReleasePeriod = newReleaseSlot.period;
  } else {
    generateEvent("Vesting schedule completed");
  }
  
  Storage.set(VESTING_INFO_KEY, schedule.serialize());
}

export function getNextCallId(_: StaticArray<u8>): StaticArray<u8> {
  assert(Storage.has(NEXT_CALL_ID_KEY), 'No deferred call planned');
  return stringToBytes(Storage.get(NEXT_CALL_ID_KEY));
}

export function stop(_: StaticArray<u8>): void {
  const ownerStr = Storage.get(OWNER_KEY);
  const owner = new Address(bytesToString(ownerStr));
  assert(Context.caller().equals(owner), "Unauthorized");
  
  assert(Storage.has(NEXT_CALL_ID_KEY), 'No deferred call to stop');
  cancelCall(Storage.get(NEXT_CALL_ID_KEY));
  generateEvent("Stopped scheduled releases");
}

export function getVestingSchedule(_: StaticArray<u8>): StaticArray<u8> {
  const data = Storage.get(VESTING_INFO_KEY);
  assert(data.length > 0, 'No vesting schedule found');

  return data;
}

export function getTotalVested(_: StaticArray<u8>): u64 {
  const data = Storage.get(VESTING_INFO_KEY);
  assert(data.length > 0, 'No vesting schedule found');

  const schedule = new vestingSchedule();
  schedule.deserialize(data);

  return schedule.amountClaimed;
}

export function getLockedAmount(_: StaticArray<u8>): StaticArray<u8> {
  const data = Storage.get(VESTING_INFO_KEY);
  assert(data.length > 0, 'No vesting schedule found');

  const schedule = new vestingSchedule();
  schedule.deserialize(data);

  return new Args().add(schedule.totalAmount - schedule.amountClaimed).serialize();
}