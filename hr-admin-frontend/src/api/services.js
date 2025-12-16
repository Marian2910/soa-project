import authApi from './axios';

export const ProfileService = {
  // Get current logged-in user details
  getProfile: async () => {
    const response = await authApi.get('/profile/me');
    return response.data;
  },

  // The critical secure action: Send new IBAN + OTP Code + TransactionID
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
  // Trigger the email generation via RabbitMQ
  requestOtp: async () => {
    const response = await authApi.post('/otp/request');
    return response.data; // Should return { transactionId: "..." }
  },

  // Direct verification (used if you implement a standalone OTP check)
  verifyOtp: async (transactionId, code) => {
    const response = await authApi.post('/otp/verify', {
      transactionId,
      code
    });
    return response.data;
  }
};