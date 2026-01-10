import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ProfileService } from "../api/services";
import { maskIban, formatCurrency, formatDate } from "../utils/formatters";
import Layout from "../components/Layout";
import {
  FiRefreshCw,
  FiShield,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIban, setNewIban] = useState("");
  const [processLoading, setProcessLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate(); // Added missing hook

  useEffect(() => {
    fetchData();
    checkForSuccess();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Profile (Critical)
      // If this fails (e.g. 401), the main catch block handles it
      const userData = await ProfileService.getProfile();
      setUser(userData);

      // 2. Fetch Financials (Optional / Independent)
      // We wrap this in its own try-catch so a 404 doesn't break the page
      try {
        const financialData = await ProfileService.getFinancials();
        setFinancials(financialData);
      } catch (finError) {
        // It's normal for new users to not have financial records yet (404)
        console.warn("Financial data not found:", finError);
        setFinancials(null);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
      // If profile fails, redirect to login
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkForSuccess = () => {
    const status = searchParams.get("status");
    if (status === "success") {
      toast.success("Identity Verified. IBAN Updated Successfully!");
      setSearchParams({});
    }
  };

  const handleInitiateUpdate = async (e) => {
    e.preventDefault();
    setProcessLoading(true);

    try {
      const response = await ProfileService.initiateIbanUpdate(newIban);

      if (response && response.transactionId) {
        const txnId = response.transactionId;
        const token = localStorage.getItem("token");
        const email = user.email;

        const otpAppUrl = `http://localhost:3001`;
        const returnUrl = window.location.origin + "/dashboard";

        // REDIRECT with Payload
        window.location.href = `${otpAppUrl}?txnId=${txnId}&email=${email}&token=${token}&returnUrl=${returnUrl}`;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate update.");
    } finally {
      setProcessLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center font-medium">
        Loading...
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
            <FiDollarSign size={24} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-brand-indigo to-brand-magenta p-6 rounded-2xl shadow-lg text-white flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium uppercase">
              Employee Status
            </p>
            <p className="text-2xl font-bold mt-1">
              {financials?.employmentStatus || "New / Unknown"}
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
            onClick={() => setIsModalOpen(true)}
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
            ></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Request Update
              </h3>
              <form onSubmit={handleInitiateUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New IBAN
                  </label>
                  <input
                    type="text"
                    required
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-indigo outline-none"
                    value={newIban}
                    onChange={(e) => setNewIban(e.target.value.toUpperCase())}
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
                    className="flex-1 py-3 bg-brand-indigo text-white rounded-xl font-medium hover:bg-indigo-700"
                  >
                    {processLoading ? "Redirecting..." : "Verify Identity"}
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
