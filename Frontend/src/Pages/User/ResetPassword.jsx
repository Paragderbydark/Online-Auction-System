import React, { useState } from 'react';
import config from '../../Utils/config';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';

const SERVER_URL = config.server_url;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    oldPassword: '',
    newPassword: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!formData.username || !formData.oldPassword || !formData.newPassword) {
      setMessage('All fields are required.');
      return;
    }
    if (formData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long.');
      return;
    }
    setIsLoading(true);
    try {
      // const response = await axios.put(`${SERVER_URL}/auth/reset-password`,
      const response = await axios.put(`${USER_SERVICE_URL}/auth/reset-password`,
        {
          username: formData.username,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: { 
            'Content-Type': 'application/json' 
          },
        }
      );
      const data = response.data;
      if (response.status === 200 && data.success) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.message || 'Password reset failed.');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const matte = '#393f4d';
  const dark = '#1d1e22';
  const silver = '#d4d4dc';
  const yellow = '#feda6a';

  return (
    <div className="flex justify-center items-center min-h-screen w-full px-4" style={{ backgroundColor: dark }}>
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
      <div className="flex w-full max-w-6xl justify-center items-center" style={{ minHeight: '100vh' }}>
        <div className="bg-white shadow-2xl rounded-2xl flex flex-col items-center justify-center" style={{ width: 420, height: 420, boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.22)', borderRadius: 32 }}>
          <div className="w-full max-w-xs px-4">
            <h1 className="text-2xl font-extrabold mb-3 leading-tight text-center" style={{ color: dark }}>Reset Password</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="block mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: matte }}>Username</label>
                <input
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="reg-input w-full h-9 px-3 text-sm border rounded-lg box-border transition duration-150"
                  style={{ borderColor: silver, color: matte }}
                />
              </div>
              <div className="mb-2">
                <label className="block mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: matte }}>Old Password</label>
                <input
                  name="oldPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                  className="reg-input w-full h-9 px-3 text-sm border rounded-lg box-border transition duration-150"
                  style={{ borderColor: silver, color: matte }}
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: matte }}>New Password</label>
                <input
                  name="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="reg-input w-full h-9 px-3 text-sm border rounded-lg box-border transition duration-150"
                  style={{ borderColor: silver, color: matte }}
                />
              </div>
              <button
                type="submit"
                className="reg-button w-full h-10 rounded-lg font-semibold text-sm tracking-wide transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: matte, color: silver }}
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
            {message && (
              <div className="mt-3 p-3 rounded-md text-sm font-medium border text-center" style={{ backgroundColor: message.includes('successful') ? '#e6f4ea' : '#fdecea', color: dark, borderColor: message.includes('successful') ? yellow : 'rgba(245,100,100,0.12)'}}>
                {message}
              </div>
            )}
            <div className="text-center mt-3 text-sm">
              <button onClick={() => navigate('/login')} className="bg-transparent p-0 underline font-semibold" style={{ color: matte, cursor: 'pointer' }}>
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .reg-input::placeholder { color: rgba(107,114,128,0.65); }
        .reg-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(57,63,77,0.08); border-color: ${matte} !important; }
        .reg-button:hover:not(:disabled) { background-color: ${dark} !important; }
      `}</style>
    </div>
  );
};

export default ResetPassword;