export const maskIban = (iban) => {
  if (!iban || iban.length < 8) return "****";

  const country = iban.slice(0, 2);
  const last4 = iban.slice(-4);
  return `${country}** **** **** **** **** ${last4}`;
};

export const formatIban = (iban) =>
  iban
    ?.replace(/\s+/g, "")
    .match(/.{1,4}/g)
    ?.join(" ");

export const formatCurrency = (amount, currency = "EUR") => {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};
