import React, { useState } from "react";
import OtpVerifier from "./components/OtpVerifier";

function App() {
  const [showTester, setShowTester] = useState(true);

  const mockProps = {
    token: "mock-jwt-token-for-dev",
    email: "dev.user@company.com",
    transactionId: "tx-12345-dev",
    initialDuration: 60,
  };

  const handleSuccess = (code) => {
    alert(`OTP Verified: ${code}`);
    setShowTester(false);
  };

  const handleCancel = () => {
    alert("Transaction Cancelled");
    setShowTester(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {showTester ? (
        <OtpVerifier
          {...mockProps}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <button
          onClick={() => setShowTester(true)}
          className="px-6 py-3 bg-brand-indigo text-white rounded-xl shadow hover:bg-indigo-700 transition"
        >
          Reset Test
        </button>
      )}
    </div>
  );
}

export default App;
