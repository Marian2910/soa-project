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

  getAuditLogs: async (
    page = 1,
    pageSize = 5,
    eventType = "",
    details = "",
    startDate = "",
    endDate = ""
  ) => {
    const params = { page, pageSize };

    if (eventType && eventType !== "ALL") {
      params.eventType = eventType;
    }
    if (details) {
      params.details = details;
    }
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }

    const response = await authApi.get("/audit", { params });
    return response.data;
  },

  logAction: async (action, reference = null) => {
    authApi.post("audit/log", { action, reference });
  },

  checkRecentFraud: async () => {
    const response = await authApi.get("/audit/recent-fraud");
    return response.data;
  },
};

export const SecurityService = {
  checkRecentAlerts: async () => {
    const response = await authApi.get("/security/alerts");
    return response.data;
  },
};
