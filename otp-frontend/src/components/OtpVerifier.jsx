import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CircularTimer from "./CircularTimer";
import { FiRefreshCw, FiAlertCircle, FiCheck, FiX } from "react-icons/fi";

const OtpVerifier = ({
  token,
  email,
  transactionId,
  initialDuration = 240,
  onSuccess,
  onCancel,
}) => {
  // --- State ---
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [currentTxId, setCurrentTxId] = useState(transactionId);
  const [status, setStatus] = useState("IDLE"); // IDLE, VERIFYING, RESENDING, ERROR, SUCCESS
  const [message, setMessage] = useState("");

  // Refs for auto-focus
  const inputRefs = useRef([]);

  // --- API Client ---
  const api = axios.create({
    baseURL: "http://localhost:5002/api/otp", // Pointing to OtpService
    headers: { Authorization: `Bearer ${token}` },
  });

  // --- Timer Logic ---
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // --- Input Handlers ---
  const handleInputChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return; // Numbers only

    const newOtp = [...otp];

    // Allow pasting full code
    if (val.length > 1) {
      const pastedData = val.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) newOtp[i] = pastedData[i] || "";
      setOtp(newOtp);
      // Focus last filled
      inputRefs.current[Math.min(5, val.length - 1)].focus();
    } else {
      newOtp[index] = val;
      setOtp(newOtp);
      // Auto-advance
      if (val && index < 5) inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace logic
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // --- Actions ---
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;

    setStatus("VERIFYING");
    setMessage("");

    try {
      await api.post("/verify", {
        transactionId: currentTxId,
        code: code,
      });

      setStatus("SUCCESS");
      setTimeout(() => onSuccess(code), 1000); // Return code to Host
    } catch (err) {
      setStatus("ERROR");
      setMessage(err.response?.data?.errorMessage || "Invalid Code");
      setOtp(["", "", "", "", "", ""]); // Clear input
      inputRefs.current[0].focus();
    }
  };

  const handleResend = async () => {
    setStatus("RESENDING");
    setMessage("");

    try {
      // Logic: Request new OTP for the same transaction context
      const response = await api.post("/request", {
        transactionId: currentTxId,
        purpose: "re-verification",
      });

      // Update state with new data from backend
      setTimeLeft(response.data.expiresInSeconds || 120);
      setCurrentTxId(response.data.transactionId || currentTxId); // Update ID if changed

      setStatus("IDLE");
      setMessage("New code sent!");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } catch (err) {
      setStatus("ERROR");
      setMessage("Failed to resend code.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full mx-auto font-sans animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-indigo to-brand-magenta p-6 text-white text-center">
        <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
          <FiAlertCircle size={24} />
        </div>
        <h2 className="text-xl font-bold">Security Verification</h2>
        <p className="text-indigo-100 text-sm mt-1">
          We sent a 6-digit code to <br />
          <span className="font-semibold text-white">{email}</span>
        </p>
      </div>

      <div className="p-8">
        {/* Timer Section */}
        <div className="flex justify-center mb-8">
          <CircularTimer timeLeft={timeLeft} maxTime={initialDuration} />
        </div>

        {/* Input Boxes */}
        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              maxLength={6} // Allow paste
              value={digit}
              onChange={(e) => handleInputChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              disabled={timeLeft === 0 || status === "VERIFYING"}
              className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg outline-none transition-all
                        ${
                          status === "ERROR"
                            ? "border-red-300 bg-red-50 text-red-600"
                            : "border-gray-200 focus:border-brand-teal focus:ring-4 focus:ring-teal-500/10"
                        }
                        ${digit ? "bg-gray-50" : "bg-white"}
                    `}
            />
          ))}
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`text-center mb-6 text-sm font-medium ${
              status === "ERROR" ? "text-red-500" : "text-brand-teal"
            }`}
          >
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleVerify}
            disabled={
              otp.join("").length !== 6 ||
              timeLeft === 0 ||
              status === "VERIFYING"
            }
            className="w-full py-3.5 bg-brand-indigo hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
          >
            {status === "VERIFYING" ? (
              "Verifying..."
            ) : status === "SUCCESS" ? (
              <>
                <FiCheck /> Verified
              </>
            ) : (
              "Verify Identity"
            )}
          </button>

          {timeLeft === 0 ? (
            <button
              onClick={handleResend}
              disabled={status === "RESENDING"}
              className="w-full py-3 border-2 border-brand-indigo text-brand-indigo font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <FiRefreshCw
                className={status === "RESENDING" ? "animate-spin" : ""}
              />
              {status === "RESENDING" ? "Sending..." : "Resend Code"}
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="w-full py-3 text-gray-400 hover:text-gray-600 font-medium transition-colors"
            >
              Cancel Transaction
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerifier;
