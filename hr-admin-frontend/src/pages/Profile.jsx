import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { ProfileService } from "../api/services";
import { maskIban } from "../utils/formatters";
import { FiUser, FiMail, FiShield, FiCreditCard } from "react-icons/fi";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    ProfileService.getProfile().then(setUser).catch(console.error);
  }, []);

  if (!user)
    return (
      <Layout>
        <div className="p-10 text-center">Loading Profile...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">
            Manage your personal account settings.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-r from-brand-indigo to-brand-magenta"></div>

          <div className="px-8 pb-8 relative">
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                  Personal Information
                </h3>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-400">
                    <FiUser size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Full Name
                    </p>
                    <p className="text-gray-900 font-medium">{user.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-400">
                    <FiMail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Email Address
                    </p>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                  Financial Security
                </h3>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-lg text-brand-indigo">
                    <FiCreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Active IBAN
                    </p>
                    <p className="font-mono text-gray-900 bg-gray-50 px-2 rounded">
                      {maskIban(user.iban)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-lg text-green-600">
                    <FiShield size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Account Status
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified & Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
