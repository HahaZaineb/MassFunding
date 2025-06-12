import { ProjectUpdateData } from "./projectUpdate"


export interface ProjectData {
  id: string
  name: string
  description: string
  amountNeeded: number
  goalAmount: number
  amountRaised: number
  beneficiary: string
  lockPeriod: number // In periods
  releaseInterval: number // In periods
  releasePercentage: number
  supporters: number
  category: string 
  updates?: ProjectUpdateData[]
  owner?: string
  creator?: string
  deadline?: string
  image?: string
  creationDate?: string
  vestingScheduleId?: string | null;
  creationPeriod: number;
  initialVestingTriggered: boolean;
  totalAmountRaisedAtLockEnd: number;
  status?: 'live' | 'release' | 'completed'
}