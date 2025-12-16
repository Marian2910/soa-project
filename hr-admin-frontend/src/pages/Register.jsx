import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiCreditCard, FiArrowRight } from 'react-icons/fi';
import logo from '../assets/logo.png';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', iban: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(formData);
    if (result.success) {
      alert("Registration successful! Please login.");
      navigate('/login');
    } else {
      setError(result.message);
    }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const InputField = ({ icon, name, type, placeholder }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        onChange={handleChange}
        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex bg-brand-gray items-center justify-center p-4 font-sans">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-10 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 text-sm">Join the secure payroll platform.</p>
        </div>

        {error && <div className="mb-4 text-center text-red-600 text-sm font-medium">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField icon={<FiUser />} name="fullName" type="text" placeholder="Full Name" />
          <InputField icon={<FiMail />} name="email" type="email" placeholder="Email Address" />
          <InputField icon={<FiLock />} name="password" type="password" placeholder="Password" />
          <InputField icon={<FiCreditCard />} name="iban" type="text" placeholder="Initial IBAN (RO...)" />

          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-magenta hover:bg-purple-700 text-white font-semibold rounded-xl transition-all mt-6 shadow-lg shadow-purple-500/30">
            Create Account <FiArrowRight />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-indigo hover:text-indigo-600">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;