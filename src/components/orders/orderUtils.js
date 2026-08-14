export function formatMoney(amount) {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const STATUS_META = {
  paid:      { label: 'Paid',      className: 'active' },
  pending:   { label: 'Pending',   className: 'pending' },
  refunded:  { label: 'Refunded',  className: 'warning' },
  void:      { label: 'Void',      className: 'inactive' },
}
