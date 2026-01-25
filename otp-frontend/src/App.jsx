import React, { useState, useEffect } from "react";
import OtpVerifier from "./components/OtpVerifier";

function App() {
  const [params, setParams] = useState({
    txnId: null,
    email: null,
    token: null,
    returnUrl: null,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const txnId = urlParams.get("txnId");
    const email = urlParams.get("email");
    const token = urlParams.get("token");
    const expiry = urlParams.get("expiry");
    const returnUrl = urlParams.get("returnUrl");

    if (txnId && token && returnUrl) {
      setParams({ txnId, email, token, expiry, returnUrl });
    } else {
      console.error("Missing required parameters in URL");
    }
  }, []);

  const handleCancel = () => {
    if (params.returnUrl) {
      window.location.href = params.returnUrl;
    }
  };

  if (!params.txnId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-sans">
        Invalid Session. Please start from the Payroll Dashboard.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm">
        <OtpVerifier
          email={params.email}
          transactionId={params.txnId}
          token={params.token}
          expiryTime={params.expiry}
          returnUrl={params.returnUrl}
          onCancel={handleCancel}
          initialDuration={120}
        />
        <p className="text-center mt-8 text-xs text-gray-400">
          Secure Verification Portal
        </p>
      </div>
    </div>
  );
}

export default App;
