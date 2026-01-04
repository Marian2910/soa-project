import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { FiGrid, FiUser, FiLogOut, FiPieChart } from "react-icons/fi";
import logo from "../assets/logo.png";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: <FiGrid /> },
    { label: "My Profile", path: "/profile", icon: <FiUser /> },
    { label: "Payroll History", path: "/history", icon: <FiPieChart /> },
  ];

  return (
    <div className="flex h-screen bg-brand-gray text-slate-600 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        {/* Logo Area */}
        <div className="h-35 flex items-center p-8 border-b border-gray-100">
          <img
            src={logo}
            alt="HR Logo"
            className="h-30 center w-auto object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 
                  ${
                    isActive
                      ? "bg-indigo-50 text-brand-indigo shadow-sm ring-1 ring-indigo-100"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <span
                  className={`text-lg ${
                    isActive ? "text-brand-indigo" : "text-gray-400"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-indigo to-brand-magenta text-white flex items-center justify-center font-bold text-sm shadow-md">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user?.fullName}
              </p>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-xs text-red-500 font-medium hover:text-red-700 transition-colors"
              >
                <FiLogOut /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-brand-gray relative">
        <div className="w-full h-full px-8 py-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
