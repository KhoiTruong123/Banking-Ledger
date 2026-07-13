export function transactionStatusClasses(status) {
  return status === 'pending' ? 'bg-teal-wash text-teal-dark' : 'bg-primary-wash text-primary'
}
