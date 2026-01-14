import React from "react";
import { FiAlertTriangle, FiX, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function SecurityAlertModal({ onClose }) {
  const navigate = useNavigate();

  const handleReviewDetails = () => {
    onClose();
    navigate("/profile");
  };
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-fade-in-up border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <FiX size={20} />
        </button>

        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-25"></div>
            <FiAlertTriangle className="h-10 w-10 text-red-600 relative z-10" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Security Alert
          </h3>

          <p className="text-gray-500 mb-8 leading-relaxed">
            Our fraud detection system flagged a suspicious pattern in your
            recent activity. The IBAN provided does not match standard regional
            formats.
          </p>

          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8 text-left flex gap-4 items-start">
            <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
              <FiShield className="text-orange-500" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">
                Recommended Action
              </h4>
              <p className="text-sm text-gray-600 leading-snug">
                Verify your banking details immediately. If you did not
                authorize this change, please contact HR Support.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              Dismiss
            </button>
            <button
              onClick={handleReviewDetails}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all transform active:scale-95"
            >
              Review Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
