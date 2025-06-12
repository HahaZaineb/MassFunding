import { Serializable, Args, DeserializedResult } from '@massalabs/massa-web3';

export class Project implements Serializable<Project> {
  constructor(
    public projectId: bigint = 0n,
    public creator: string = '',
    public title: string = '',
    public description: string = '',
    public fundingGoal: bigint = 0n,
    public amountRaised: bigint = 0n,
    public beneficiary: string = '',
    public category: string = '',
    public lockPeriod: bigint = 0n,
    public releaseInterval: bigint = 0n,
    public releasePercentage: bigint = 0n,
    public image: string = '',
    public creationPeriod: bigint = 0n,
    public vestingScheduleId: bigint = 0n,
    public initialVestingTriggered: boolean = false,
    public totalAmountRaisedAtLockEnd: bigint = 0n
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addU64(this.projectId)
      .addString(this.creator)
      .addString(this.title)
      .addString(this.description)
      .addU64(this.fundingGoal)
      .addU64(this.amountRaised)
      .addString(this.beneficiary)
      .addString(this.category)
      .addU64(this.lockPeriod)
      .addU64(this.releaseInterval)
      .addU64(this.releasePercentage)
      .addString(this.image)
      .addU64(this.creationPeriod)
      .addU64(this.vestingScheduleId)
      .addBool(this.initialVestingTriggered)
      .addU64(this.totalAmountRaisedAtLockEnd);
    return args.serialize();
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<Project> {
    const args = new Args(data, offset);
    this.projectId = args.nextU64();
    this.creator = args.nextString();
    this.title = args.nextString();
    this.description = args.nextString();
    this.fundingGoal = args.nextU64();
    this.amountRaised = args.nextU64();
    this.beneficiary = args.nextString();
    this.category = args.nextString();
    this.lockPeriod = args.nextU64();
    this.releaseInterval = args.nextU64();
    this.releasePercentage = args.nextU64();
    this.image = args.nextString();
    this.creationPeriod = args.nextU64();
    this.vestingScheduleId = args.nextU64();
    this.initialVestingTriggered = args.nextBool();
    this.totalAmountRaisedAtLockEnd = args.nextU64();
    return { instance: this, offset: args.getOffset() };
  }
}
