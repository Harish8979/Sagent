export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export function formatDateTime(value) {
  if (!value) {
    return 'TBA';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatShortDate(value) {
  if (!value) {
    return 'TBA';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function formatPaymentMethod(value) {
  switch (value) {
    case 'CARD':
      return 'Card';
    case 'NET_BANKING':
      return 'Netbanking';
    case 'UPI':
      return 'UPI';
    case 'WALLET':
      return 'Wallet';
    case 'CASH_AT_VENUE':
      return 'Cash at venue';
    default:
      return value || 'Unspecified';
  }
}
