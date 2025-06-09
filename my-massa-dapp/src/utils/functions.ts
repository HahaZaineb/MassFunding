import { CATEGORIES } from "@/constants"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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