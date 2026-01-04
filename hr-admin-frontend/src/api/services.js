import authApi from "./axios";

export const ProfileService = {
  getProfile: async () => {
    const response = await authApi.get("/profile/me");
    return response.data;
  },

  getFinancials: async () => {
    const response = await authApi.get("/profile/financials");
    return response.data;
  },

  requestIbanChange: async (newIban) => {
    const response = await authApi.post("/profile/request-iban-change", {
      newIban,
    });
    return response.data;
  },

  updateIban: async (newIban, otpCode, transactionId) => {
    const response = await authApi.post("/profile/update-iban", {
      newIban,
      otpCode,
      transactionId,
    });
    return response.data;
  },
};
