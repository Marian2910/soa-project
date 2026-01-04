import { useState, useEffect } from "react";
import { setAuthToken, finalizeUpdate, resendOtp } from "../api/otp";

export default function OtpVerifier({
  email,
  transactionId,
  token,
  returnUrl,
  initialDuration = 120,
  onCancel,
}) {
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [status, setStatus] = useState("IDLE");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  useEffect(() => {
    if (!timeLeft) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length < 6) return;

    setStatus("VERIFYING");
    setErrorMessage("");

    try {
      await finalizeUpdate(transactionId, code);

      setStatus("SUCCESS");

      setTimeout(() => {
        window.location.href = `${returnUrl}?status=success`;
      }, 1500);
    } catch (error) {
      setStatus("ERROR");
      setErrorMessage(error.response?.data?.message || "Verification Failed");
      setCode("");
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(transactionId);
      setTimeLeft(120);
      alert("New code sent!");
    } catch (error) {
      alert("Failed to resend code.");
    }
  };

  if (status === "SUCCESS") {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg w-full text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Verified!</h2>
        <p className="text-gray-500 mt-2">Redirecting you back to payroll...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl w-full border border-gray-100 animate-fade-in-up">
      <div className="text-center mb-6">
        <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Verify Identity</h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter the code sent to <br />
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="000000"
          className={`w-full text-center text-3xl font-mono tracking-[0.5em] py-3 border-2 rounded-lg outline-none mb-2 transition-colors
                        ${
                          status === "ERROR"
                            ? "border-red-300 focus:border-red-500 bg-red-50"
                            : "border-gray-200 focus:border-indigo-500"
                        }`}
          maxLength={6}
          autoFocus
        />

        {status === "ERROR" && (
          <p className="text-red-500 text-xs text-center font-bold mb-4">
            {errorMessage}
          </p>
        )}

        <div className="flex justify-between items-center text-sm mb-6 mt-2">
          <span
            className={`font-medium ${
              timeLeft < 30 ? "text-red-500" : "text-gray-500"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={timeLeft > 0}
            className={`text-indigo-600 hover:underline ${
              timeLeft > 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Resend Code
          </button>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={status === "VERIFYING" || code.length < 6}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === "VERIFYING" ? "Verifying..." : "Verify & Update"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-50 text-gray-600 font-medium py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel Transaction
          </button>
        </div>
      </form>
    </div>
  );
}
