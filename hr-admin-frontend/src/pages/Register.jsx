import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiUser,
  FiMail,
  FiLock,
  FiArrowRight,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import logo from "../assets/logo.png";

const InputField = ({
  icon,
  name,
  type,
  placeholder,
  value,
  onChange,
  togglePassword,
  showPassword,
}) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
      {icon}
    </div>
    <input
      name={name}
      type={type}
      required
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`block w-full pl-10 ${
        togglePassword ? "pr-10" : "pr-3"
      } py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white`}
    />
    {togglePassword && (
      <button
        type="button"
        onClick={togglePassword}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-magenta transition-colors cursor-pointer"
      >
        {showPassword ? <FiEyeOff /> : <FiEye />}
      </button>
    )}
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    iban: "", 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { confirmPassword, ...dataToSend } = formData;

    const result = await register(dataToSend);
    if (result.success) {
      alert("Registration successful! Please login.");
      navigate("/login");
    } else {
      setError(result.message);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen flex bg-brand-gray items-center justify-center p-4 font-sans">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-10 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 text-sm">
            Join the secure payroll platform.
          </p>
        </div>

        {error && (
          <div className="mb-4 text-center text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField
            icon={<FiUser />}
            name="fullName"
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
          />
          <InputField
            icon={<FiMail />}
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            icon={<FiLock />}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            togglePassword={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
          />
          <InputField
            icon={<FiLock />}
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            showPassword={showConfirmPassword}
          />

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-magenta hover:bg-purple-700 text-white font-semibold rounded-xl transition-all mt-6 shadow-lg shadow-purple-500/30"
          >
            Create Account <FiArrowRight />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand-indigo hover:text-indigo-600"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;