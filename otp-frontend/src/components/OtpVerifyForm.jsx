import { useState, useRef } from "react";
import { verifyOtp } from "../api/otp";
import { toast } from "react-hot-toast";

export default function OtpVerifyForm() {
  const [userId, setUserId] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otpDigits.join("");
    try {
      const res = await verifyOtp(userId, code);
      if (res.success) {
        toast.success("OTP verified successfully!");
        // clear inputs after success
        setOtpDigits(["", "", "", "", "", ""]);
      } else {
        toast.error(res.errorMessage || "Verification failed.");
      }
    } catch (err) {
      toast.error("Failed to verify OTP.");
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return; // only allow digits

    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = paste.split("");
    while (newOtp.length < 6) newOtp.push("");
    setOtpDigits(newOtp);
    inputsRef.current[Math.min(5, newOtp.length - 1)].focus();
  };

  return (
    <div>
      <h2>Verify OTP</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />

        <div className="otp-inputs-container">
          <h3>Enter your OTP</h3>
          <div className="otp-inputs" onPaste={handlePaste}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputsRef.current[index] = el)}
                required
              />
            ))}
          </div>
        </div>
        <button type="submit">Verify OTP</button>
      </form>
    </div>
  );
}
