import React, { Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileService } from "../api/services";
import { useAuth } from "../context/AuthContext";

const RemoteOtpVerifier = React.lazy(() => import("otp_app/OtpVerifier"));

export default function OtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, transactionId, newIban } = location.state || {};
  const { user } = useAuth();

  useEffect(() => {
    if (!transactionId || !newIban) {
      navigate("/dashboard", { replace: true });
    }
  }, [transactionId, newIban, navigate]);

  if (!transactionId || !newIban) {
    return null;
  }

  const handleVerificationSuccess = async (code) => {
    try {
      await ProfileService.updateIban(newIban, code, transactionId);

      toast.success("Identity Verified & IBAN Updated!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification Failed");
    }
  };

  const handleCancel = () => {
    toast.info("Update cancelled.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-brand-primary">
          Security Check
        </h1>
        <p className="text-gray-500">
          You are entering a secure micro-frontend environment.
        </p>
      </div>

      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="p-10 bg-white rounded-lg shadow-lg text-center animate-pulse">
              Loading Secure Module from Remote Server...
            </div>
          }
        >
          <RemoteOtpVerifier
            token={user.token}
            email={email}
            transactionId={transactionId}
            onSuccess={handleVerificationSuccess}
            onCancel={handleCancel}
          />
        </Suspense>
      </div>

      <div className="mt-8 text-xs text-gray-400">
        Powered by Module Federation (Port 3001)
      </div>
    </div>
  );
}
