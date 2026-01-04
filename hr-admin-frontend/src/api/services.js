import authApi from './axios';

export const ProfileService = {
  getProfile: async () => {
    const response = await authApi.get('/profile/me');
    return response.data;
  },

  getFinancials: async () => {
    const response = await authApi.get('/profile/financials');
    return response.data;
  },
  
  updateIban: async (newIban, otpCode, transactionId) => {
    const response = await authApi.post('/profile/update-iban', {
      newIban,
      otpCode,
      transactionId
    });
    return response.data;
  }
};

export const OtpService = {
  requestOtp: async () => {
    const response = await authApi.post('/otp/request');
    return response.data;
  },

  verifyOtp: async (transactionId, code) => {
    const response = await authApi.post('/otp/verify', {
      transactionId,
      code
    });
    return response.data;
  }
};