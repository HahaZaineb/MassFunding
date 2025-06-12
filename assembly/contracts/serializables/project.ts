import { Args, Result, Serializable } from '@massalabs/as-types';
import { Address } from '@massalabs/massa-as-sdk';

export class Project implements Serializable {
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
    public totalAmountRaisedAtLockEnd: u64 = 0, // New field to store total amount raised at the end of the lock period
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
    this.creator = args
      .nextSerializable<Address>()
      .expect('Failed to deserialize creator');
    this.title = args.nextString().expect('Failed to deserialize title');
    this.description = args
      .nextString()
      .expect('Failed to deserialize description');
    this.fundingGoal = args
      .nextU64()
      .expect('Failed to deserialize fundingGoal');
    this.amountRaised = args
      .nextU64()
      .expect('Failed to deserialize amountRaised');
    this.beneficiary = args
      .nextSerializable<Address>()
      .expect('Failed to deserialize beneficiary');
    this.category = args.nextString().expect('Failed to deserialize category');
    this.lockPeriod = args.nextU64().expect('Failed to deserialize lockPeriod');
    this.releaseInterval = args
      .nextU64()
      .expect('Failed to deserialize releaseInterval');
    this.releasePercentage = args
      .nextU64()
      .expect('Failed to deserialize releasePercentage');
    this.image = args.nextString().expect('Failed to deserialize image');
    this.creationPeriod = args
      .nextU64()
      .expect('Failed to deserialize creationPeriod');
    this.vestingScheduleId = args
      .nextU64()
      .expect('Failed to deserialize vestingScheduleId');
    this.initialVestingTriggered = args
      .nextBool()
      .expect('Failed to deserialize initialVestingTriggered');
    this.totalAmountRaisedAtLockEnd = args
      .nextU64()
      .expect('Failed to deserialize totalAmountRaisedAtLockEnd');
      
    return new Result(args.offset);
  }
}
