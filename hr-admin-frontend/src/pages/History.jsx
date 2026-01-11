import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { ProfileService } from "../api/services";
import { formatCurrency, formatDate } from "../utils/formatters";
import { FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import PayslipModal from "../components/PayslipModal";

const History = () => {
  const [user, setUser] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);

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
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!financials?.payoutHistory?.length) return;

    const dataToExport = financials.payoutHistory.map((item) => ({
      Date: new Date(item.date).toLocaleDateString("ro-RO"),
      Reference: item.reference,
      Status: item.status,
      Amount: item.amount,
      Currency: financials.currency,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    const wscols = [
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ];
    worksheet["!cols"] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll History");

    XLSX.writeFile(
      workbook,
      `Payroll_History_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    ProfileService.logAction("PAYROLL_EXPORT");
  };

  return (
    <Layout>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll History</h1>
          <p className="text-gray-500">
            View your past transactions and download slips.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm active:bg-gray-100 transition-colors"
        >
          <FiDownload /> Export All
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading history...
          </div>
        ) : financials?.payoutHistory?.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {financials.payoutHistory.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {formatDate(item.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                    {item.reference}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900 text-right">
                    {formatCurrency(item.amount, "RON")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedSlip(item)}
                      className="text-brand-indigo hover:text-indigo-800 text-sm font-medium hover:underline"
                    >
                      View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No payment history found.
          </div>
        )}
      </div>

      {/* Render Modal if a slip is selected */}
      {selectedSlip && (
        <PayslipModal
          payout={selectedSlip}
          user={user}
          financials={financials}
          onClose={() => setSelectedSlip(null)}
        />
      )}
    </Layout>
  );
};

export default History;
