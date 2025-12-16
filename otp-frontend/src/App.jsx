import React, { useState } from "react";
import OtpVerifier from "./components/OtpVerifier";

function App() {
  const [showTester, setShowTester] = useState(true);

  // --- MOCK DATA FOR DEVELOPMENT ---
  // In production, these come from the Host App (HR Payroll)
  const mockProps = {
    token: "mock-jwt-token-for-dev-testing", // Replace with real token if testing against real backend
    email: "dev.user@company.com",
    transactionId: "tx-12345-dev",
    initialDuration: 60, // Short timer for quick testing
  };

  const handleSuccess = (code) => {
    console.log(" OTP Verified via MFE:", code);
    alert(`Success! Code ${code} passed validation.`);
    setShowTester(false);
  };

  const handleCancel = () => {
    console.log(" Transaction Cancelled by User");
    alert("User clicked Cancel.");
    setShowTester(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          OTP Micro Frontend
        </h1>
        <p className="text-gray-500">
          Running in Standalone Mode (Port 3001)
          <br />
          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
            Dev Environment
          </span>
        </p>
      </div>

      {showTester ? (
        // This is the component that gets exported to the Host
        <OtpVerifier
          {...mockProps}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <button
          onClick={() => setShowTester(true)}
          className="px-6 py-3 bg-brand-indigo text-white rounded-xl shadow-lg hover:bg-indigo-700 transition"
        >
          Reset Test
        </button>
      )}
    </div>
  );
}

export default App;
