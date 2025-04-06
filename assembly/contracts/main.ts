import {
  Context,
  Storage,
  Address,
  generateEvent,
  deferredCallRegister,
  findCheapestSlot,
} from "@massalabs/massa-as-sdk"
import { Args, Serializable, Result, bytesToString } from "@massalabs/as-types"
import { cancelCall, NEXT_CALL_ID_KEY, registerCall, TASK_COUNT_KEY } from "../internals"
import { MRC20Wrapper } from "@massalabs/sc-standards/assembly/contracts/MRC20/wrapper"
import { u256 } from "as-bignum/assembly"

// Convert all string keys to StaticArray<u8> for consistency
const VESTING_INFO_KEY = stringToBytes("vestingInfo")
const RELEASE_LOCK_KEY = stringToBytes("releaseLock")
const PAUSED_KEY = stringToBytes("paused")
const OWNER_KEY = stringToBytes("owner")
const LAST_EXECUTION_STATUS_KEY = stringToBytes("lastExecutionStatus")
const LAST_FAILED_PERIOD_KEY = stringToBytes("lastFailedPeriod")
const NFT_COUNTER_KEY = stringToBytes("NFT_COUNTER")
const NFT_OWNER_PREFIX = stringToBytes("NFT_OWNER_")
const NFT_METADATA_PREFIX = stringToBytes("NFT_METADATA_")

export { processTask } from "../internals"

class vestingSchedule implements Serializable {
  constructor(
    public beneficiary: Address = new Address(""),
    public token: Address = new Address(""),
    public totalAmount: u64 = 0,
    public amountClaimed: u64 = 0,
    public lockPeriod: u64 = 0,
    public releaseInterval: u64 = 0,
    public releasePercentage: u64 = 0,
    public nextReleasePeriod: u64 = 0,
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.beneficiary)
      .add(this.token)
      .add(this.totalAmount)
      .add(this.amountClaimed)
      .add(this.lockPeriod)
      .add(this.releaseInterval)
      .add(this.releasePercentage)
      .add(this.nextReleasePeriod)
      .serialize()
  }

  deserialize(data: StaticArray<u8>, offset: u64 = 0): Result<i32> {
    const args = new Args(data, i32(offset))

    this.beneficiary = args.nextSerializable<Address>().expect("Failed to deserialize beneficiary.")
    this.token = args.nextSerializable<Address>().expect("Failed to deserialize token.")
    this.totalAmount = args.nextU64().expect("Failed to deserialize totalAmount.")
    this.amountClaimed = args.nextU64().expect("Failed to deserialize amountClaimed.")
    this.lockPeriod = args.nextU64().expect("Failed to deserialize lockPeriod.")
    this.releaseInterval = args.nextU64().expect("Failed to deserialize releaseInterval.")
    this.releasePercentage = args.nextU64().expect("Failed to deserialize releasePercentage.")
    this.nextReleasePeriod = args.nextU64().expect("Failed to deserialize nextReleasePeriod.")

    return new Result(args.offset)
  }
}

export function constructor(binArgs: StaticArray<u8>): void {
  assert(Context.isDeployingContract(), "Not in deployment context")

  const args = new Args(binArgs)
  const period = args.nextU64().expect("Unable to decode period")

  // Store the contract owner (deployer)
  Storage.set(OWNER_KEY, stringToBytes(Context.caller().toString()))

  Storage.set(TASK_COUNT_KEY, new Args().add(0 as u64).serialize())
  registerCall(period)

  generateEvent("Contract initialized successfully")
}

export function createVestingSchedule(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs)
  const beneficiary = args.nextString().expect("Missing beneficiary address")
  const token = args.nextString().expect("Missing token address")
  const totalAmount = args.nextU64().expect("Missing total amount")
  const lockPeriod = args.nextU64().expect("Missing lock period")
  const releaseInterval = args.nextU64().expect("Missing release interval")
  const releasePercentage = args.nextU64().expect("Missing release percentage")

  // Check if contract is paused
  if (Storage.has(PAUSED_KEY)) {
    generateEvent("Contract is paused")
    return
  }

  // Validate inputs
  assert(totalAmount > 0, "Total amount must be greater than 0")
  assert(releasePercentage > 0 && releasePercentage <= 100, "Release percentage must be between 1 and 100")
  assert(releaseInterval > 0, "Release interval must be greater than 0")

  const startPeriod = Context.currentPeriod() + lockPeriod
  const schedule = new vestingSchedule(
    new Address(beneficiary),
    new Address(token),
    totalAmount,
    0,
    lockPeriod,
    releaseInterval,
    releasePercentage,
    startPeriod,
  )

  const tokenContract = new MRC20Wrapper(schedule.token)
  const callerAddress = Context.caller()
  const calleeAddress = Context.callee()

  // Check token allowance and transfer tokens to contract
  const allowance = tokenContract.allowance(callerAddress, calleeAddress)
  assert(allowance.toU64() >= totalAmount, "Insufficient allowance")

  // Get balance before transfer
  const contractBalanceBefore = tokenContract.balanceOf(calleeAddress)
  generateEvent(`Contract token balance before: ${contractBalanceBefore.toU64()}`)

  // Transfer tokens from caller to contract
  tokenContract.transferFrom(callerAddress, calleeAddress, u256.fromU64(totalAmount))

  // Verify transfer was successful
  const contractBalanceAfter = tokenContract.balanceOf(calleeAddress)
  generateEvent(`Contract token balance after: ${contractBalanceAfter.toU64()}`)
  assert(contractBalanceAfter.toU64() >= contractBalanceBefore.toU64() + totalAmount, "Token transfer failed")

  generateEvent(`Locking ${totalAmount} tokens for vesting`)

  const releaseArgs = new Args().add(beneficiary).serialize()
  const releaseSlot = findCheapestSlot(startPeriod, startPeriod + 10, 150000, releaseArgs.length)

  const callId = deferredCallRegister(
    Context.callee().toString(),
    "releaseVestedTokens",
    releaseSlot,
    2200000,
    releaseArgs,
    0,
  )
  generateEvent(`Deferred call registered with ID: ${callId}`)

  schedule.nextReleasePeriod = releaseSlot.period
  Storage.set(VESTING_INFO_KEY, schedule.serialize())

  generateEvent(`Vesting schedule created for ${beneficiary}`)
  generateEvent(`First release scheduled for period ${releaseSlot.period}`)
}

export function releaseVestedTokens(binArgs: StaticArray<u8>): void {
  generateEvent("releaseVestedTokens function called")

  if (Storage.has(PAUSED_KEY)) {
    generateEvent("Contract is paused")
    return
  }

  if (Storage.has(LAST_EXECUTION_STATUS_KEY)) {
    const lastStatus = Storage.get(LAST_EXECUTION_STATUS_KEY)
    if (bytesToString(lastStatus) === "failed") {
      generateEvent("Previous execution failed. Manual recovery required.")
      return
    }
  }

  const args = new Args(binArgs)
  const providedBeneficiary = args.nextString().expect("Missing beneficiary address")

  const storedData = Storage.get(VESTING_INFO_KEY)
  generateEvent(`Storage data length: ${storedData.length}`)
  if (storedData.length == 0) {
    generateEvent("No vesting schedule found")
    return
  }

  const schedule = new vestingSchedule()
  const deserializeResult = schedule.deserialize(storedData)
  if (deserializeResult.isErr()) {
    generateEvent(`Failed to deserialize vesting schedule`)
    Storage.del(RELEASE_LOCK_KEY)
    return
  }

  const beneficiaryAddress = new Address(providedBeneficiary)
  if (!beneficiaryAddress.equals(schedule.beneficiary)) {
    generateEvent(
      `Beneficiary mismatch: expected ${schedule.beneficiary.toString()}, got ${beneficiaryAddress.toString()}`,
    )
    return
  }

  const currentPeriod = Context.currentPeriod()
  generateEvent(`Current period: ${currentPeriod}, Next release period: ${schedule.nextReleasePeriod}`)
  if (currentPeriod < schedule.nextReleasePeriod) {
    generateEvent("Not yet time for release")
    return
  }

  if (Storage.has(RELEASE_LOCK_KEY)) {
    generateEvent("Release already in progress")
    return
  }
  Storage.set(RELEASE_LOCK_KEY, stringToBytes("locked"))

  generateEvent(`Total amount: ${schedule.totalAmount}, Already claimed: ${schedule.amountClaimed}`)
  let amountToRelease = (schedule.totalAmount * schedule.releasePercentage) / 100
  const remainingAmount = schedule.totalAmount - schedule.amountClaimed

  if (amountToRelease > remainingAmount) {
    amountToRelease = remainingAmount
    generateEvent(`Adjusted release amount to remaining: ${amountToRelease}`)
  }

  const tokenContract = new MRC20Wrapper(schedule.token)

  // Get balances before transfer
  const contractBalanceBefore = tokenContract.balanceOf(Context.callee())
  const beneficiaryBalanceBefore = tokenContract.balanceOf(schedule.beneficiary)
  generateEvent(`Contract balance before: ${contractBalanceBefore.toU64()}`)
  generateEvent(`Beneficiary balance before: ${beneficiaryBalanceBefore.toU64()}`)

  // Transfer tokens
  tokenContract.transfer(schedule.beneficiary, u256.fromU64(amountToRelease))

  // Verify transfer was successful
  const contractBalanceAfter = tokenContract.balanceOf(Context.callee())
  const beneficiaryBalanceAfter = tokenContract.balanceOf(schedule.beneficiary)
  generateEvent(`Contract balance after: ${contractBalanceAfter.toU64()}`)
  generateEvent(`Beneficiary balance after: ${beneficiaryBalanceAfter.toU64()}`)

  // Verify transfer success
  assert(beneficiaryBalanceAfter.toU64() > beneficiaryBalanceBefore.toU64(), "Token transfer failed")

  // Update vesting schedule
  schedule.amountClaimed += amountToRelease
  generateEvent(`Released ${amountToRelease} tokens to ${schedule.beneficiary.toString()}`)

  // Schedule next release only if not complete
  if (schedule.amountClaimed < schedule.totalAmount) {
    schedule.nextReleasePeriod = currentPeriod + schedule.releaseInterval
    const releaseArgs = new Args().add(providedBeneficiary).serialize()
    const newReleaseSlot = findCheapestSlot(
      schedule.nextReleasePeriod,
      schedule.nextReleasePeriod + 10,
      2200000,
      releaseArgs.length,
    )

    // Store current state before registering next call
    Storage.set(VESTING_INFO_KEY, schedule.serialize())

    const newCallId = deferredCallRegister(
      Context.callee().toString(),
      "releaseVestedTokens",
      newReleaseSlot,
      2200000,
      releaseArgs,
      0,
    )
    generateEvent(`Next release scheduled for period ${newReleaseSlot.period} with ID: ${newCallId}`)
    schedule.nextReleasePeriod = newReleaseSlot.period
  } else {
    generateEvent("Vesting schedule completed")
  }

  // Update final state
  Storage.set(VESTING_INFO_KEY, schedule.serialize())

  // Release lock
  Storage.del(RELEASE_LOCK_KEY)
}

export function getNextCallId(_: StaticArray<u8>): StaticArray<u8> {
  assert(Storage.has(NEXT_CALL_ID_KEY), "No deferred call planned")
  generateEvent("Next deferred call ID retrieved")
  return stringToBytes(Storage.get(NEXT_CALL_ID_KEY))

}

export function stop(_: StaticArray<u8>): void {
  const ownerStr = Storage.get(OWNER_KEY)
  const owner = new Address(bytesToString(ownerStr))
  assert(Context.caller().equals(owner), "Unauthorized")

  assert(Storage.has(NEXT_CALL_ID_KEY), "No deferred call to stop")
  cancelCall(Storage.get(NEXT_CALL_ID_KEY))
  generateEvent("Stopped scheduled releases")
}

// Mint an NFT as proof of contribution
export function mintContributionNFT(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs)
  const recipient = args.nextString().expect("Missing recipient address")
  const metadata = args.nextString().expect("Missing metadata")

  // Get and increment NFT counter
  let counter: u64 = 0
  if (Storage.has(NFT_COUNTER_KEY)) {
    const counterData = Storage.get(NFT_COUNTER_KEY)
    counter = new Args(counterData).nextU64().expect("Failed to read counter")
  }
  const newCounter = counter + 1

  // Generate NFT ID
  const nftId = `MF-${newCounter}`
  const nftIdBytes = stringToBytes(nftId)

  // Store NFT owner
  Storage.set(concat(NFT_OWNER_PREFIX, nftIdBytes), stringToBytes(recipient))

  // Store NFT metadata
  Storage.set(concat(NFT_METADATA_PREFIX, nftIdBytes), stringToBytes(metadata))

  // Update counter
  Storage.set(NFT_COUNTER_KEY, new Args().add(newCounter).serialize())

  generateEvent(`NFT minted: ${nftId} to ${recipient}`)

  return stringToBytes(nftId)
}

// Get the owner of an NFT
export function ownerOf(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs)
  const nftId = args.nextString().expect("Missing NFT ID")
  const nftIdBytes = stringToBytes(nftId)

  const ownerKey = concat(NFT_OWNER_PREFIX, nftIdBytes)
  assert(Storage.has(ownerKey), "NFT does not exist")

  return Storage.get(ownerKey)
}

// Get the metadata of an NFT
export function getMetadata(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs)
  const nftId = args.nextString().expect("Missing NFT ID")
  const nftIdBytes = stringToBytes(nftId)

  const metadataKey = concat(NFT_METADATA_PREFIX, nftIdBytes)
  assert(Storage.has(metadataKey), "NFT does not exist")

  return Storage.get(metadataKey)
}

// Helper function to concatenate two byte arrays
function concat(a: StaticArray<u8>, b: StaticArray<u8>): StaticArray<u8> {
  const result = new StaticArray<u8>(a.length + b.length)
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i]
  }
  for (let i = 0; i < b.length; i++) {
    result[a.length + i] = b[i]
  }
  return result
}

// Helper function to convert a string to a StaticArray<u8>
function stringToBytes(s: string): StaticArray<u8> {
  const bytes = new StaticArray<u8>(s.length)
  for (let i = 0; i < s.length; i++) {
    bytes[i] = u8(s.charCodeAt(i))
  }
  return bytes
}

