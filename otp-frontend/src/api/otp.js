export async function requestOtp(transactionId) {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/otp/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ transactionId, purpose: "iban_update" }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "OTP request failed");
  }
  return res.json();
}

export async function verifyOtp(transactionId, code) {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/otp/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ transactionId, code }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "OTP verification failed");
  }
  return res.json();
}
