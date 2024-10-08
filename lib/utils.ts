import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getFontSizeClass(fontSize: string): string {
  switch (fontSize) {
    case 'small':
      return 'text-sm'
    case 'large':
      return 'text-lg'
    default:
      return 'text-base'
  }
}
