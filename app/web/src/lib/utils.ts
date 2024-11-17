import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateGridPosition = (depth: number, siblingIndex: number, levelWidth = 250, levelHeight = 100) => {
  return {
    x: depth * levelWidth,
    y: siblingIndex * levelHeight
  };
};
