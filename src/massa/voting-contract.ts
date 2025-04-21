import { Context, Storage, Address, generateEvent } from "@massalabs/massa-as-sdk"
import { Args, type Serializable, Result, bytesToString } from "@massalabs/as-types"

// Key prefixes for storage
const PROPOSAL_COUNT_KEY = stringToBytes("proposal_count")
const PROPOSAL_PREFIX = stringToBytes("proposal_")
const VOTE_PREFIX = stringToBytes("vote_")
const VOTER_POWER_PREFIX = stringToBytes("voter_power_")
const PROJECT_PREFIX = stringToBytes("project_")
const OWNER_KEY = stringToBytes("owner")

// Proposal status enum
enum ProposalStatus {
  Active = 0,
  Passed = 1,
  Rejected = 2,
  Canceled = 3,
}

// Proposal class
class Proposal implements Serializable {
  constructor(
    public id: u64 = 0,
    public projectId = "",
    public title = "",
    public description = "",
    public creator: Address = new Address(""),
    public startPeriod: u64 = 0,
    public endPeriod: u64 = 0,
    public status: ProposalStatus = ProposalStatus.Active,
    public yesVotes: u64 = 0,
    public noVotes: u64 = 0,
    public totalVotes: u64 = 0,
    public executed = false,
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.id)
      .add(this.projectId)
      .add(this.title)
      .add(this.description)
      .add(this.creator)
      .add(this.startPeriod)
      .add(this.endPeriod)
      .add(this.status)
      .add(this.yesVotes)
      .add(this.noVotes)
      .add(this.totalVotes)
      .add(this.executed)
      .serialize()
  }

  deserialize(data: StaticArray<u8>, offset: u64 = 0): Result<i32> {
    const args = new Args(data, i32(offset))

    this.id = args.nextU64().expect("Failed to deserialize id.")
    this.projectId = args.nextString().expect("Failed to deserialize projectId.")
    this.title = args.nextString().expect("Failed to deserialize title.")
    this.description = args.nextString().expect("Failed to deserialize description.")
    this.creator = args.nextSerializable<Address>().expect("Failed to deserialize creator.")
    this.startPeriod = args.nextU64().expect("Failed to deserialize startPeriod.")
    this.endPeriod = args.nextU64().expect("Failed to deserialize endPeriod.")
    this.status = args.nextU8().expect("Failed to deserialize status.")
    this.yesVotes = args.nextU64().expect("Failed to deserialize yesVotes.")
    this.noVotes = args.nextU64().expect("Failed to deserialize noVotes.")
    this.totalVotes = args.nextU64().expect("Failed to deserialize totalVotes.")
    this.executed = args.nextBool().expect("Failed to deserialize executed.")

    return new Result(args.offset)
  }
}

// Vote record class
class VoteRecord implements Serializable {
  constructor(
    public voter: Address = new Address(""),
    public proposalId: u64 = 0,
    public support = false,
    public votingPower: u64 = 0,
  ) {}

  serialize(): StaticArray<u8> {
    return new Args().add(this.voter).add(this.proposalId).add(this.support).add(this.votingPower).serialize()
  }

  deserialize(data: StaticArray<u8>, offset: u64 = 0): Result<i32> {
    const args = new Args(data, i32(offset))

    this.voter = args.nextSerializable<Address>().expect("Failed to deserialize voter.")
    this.proposalId = args.nextU64().expect("Failed to deserialize proposalId.")
    this.support = args.nextBool().expect("Failed to deserialize support.")
    this.votingPower = args.nextU64().expect("Failed to deserialize votingPower.")

    return new Result(args.offset)
  }
}

// Helper function to convert string to bytes
function stringToBytes(s: string): StaticArray<u8> {
  const bytes = new StaticArray<u8>(s.length)
  for (let i = 0; i < s.length; i++) {
    bytes[i] = u8(s.charCodeAt(i))
  }
  return bytes
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

// Constructor function
export function constructor(binArgs: StaticArray<u8>): void {
  assert(Context.isDeployingContract(), "Not in deployment context")

  // Store the contract owner (deployer)
  Storage.set(OWNER_KEY, stringToBytes(Context.caller().toString()))

  // Initialize proposal counter
  Storage.set(PROPOSAL_COUNT_KEY, new Args().add(0 as u64).serialize())

  generateEvent("Voting contract initialized successfully")
}

// Create a new proposal
export function createProposal(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs)
  const projectId = args.nextString().expect("Missing project ID")
  const title = args.nextString().expect("Missing title")
  const description = args.nextString().expect("Missing description")
  const durationPeriods = args.nextU64().expect("Missing duration")

  // Get and increment proposal counter
  const counterData = Storage.get(PROPOSAL_COUNT_KEY)
  const counter = new Args(counterData).nextU64().expect("Failed to read counter")
  const newCounter = counter + 1

  // Create new proposal
  const currentPeriod = Context.currentPeriod()
  const proposal = new Proposal(
    newCounter,
    projectId,
    title,
    description,
    Context.caller(),
    currentPeriod,
    currentPeriod + durationPeriods,
    ProposalStatus.Active,
    0,
    0,
    0,
    false,
  )

  // Store proposal
  Storage.set(concat(PROPOSAL_PREFIX, stringToBytes(newCounter.toString())), proposal.serialize())

  // Update counter
  Storage.set(PROPOSAL_COUNT_KEY, new Args().add(newCounter).serialize())

  generateEvent(`Proposal created: ${newCounter} for project ${projectId}`)

  return new Args().add(newCounter).serialize()
}

// Cast a vote on a proposal
export function castVote(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs)
  const proposalId = args.nextU64().expect("Missing proposal ID")
  const support = args.nextBool().expect("Missing vote support")

  // Get proposal
  const proposalKey = concat(PROPOSAL_PREFIX, stringToBytes(proposalId.toString()))
  assert(Storage.has(proposalKey), "Proposal does not exist")

  const proposalData = Storage.get(proposalKey)
  const proposal = new Proposal()
  proposal.deserialize(proposalData)

  // Check if proposal is active
  assert(proposal.status === ProposalStatus.Active, "Proposal is not active")

  // Check if voting period is still open
  const currentPeriod = Context.currentPeriod()
  assert(currentPeriod <= proposal.endPeriod, "Voting period has ended")

  const voter = Context.caller()

  // Check if voter has already voted
  const voteKey = concat(concat(VOTE_PREFIX, stringToBytes(proposalId.toString())), stringToBytes(voter.toString()))
  assert(!Storage.has(voteKey), "Already voted on this proposal")

  // Get voter's voting power
  const voterPowerKey = concat(VOTER_POWER_PREFIX, stringToBytes(voter.toString()))
  assert(Storage.has(voterPowerKey), "No voting power")

  const voterPowerData = Storage.get(voterPowerKey)
  const votingPower = new Args(voterPowerData).nextU64().expect("Failed to read voting power")

  // Record the vote
  const voteRecord = new VoteRecord(voter, proposalId, support, votingPower)
  Storage.set(voteKey, voteRecord.serialize())

  // Update proposal vote counts
  if (support) {
    proposal.yesVotes += votingPower
  } else {
    proposal.noVotes += votingPower
  }
  proposal.totalVotes += votingPower

  // Store updated proposal
  Storage.set(proposalKey, proposal.serialize())

  generateEvent(
    `Vote cast on proposal ${proposalId} by ${voter.toString()}: ${support ? "Yes" : "No"} with power ${votingPower}`,
  )
}

// Set voting power for an address (called when NFTs are minted)
export function setVotingPower(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs)
  const voter = args.nextString().expect("Missing voter address")
  const projectId = args.nextString().expect("Missing project ID")
  const power = args.nextU64().expect("Missing voting power")

  // Only the contract owner or authorized contracts can set voting power
  const ownerStr = Storage.get(OWNER_KEY)
  const owner = new Address(bytesToString(ownerStr))
  assert(Context.caller().equals(owner), "Unauthorized")

  const voterAddress = new Address(voter)
  const voterPowerKey = concat(VOTER_POWER_PREFIX, stringToBytes(voterAddress.toString()))

  // Add to existing power if any
  let totalPower = power
  if (Storage.has(voterPowerKey)) {
    const existingPowerData = Storage.get(voterPowerKey)
    const existingPower = new Args(existingPowerData).nextU64().expect("Failed to read existing power")
    totalPower += existingPower
  }

  Storage.set(voterPowerKey, new Args().add(totalPower).serialize())

  // Also track which projects the voter has contributed to
  const projectVoterKey = concat(
    concat(PROJECT_PREFIX, stringToBytes(projectId)),
    stringToBytes(voterAddress.toString()),
  )
  Storage.set(projectVoterKey, new Args().add(power).serialize())

  generateEvent(`Voting power set for ${voter} on project ${projectId}: ${power} (total: ${totalPower})`)
}

// Finalize a proposal after voting period ends
export function finalizeProposal(binArgs: StaticArray<u8>): void {
  const args = new Args(binArgs)
  const proposalId = args.nextU64().expect("Missing proposal ID")

  // Get proposal
  const proposalKey = concat(PROPOSAL_PREFIX, stringToBytes(proposalId.toString()))
  assert(Storage.has(proposalKey), "Proposal does not exist")

  const proposalData = Storage.get(proposalKey)
  const proposal = new Proposal()
  proposal.deserialize(proposalData)

  // Check if proposal is active
  assert(proposal.status === ProposalStatus.Active, "Proposal is not active")

  // Check if voting period has ended
  const currentPeriod = Context.currentPeriod()
  assert(currentPeriod > proposal.endPeriod, "Voting period has not ended")

  // Determine outcome
  if (proposal.yesVotes > proposal.noVotes) {
    proposal.status = ProposalStatus.Passed
    generateEvent(`Proposal ${proposalId} passed: ${proposal.yesVotes} Yes vs ${proposal.noVotes} No`)
  } else {
    proposal.status = ProposalStatus.Rejected
    generateEvent(`Proposal ${proposalId} rejected: ${proposal.yesVotes} Yes vs ${proposal.noVotes} No`)
  }

  // Store updated proposal
  Storage.set(proposalKey, proposal.serialize())
}

// Get proposal details
export function getProposal(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs)
  const proposalId = args.nextU64().expect("Missing proposal ID")

  // Get proposal
  const proposalKey = concat(PROPOSAL_PREFIX, stringToBytes(proposalId.toString()))
  assert(Storage.has(proposalKey), "Proposal does not exist")

  return Storage.get(proposalKey)
}

// Get voter's vote on a proposal
export function getVote(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs)
  const proposalId = args.nextU64().expect("Missing proposal ID")
  const voter = args.nextString().expect("Missing voter address")

  const voterAddress = new Address(voter)
  const voteKey = concat(
    concat(VOTE_PREFIX, stringToBytes(proposalId.toString())),
    stringToBytes(voterAddress.toString()),
  )

  assert(Storage.has(voteKey), "Vote not found")
  return Storage.get(voteKey)
}

// Get voter's voting power
export function getVotingPower(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs)
  const voter = args.nextString().expect("Missing voter address")

  const voterAddress = new Address(voter)
  const voterPowerKey = concat(VOTER_POWER_PREFIX, stringToBytes(voterAddress.toString()))

  assert(Storage.has(voterPowerKey), "No voting power")
  return Storage.get(voterPowerKey)
}

// Get all active proposals
export function getActiveProposals(_: StaticArray<u8>): StaticArray<u8> {
  const counterData = Storage.get(PROPOSAL_COUNT_KEY)
  const counter = new Args(counterData).nextU64().expect("Failed to read counter")

  const activeProposals = new Args()
  let activeCount = 0

  for (let i = 1; i <= counter; i++) {
    const proposalKey = concat(PROPOSAL_PREFIX, stringToBytes(i.toString()))
    if (Storage.has(proposalKey)) {
      const proposalData = Storage.get(proposalKey)
      const proposal = new Proposal()
      proposal.deserialize(proposalData)

      if (proposal.status === ProposalStatus.Active) {
        activeProposals.add(i)
        activeCount++
      }
    }
  }

  return activeProposals.serialize()
}
