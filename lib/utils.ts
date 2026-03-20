import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Customer ranking system based on total spent
// Iron -> Bronze -> Silver -> Gold -> Platinum -> Diamond

export interface CustomerRank {
  name: string
  minSpent: number
  color: string
  bgColor: string
  borderColor: string
  nextRank?: string
  nextRankAt?: number
}

export const CUSTOMER_RANKS: CustomerRank[] = [
  { 
    name: 'Iron', 
    minSpent: 0, 
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-600',
    nextRank: 'Bronze',
    nextRankAt: 100
  },
  { 
    name: 'Bronze', 
    minSpent: 100, 
    color: 'text-amber-700 dark:text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-300 dark:border-amber-700',
    nextRank: 'Silver',
    nextRankAt: 250
  },
  { 
    name: 'Silver', 
    minSpent: 250, 
    color: 'text-slate-500 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-300 dark:border-slate-600',
    nextRank: 'Gold',
    nextRankAt: 500
  },
  { 
    name: 'Gold', 
    minSpent: 500, 
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-400 dark:border-yellow-600',
    nextRank: 'Platinum',
    nextRankAt: 750
  },
  { 
    name: 'Platinum', 
    minSpent: 750, 
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    borderColor: 'border-cyan-400 dark:border-cyan-600',
    nextRank: 'Diamond',
    nextRankAt: 1000
  },
  { 
    name: 'Diamond', 
    minSpent: 1000, 
    color: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-400 dark:border-blue-600'
  },
]

export function getCustomerRank(totalSpent: number): CustomerRank {
  for (let i = CUSTOMER_RANKS.length - 1; i >= 0; i--) {
    if (totalSpent >= CUSTOMER_RANKS[i].minSpent) {
      return CUSTOMER_RANKS[i]
    }
  }
  return CUSTOMER_RANKS[0]
}

export function getRankProgress(totalSpent: number): { 
  currentRank: CustomerRank
  progressPercent: number
  amountToNextRank: number
} {
  const currentRank = getCustomerRank(totalSpent)
  
  if (!currentRank.nextRankAt) {
    return { currentRank, progressPercent: 100, amountToNextRank: 0 }
  }
  
  const spentInCurrentTier = totalSpent - currentRank.minSpent
  const tierRange = currentRank.nextRankAt - currentRank.minSpent
  const progressPercent = Math.min((spentInCurrentTier / tierRange) * 100, 100)
  const amountToNextRank = currentRank.nextRankAt - totalSpent
  
  return { currentRank, progressPercent, amountToNextRank }
}

export function getLoyaltyMultiplier(rankName: string): number {
  const multipliers: { [key: string]: number } = {
    'Iron': 1,
    'Bronze': 1.25,
    'Silver': 1.5,
    'Gold': 2,
    'Platinum': 2.5,
    'Diamond': 3,
  }
  return multipliers[rankName] || 1
}
