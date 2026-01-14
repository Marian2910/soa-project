import axios from "axios";

const api = axios.create({
  baseURL: "api",
  headers: { "Content-Type": "application/json" },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const finalizeUpdate = async (transactionId, code) => {
  const response = await api.post("/profile/finalize-update", {
    transactionId,
    code,
  });
  return response.data;
};

export const resendOtp = async (transactionId) => {
  const response = await api.post("/profile/resend-otp", { transactionId });
  return response.data;
};
