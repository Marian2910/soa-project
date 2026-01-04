import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-[#3F51B5] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-white text-xl font-bold tracking-wider">
                HrPayroll{" "}
                <span className="text-[#FFD400] text-xs align-top">SYS</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-indigo-100 text-sm hidden md:block">
                  Welcome, {user.fullName || "Employee"}
                </span>
                <Link
                  to="/dashboard"
                  className="text-white hover:bg-[#303f9f] px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-[#C13C9E] text-white hover:bg-[#a03282] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-[#FFD400] px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-[#3F51B5] hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
