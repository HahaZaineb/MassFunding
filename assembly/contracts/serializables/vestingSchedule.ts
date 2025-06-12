import { Args, Result, Serializable } from '@massalabs/as-types';
import { Address } from '@massalabs/massa-as-sdk';

export class vestingSchedule implements Serializable {
  constructor(
    public id: u64 = 0,
    public beneficiary: Address = new Address(''),
    public totalAmount: u64 = 0,
    public amountClaimed: u64 = 0,
    public lockPeriod: u64 = 0, // In periods (initial lock period relative to vesting schedule creation)
    public releaseInterval: u64 = 0, // In periods
    public releasePercentage: u64 = 0, // Percentage out of 100
    public nextReleasePeriod: u64 = 0, // Period of the next scheduled release
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

    this.id = args
      .nextU64()
      .expect('Failed to deserialize vesting schedule ID.');
    this.beneficiary = args
      .nextSerializable<Address>()
      .expect('Failed to deserialize beneficiary.');
    this.totalAmount = args
      .nextU64()
      .expect('Failed to deserialize totalAmount.');
    this.amountClaimed = args
      .nextU64()
      .expect('Failed to deserialize amountClaimed.');
    this.lockPeriod = args
      .nextU64()
      .expect('Failed to deserialize lockPeriod.');
    this.releaseInterval = args
      .nextU64()
      .expect('Failed to deserialize releaseInterval.');
    this.releasePercentage = args
      .nextU64()
      .expect('Failed to deserialize releasePercentage.');
    this.nextReleasePeriod = args
      .nextU64()
      .expect('Failed to deserialize nextReleasePeriod.');

    return new Result(args.offset);
  }
}
