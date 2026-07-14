import type { Category } from '@/types'

const CATEGORY_ICONS: Record<Category, string> = {
  Groceries: 'shopping-bag',
  Dining: 'cup',
  Transport: 'truck',
  Utilities: 'bolt',
  Shopping: 'shopping-bag',
  Entertainment: 'film',
  Health: 'heart',
  Income: 'banknotes',
  Transfer: 'arrows-right-left',
  Fees: 'receipt'
}

export function categoryIcon(category: Category): string {
  return CATEGORY_ICONS[category] ?? 'receipt'
}
