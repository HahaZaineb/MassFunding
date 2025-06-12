export interface VestingScheduleData {
  id: number; // u64 in contract
  beneficiary: string; // Address serialized as string in contract
  totalAmount: number; // u64 in contract
  amountClaimed: number; // u64 in contract
  lockPeriod: number; // u64 in contract
  releaseInterval: number; // u64 in contract
  releasePercentage: number; // u64 in contract
  nextReleasePeriod: number; // u64 in contract
}