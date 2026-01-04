import React, { useState, useEffect } from "react";
import { ProfileService } from "../api/services";
import { maskIban, formatCurrency, formatDate } from "../utils/formatters";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import {
  FiRefreshCw,
  FiShield,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";
import { MdOutlinePayments } from "react-icons/md";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);

  const [newIban, setNewIban] = useState("");
  const [ibanError, setIbanError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userData, financialData] = await Promise.all([
        ProfileService.getProfile(),
        ProfileService.getFinancials(),
      ]);
      setUser(userData);
      setFinancials(financialData);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const isValidIban = (iban) => {
    if (!iban) return false;
    const normalized = iban.replace(/\s+/g, "").toUpperCase();
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;
    return ibanRegex.test(normalized);
  };

  const openModal = () => {
    setNewIban("");
    setIbanError("");
    setModalMessage(null);
    setIsModalOpen(true);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    if (!isValidIban(newIban)) {
      setIbanError("Please enter a valid IBAN.");
      return;
    }

    setProcessLoading(true);
    setModalMessage(null);

    try {
      const { transactionId } = await ProfileService.requestIbanChange(
        newIban.replace(/\s+/g, "")
      );

      setIsModalOpen(false);

      navigate("/verify-identity", {
        state: {
          email: user.email,
          transactionId,
          newIban: newIban.replace(/\s+/g, ""),
        },
      });
    } catch (err) {
      setModalMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to request IBAN change. Please try again.",
      });
    } finally {
      setProcessLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-brand-indigo font-medium">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Hello, {user?.fullName?.split(" ")[1]}
        </h1>
        <p className="text-gray-500 mt-1">Here is your financial overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase">
              Next Payout
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {financials ? formatDate(financials.nextPayDate) : "N/A"}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-brand-indigo rounded-full">
            <FiCalendar size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase">
              Base Salary
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {financials
                ? formatCurrency(financials.baseSalary, financials.currency)
                : "N/A"}
            </p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <MdOutlinePayments size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-brand-indigo to-brand-magenta p-6 rounded-2xl shadow-lg text-white flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium uppercase">
              Employee Status
            </p>
            <p className="text-2xl font-bold mt-1">
              {financials?.employmentStatus || "Unknown"}
            </p>
            <p className="text-xs text-indigo-200 mt-1">
              {financials?.jobTitle}
            </p>
          </div>
          <div className="p-3 bg-white/20 rounded-full">
            <FiCheckCircle size={24} />
          </div>
        </div>
      </div>

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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Request IBAN Change
              </h3>

              {modalMessage && (
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

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New IBAN
                  </label>
                  <input
                    type="text"
                    required
                    value={newIban}
                    onChange={(e) => {
                      setNewIban(e.target.value.toUpperCase());
                      setIbanError("");
                    }}
                    placeholder="RO..."
                    className={`block w-full px-4 py-3 border rounded-xl outline-none ${
                      ibanError
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-brand-indigo"
                    }`}
                  />
                  {ibanError && (
                    <p className="text-sm text-red-500 mt-1">{ibanError}</p>
                  )}
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
                    className="flex-1 py-3 bg-brand-indigo text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {processLoading ? "Sending..." : "Next"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
