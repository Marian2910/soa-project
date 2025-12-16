import React from "react";
import Layout from "../components/Layout";
import { formatCurrency, formatDate } from "../utils/formatters";
import { FiDownload } from "react-icons/fi";

const History = () => {
  // Mock Data
  const payrolls = [
    { id: 1, date: "2025-11-25", amount: 4250, status: "Paid", type: "Salary" },
    { id: 2, date: "2025-10-25", amount: 4250, status: "Paid", type: "Salary" },
    { id: 3, date: "2025-09-25", amount: 4100, status: "Paid", type: "Salary" },
    { id: 4, date: "2025-08-15", amount: 500, status: "Paid", type: "Bonus" },
  ];

  return (
    <Layout>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll History</h1>
          <p className="text-gray-500">
            View your past transactions and download slips.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm">
          <FiDownload /> Export All
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Type
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
            {payrolls.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {formatDate(item.date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.type}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-gray-900 text-right">
                  {formatCurrency(item.amount)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-brand-indigo hover:text-indigo-800 text-sm font-medium">
                    View Slip
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default History;
