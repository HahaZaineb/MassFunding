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

// Interface for detailed vesting information to be displayed on the frontend.
export interface DetailedVestingInfo {
  vestingScheduleId: string | null;
  vestingStart: string; // Formatted time since vesting started
  nextRelease: string; // Formatted time until next release
  amountReceived: string; // Formatted amount received (MAS)
  amountLeft: string; // Formatted amount left (MAS)
  lockPeriod: string; // Original lock period in days
  releaseInterval: string; // Original release interval in days
  releasePercentage: number; // Original release percentage
  beneficiary: string; // Beneficiary address
  hasVestingSchedule: boolean; // Indicates if a vesting schedule exists for the project
  loading: boolean;
}