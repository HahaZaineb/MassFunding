import { CATEGORIES } from "@/constants"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const PERIODS_PER_DAY = 5760; // 86400 seconds / 15 seconds per period
const PERIODS_PER_SECOND = 1 / 15;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getCategoryColor(categoryName: string): string {
  const category = CATEGORIES.find(cat => cat.name === categoryName)
  return category ? category.color : "#cccccc"
}

export function shortenAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

// Helper function to parse human-readable time (days, hours, minutes, seconds) into periods
export const parseDurationToPeriods = (durationString: string): bigint => {
  const parts = durationString.trim().split(' ');
  if (parts.length < 2) {
    // If no unit is specified, assume days as a default or throw an error based on expected input
    const value = parseFloat(durationString);
    if (isNaN(value)) throw new Error('Invalid duration string: No unit specified or invalid number.');
    // Default to days if no unit is provided
    return BigInt(Math.round(value * PERIODS_PER_DAY));
  }

  const value = parseFloat(parts[0]);
  if (isNaN(value)) throw new Error('Invalid duration value in string.');

  const unit = parts[1].toLowerCase();

  let periods: number;

  switch (unit) {
    case 'second':
    case 'seconds':
      periods = value * PERIODS_PER_SECOND;
      break;
    case 'minute':
    case 'minutes':
      periods = value * 60 * PERIODS_PER_SECOND;
      break;
    case 'hour':
    case 'hours':
      periods = value * 3600 * PERIODS_PER_SECOND;
      break;
    case 'day':
    case 'days':
      periods = value * 86400 * PERIODS_PER_SECOND;
      break;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }

  return BigInt(Math.round(periods));
};

// Helper function to format periods into human-readable time (days, hours, minutes, seconds)
export const formatPeriodsToHumanReadable = (periods: number): string => {
  const totalSeconds = periods * 15; // 1 Massa period = 15 seconds

  if (totalSeconds < 60) {
    return `${Math.round(totalSeconds)} seconds`;
  } else if (totalSeconds < 3600) {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.round(totalSeconds % 60);
    return `${minutes} minutes` + (remainingSeconds > 0 ? ` ${remainingSeconds} seconds` : '');
  } else if (totalSeconds < 86400) {
    const hours = Math.floor(totalSeconds / 3600);
    const remainingMinutes = Math.round((totalSeconds % 3600) / 60);
    return `${hours} hours` + (remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : '');
  } else {
    const days = Math.round(totalSeconds / 86400);
    return `${days} days`;
  }
};