import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function SecurityAlertModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-900/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-in border-2 border-red-500">
        <div className="bg-red-500 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <FiAlertTriangle className="text-yellow-300" size={24} />
            <span>Security Alert</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Suspicious Activity Detected
          </h3>
          <p className="text-gray-600 mb-6">
            Our automated fraud detection system has flagged your recent IBAN
            update as unusual (Non-Romanian Format).
          </p>

          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-bold text-red-800 uppercase mb-1">
              Recommendation
            </p>
            <p className="text-sm text-red-700">
              Please verify your banking details immediately. If this was not
              you, contact HR Support.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-md"
          >
            I Understand - Review Details
          </button>
        </div>
      </div>
    </div>
  );
}
