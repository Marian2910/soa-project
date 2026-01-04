import React from "react";
import { formatCurrency, formatDate } from "../utils/formatters";

export default function PayslipModal({ payout, user, financials, onClose }) {
  if (!payout || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-fade-in relative">
        {/* Header */}
        <div className="bg-brand-primary p-6 flex justify-between items-start text-gray-400">
          <div>
            <h2 className="text-2xl font-bold tracking-wide">PAYSLIP</h2>
            <p className="text-indigo-200 text-sm mt-1">
              HR Payroll System • Confidential
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-bold opacity-90">
              {payout.reference}
            </p>
            <p className="text-xs text-indigo-200 uppercase tracking-wider">
              Reference ID
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Employee & Payment Info Grid */}
          <div className="grid grid-cols-2 gap-8 mb-8 border-b border-gray-100 pb-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Employee Details
              </h3>
              <p className="font-bold text-gray-900 text-lg">{user.fullName}</p>
              <p className="text-gray-600">{financials?.jobTitle}</p>
              <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Payment Details
              </h3>
              <p className="font-bold text-gray-900">
                {formatDate(payout.date)}
              </p>
              <p className="text-gray-600">
                Transfer to: <span className="font-mono">{user.iban}</span>
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                {payout.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Financial Table */}
          <table className="w-full mb-8">
            <thead className="bg-gray-50 border-y border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">
                  Description
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4 text-gray-700 font-medium">
                  Net Salary Transfer
                </td>
                <td className="py-4 px-4 text-right font-mono text-gray-900">
                  {formatCurrency(payout.amount, financials?.currency)}
                </td>
              </tr>
            </tbody>
            <tfoot className="border-t border-gray-200">
              <tr>
                <td className="py-4 px-4 text-gray-900 font-bold text-lg">
                  Total Net Pay
                </td>
                <td className="py-4 px-4 text-right text-brand-primary font-bold text-2xl">
                  {formatCurrency(payout.amount, financials?.currency)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="text-center text-xs text-gray-400 mt-4">
            Generated electronically. Valid without signature.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
