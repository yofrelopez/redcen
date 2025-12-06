import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateReadingTime(text: string): number {
  const wpm = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wpm)
}
