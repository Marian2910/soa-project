export const validateIban = (iban) => {
  if (!iban) return false;

  const cleanIban = iban.replace(/\s+/g, "").toUpperCase();

  const basicIbanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;

  return basicIbanRegex.test(cleanIban);
};
