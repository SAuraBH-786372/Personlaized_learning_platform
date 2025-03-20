import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format time in minutes to hours and minutes
export function formatStudyTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  }
  
  if (mins === 0) {
    return `${hours} hr${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hr${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
}

// Calculate progress percentage
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

// Truncate text to a certain length with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Generate a random color from a predefined set
export function getRandomColor(): string {
  const colors = [
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

// Add special styles based on CSS in the design reference
export const specialStyles = {
  flipCard: {
    inner: "transition-transform duration-500 transform-style-preserve-3d",
    front: "backface-visibility-hidden",
    back: "backface-visibility-hidden transform rotateY-180",
    hover: "transform rotateY-180",
  },
  pdfThumbnail: "aspect-ratio-210/297",
};
