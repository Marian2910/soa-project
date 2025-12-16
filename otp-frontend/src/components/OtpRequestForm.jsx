import { useState } from "react";
import { requestOtp } from "../api/otp";
import Toast from "./Toast";

export default function OtpRequestForm() {
  const [userId, setUserId] = useState("");
  const [otpData, setOtpData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await requestOtp(userId);
      setOtpData(data);
    } catch (err) {
      setError("Failed to request OTP.");
    }
  };

  return (
    <div>
      <h2>Request OTP</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <button type="submit">Request OTP</button>
      </form>
      {otpData && (
        <Toast
          message={`Your OTP is: ${otpData.code}`}
          duration={otpData.expiresIn}
          onClose={() => setOtpData(null)}
        />
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
