import {
  Args,
  ISerializable,
  IDeserializedResult,
} from '@massalabs/massa-web3';

export class Project implements ISerializable<Project> {
  constructor(
    public projectId: bigint = BigInt(0),
    public creator: string = '',
    public title: string = '',
    public description: string = '',
    public fundingGoal: bigint = BigInt(0),
    public amountRaised: bigint = BigInt(0),
    public beneficiary: string = '',
    public category: string = '',
    public lockPeriod: bigint = BigInt(0),
    public releaseInterval: bigint = BigInt(0),
    public releasePercentage: bigint = BigInt(0),
    public image: string = '',
    public creationPeriod: bigint = BigInt(0),
    public vestingScheduleId: bigint = BigInt(0),
    public initialVestingTriggered: boolean = false,
  ) {}

  serialize(): Uint8Array {
    return new Args()
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
      .serialize();
  }

  deserialize(buffer: Uint8Array): IDeserializedResult<Project> {
    const args = new Args(buffer);

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

    return {
      instance: this,
      offset: args.offset,
    };
  }
  static deserializee(data: any): Project {
    const project = new Project();
    project.deserialize(data);
    return project;
  }

  toPlainObject(): any {
    return {
      projectId: this.projectId.toString(),
      creator: this.creator,
      title: this.title,
      description: this.description,
      fundingGoal: this.fundingGoal.toString(),
      amountRaised: this.amountRaised.toString(),
      beneficiary: this.beneficiary,
      category: this.category,
      lockPeriod: this.lockPeriod.toString(),
      releaseInterval: this.releaseInterval.toString(),
      releasePercentage: this.releasePercentage.toString(),
      image: this.image,
      creationPeriod: this.creationPeriod.toString(),
      vestingScheduleId: this.vestingScheduleId.toString(),
      initialVestingTriggered: this.initialVestingTriggered,
    };
  }
}
