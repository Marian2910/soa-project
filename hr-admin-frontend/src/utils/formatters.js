// Masks all but the last 4 characters of an IBAN
export const maskIban = (iban) => {
  if (!iban || iban.length < 8) return '****';
  const last4 = iban.slice(-4);
  return `**** **** **** ${last4}`;
};

// Formats number to Currency (USD/EUR/RON)
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Formats standard date strings
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};