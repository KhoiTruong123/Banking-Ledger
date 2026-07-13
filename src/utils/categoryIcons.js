const CATEGORY_ICONS = {
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

export function categoryIcon(category) {
  return CATEGORY_ICONS[category] ?? 'receipt'
}
