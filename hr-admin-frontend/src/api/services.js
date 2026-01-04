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

  initiateIbanUpdate: async (newIban) => {
    const response = await authApi.post("/profile/initiate-update", {
      newIban,
    });
    return response.data;
  },
};
