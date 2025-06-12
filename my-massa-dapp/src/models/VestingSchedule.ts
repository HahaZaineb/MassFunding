import { Serializable, Args, DeserializedResult } from '@massalabs/massa-web3';

export class VestingSchedule implements Serializable<VestingSchedule> {
  constructor(
    public id: bigint = 0n,
    public beneficiary: string = '',
    public totalAmount: bigint = 0n,
    public amountClaimed: bigint = 0n,
    public lockPeriod: bigint = 0n,
    public releaseInterval: bigint = 0n,
    public releasePercentage: bigint = 0n,
    public nextReleasePeriod: bigint = 0n
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addU64(this.id)
      .addString(this.beneficiary)
      .addU64(this.totalAmount)
      .addU64(this.amountClaimed)
      .addU64(this.lockPeriod)
      .addU64(this.releaseInterval)
      .addU64(this.releasePercentage)
      .addU64(this.nextReleasePeriod);
    return args.serialize();
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<VestingSchedule> {
    const args = new Args(data, offset);
    this.id = args.nextU64();
    this.beneficiary = args.nextString();
    this.totalAmount = args.nextU64();
    this.amountClaimed = args.nextU64();
    this.lockPeriod = args.nextU64();
    this.releaseInterval = args.nextU64();
    this.releasePercentage = args.nextU64();
    this.nextReleasePeriod = args.nextU64();
    return { instance: this, offset: args.getOffset() };
  }
}
