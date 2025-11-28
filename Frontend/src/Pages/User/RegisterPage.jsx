import React, { useState } from 'react';
import config, { USER_SERVICE_URL } from '../../Utils/config';
import { useNavigate } from 'react-router-dom';
import bg_image from '../../assets/RegisterPage.jpg';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SERVER_URL = config.server_url;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => {
      const newValue = type === 'checkbox' ? checked : value;
      const updated = { ...prev, [name]: newValue };
      if (name === 'isSeller' && !newValue) {
        updated.licenseKey = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    if (!formData.username) {
      setMessage('Please enter a username');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // const response = await axios.post(`${SERVER_URL}/auth/register`, {
      const response = await axios.post(`${USER_SERVICE_URL}/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data;
      
      if (data.success) {
        setMessage('Registration successful! Redirecting to login...');
        navigate('/login');
      } else {
        console.error('Registration failed:', data);
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const matte = '#393f4d';
  const dark = '#1d1e22';
  const silver = '#d4d4dc';
  const yellow = '#feda6a';


  const RightPanel = () => (
    <div
      id="register-right-panel"
      className="hidden lg:flex w-1/2 items-center justify-center p-6 rounded-r-2xl relative overflow-hidden"
      style={{ borderTopRightRadius: '16px', borderBottomRightRadius: '16px' }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bg_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'saturate(0.9) contrast(0.95) brightness(0.9)'
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(29,30,34,0.72), rgba(57,63,77,0.44))'
        }}
      />

      <div className="relative z-10 text-center px-4">
        <h2 className="text-xl font-bold mb-2" style={{ color: silver }}>
          Welcome to AuctionBidding
        </h2>
        <p className="text-sm" style={{ color: 'rgba(212,212,220,0.9)' }}>
          Discover, bid and sell with confidence. Join as a Buyer or Seller to start exploring.
        </p>
      </div>
    </div>
  );


  return (
    <div 
      className="flex justify-center items-center min-h-screen w-full px-4"
      style={{ backgroundColor: dark }} 
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          left: 32,
          top: 32,
          background: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 10,
          cursor: 'pointer',
          padding: 0
        }}
        aria-label="Back"
      >
        <IoMdArrowRoundBack size={26} color="#222" />
      </button>
      <div 
        className="flex w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.22)' }}
      >
        <div
          id="register-left-panel"
          className="hidden lg:flex w-3/5 items-center justify-center relative overflow-hidden"
          style={{ minHeight: '520px' }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${bg_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'saturate(0.95) contrast(0.96) brightness(0.95)'
            }}
          />

          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(29,30,34,0.28), rgba(57,63,77,0.18))' }}
          />
        </div>

        <div className="w-2/5 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <h1 
              className="text-2xl font-extrabold mb-1 leading-tight"
              style={{ color: dark }} 
              
            >
              Create Account
            </h1>
            

            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="block mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: matte }}>Username</label>
                <input
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="reg-input w-full h-9 px-3 text-sm border rounded-lg box-border transition duration-150"
                  style={{ borderColor: silver, color: matte }}
                />
              </div>

              <div className="mb-2">
                <label className="block mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: matte }}>Email address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="reg-input w-full h-9 px-3 text-sm border rounded-lg box-border transition duration-150"
                  style={{ borderColor: silver, color: matte }}
                />
              </div>

              <div className="mb-2">
                <label className="block mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: matte }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="reg-input w-full h-9 px-3 text-sm border rounded-lg box-border transition duration-150"
                    style={{ borderColor: silver, color: matte }}
                  />
                  <span
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: matte }}
                    tabIndex={0}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="block mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: matte }}>Confirm password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="reg-input w-full h-9 px-3 text-sm border rounded-lg box-border transition duration-150"
                    style={{ borderColor: silver, color: matte }}
                  />
                  <span
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: matte }}
                    tabIndex={0}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="reg-button w-full h-10 rounded-lg font-semibold text-sm tracking-wide transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: matte, color: silver }}
                onClick={handleSubmit}
              >
                {isLoading ? 'Signing up...' : 'Create account'}
              </button>
            </form>

            {message && (
              <div className="mt-3 p-3 rounded-md text-sm font-medium border" style={{ backgroundColor: message.includes('successful') ? '#e6f4ea' : '#fdecea', color: dark, borderColor: message.includes('successful') ? yellow : 'rgba(245,100,100,0.12)'}}>
                {message}
              </div>
            )}

            <div className="text-center mt-3 text-sm">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="bg-transparent p-0 underline font-semibold" style={{ color: matte, cursor: 'pointer' }}>
                Login here
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .reg-input::placeholder { color: rgba(107,114,128,0.65); }
        .reg-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(57,63,77,0.08); border-color: ${matte} !important; }
        .reg-button:hover:not(:disabled) { background-color: ${dark} !important; }
        @media (max-width: 1024px) { #register-left-panel { display: none !important; } }
      `}</style>
    </div>
  );
};

export default RegisterPage;