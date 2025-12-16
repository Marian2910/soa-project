import React, { useState, useEffect } from "react";
import { ProfileService, OtpService } from "../api/services";
import { maskIban } from "../utils/formatters";
import Layout from "../components/Layout";
import {
  FiRefreshCw,
  FiShield,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ newIban: "", otpCode: "" });
  const [transactionId, setTransactionId] = useState(null);
  const [processLoading, setProcessLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState({ type: "", text: "" });
  const OtpVerifier = React.lazy(() => import("otp_app/OtpVerifier"));

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await ProfileService.getProfile();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setStep(1);
    setFormData({ newIban: "", otpCode: "" });
    setModalMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setProcessLoading(true);
    setModalMessage({ type: "", text: "" });

    try {
      const response = await OtpService.requestOtp();
      if (response.transactionId) setTransactionId(response.transactionId);
      setStep(2);
      setModalMessage({ type: "success", text: "OTP sent to your email!" });
    } catch (err) {
      setModalMessage({ type: "error", text: "Failed to send OTP." });
    } finally {
      setProcessLoading(false);
    }
  };

  const handleFinalizeUpdate = async (e) => {
    e.preventDefault();
    setProcessLoading(true);

    try {
      await ProfileService.updateIban(
        formData.newIban,
        formData.otpCode,
        transactionId
      );
      await fetchProfile();
      setIsModalOpen(false);
      alert("IBAN Updated Successfully!");
    } catch (err) {
      setModalMessage({ type: "error", text: "Invalid OTP or Failed." });
    } finally {
      setProcessLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-brand-indigo font-medium">
        Loading Dashboard...
      </div>
    );

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Hello, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 mt-1">Here is your financial overview.</p>
      </header>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase">
              Next Payout
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">Dec 25</p>
          </div>
          <div className="p-3 bg-indigo-50 text-brand-indigo rounded-full">
            <FiCalendar size={24} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase">
              Net Salary
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">$4,250</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <FiDollarSign size={24} />
          </div>
        </div>

        {/* Card 3 - Status */}
        <div className="bg-gradient-to-br from-brand-indigo to-brand-magenta p-6 rounded-2xl shadow-lg text-white flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium uppercase">
              Employee Status
            </p>
            <p className="text-2xl font-bold mt-1">Active</p>
          </div>
          <div className="p-3 bg-white/20 rounded-full">
            <FiCheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* IBAN SECTION */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
          <FiShield className="text-brand-magenta" />
          <h2 className="font-bold text-gray-800">Banking Details</h2>
        </div>

        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Current IBAN
            </label>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-xl text-gray-700 bg-gray-50 px-3 py-1 rounded border border-gray-200">
                {maskIban(user?.iban)}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                Verified
              </span>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-brand-indigo hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md shadow-indigo-500/20"
          >
            <FiRefreshCw /> Update IBAN
          </button>
        </div>
      </section>

      {/* MODAL (Re-styled) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsModalOpen(false)}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 overflow-hidden">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {step === 1 ? "Request Change" : "Security Check"}
              </h3>

              {/* Message Banner */}
              {modalMessage.text && (
                <div
                  className={`p-3 rounded-lg text-sm mb-4 ${
                    modalMessage.type === "error"
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {modalMessage.text}
                </div>
              )}

              {/* STEP 1 FORM */}
              {step === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New IBAN
                    </label>
                    <input
                      type="text"
                      required
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-indigo outline-none"
                      value={formData.newIban}
                      onChange={(e) =>
                        setFormData({ ...formData, newIban: e.target.value })
                      }
                      placeholder="RO..."
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processLoading}
                      className="flex-1 py-3 bg-brand-indigo text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                    >
                      {processLoading ? "Sending..." : "Next"}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2 FORM */}
              {step === 2 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                  <React.Suspense
                    fallback={
                      <div className="text-white">
                        Loading Security Module...
                      </div>
                    }
                  >
                    <OtpVerifier
                      token={user.token}
                      email={user.email}
                      transactionId={transactionId}
                      initialDuration={120}
                      onSuccess={(code) => {
                        handleFinalizeUpdate(code);
                      }}
                      onCancel={() => {
                        setIsModalOpen(false);
                        setStep(1);
                      }}
                    />
                  </React.Suspense>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
