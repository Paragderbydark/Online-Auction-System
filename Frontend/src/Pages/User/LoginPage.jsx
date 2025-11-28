import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config, { USER_SERVICE_URL } from '../../Utils/config';
import LoginPageCar from '../../assets/LoginPageCar.mp4';
import { isAuthenticated, setAuthToken, getAuthToken, getAuthHeaders, getUserData, getUserRole, getUserInfo, debugAuthState, handleLoginSuccess } from '../../Utils/auth';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SERVER_URL = config.server_url;

const RightPanel = () => (
  <div
    id="login-right-panel"
    className="hidden lg:flex w-1/2 items-center justify-center p-0 rounded-r-2xl relative overflow-hidden"
    style={{ minHeight: '520px' }}
  >
    <video
      className="absolute inset-0 w-full h-full object-cover"
      src={LoginPageCar}
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
      style={{ objectPosition: 'center', transform: 'scale(1.04)' }}
    />

    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(135deg, rgba(29,30,34,0.48), rgba(57,63,77,0.24))' }}
    />

    <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 10% 20%, rgba(246,222,106,0.04), transparent 20%), radial-gradient(circle at 90% 80%, rgba(212,212,220,0.02), transparent 25%)' }} />
  </div>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 6;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setCaptchaText(result);
  };

  useEffect(() => {
    generateCaptcha();
    
    if (isAuthenticated()) {
      const userData = getUserData();
      console.log('Already authenticated, user data:', userData);
      
      if (userData && userData.roles) {
        if (userData.roles.includes('ROLE_ADMIN')) {
          navigate('/admin', { replace: true });
        } else if (userData.roles.includes('ROLE_SELLER')) {
          navigate('/seller', { replace: true });
        } else if (userData.roles.includes('ROLE_BUYER')) {
          navigate('/buyer', { replace: true });
        } else {
          navigate('/buyer', { replace: true });
        }
      } else {
        const userRole = getUserRole();
        if (userRole === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else if (userRole === 'SELLER') {
          navigate('/seller', { replace: true });
        } else {
          navigate('/buyer', { replace: true });
        }
      }
      return;
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userInput !== captchaText) {
      setMessage({ text: 'Incorrect Captcha. Please try again.', type: 'error' });
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // const response = await axios.post( `${SERVER_URL}/auth/login`, {
      const response = await axios.post( `${USER_SERVICE_URL}/auth/login`, {
        username: email,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = response.data;

      if (response.status === 200 && data.success && data.data) {
        console.log('Login successful, processing user data...');
        const user = handleLoginSuccess(data);
                
        if (!isAuthenticated()) {
          console.error('Authentication failed after login success');
          setMessage({ text: 'Authentication error. Please try again.', type: 'error' });
          return;
        }
        
        setMessage({ text: 'Login successful!', type: 'success' });
        setEmail('');
        setPassword('');
        setUserInput('');
        
        debugAuthState();
        
        if (user.roles && user.roles.includes('ROLE_ADMIN')) {
          navigate('/admin', { replace: true });
        } else if (user.roles && user.roles.includes('ROLE_SELLER') && user.roles.includes('ROLE_BUYER')) {
          navigate('/buyer', { replace: true });
        } else if (user.roles && user.roles.includes('ROLE_BUYER')) {
          navigate('/buyer', { replace: true });
        } else {
          navigate('/buyer', { replace: true });
        }

      } else {
        setMessage({ text: data.message || 'Invalid credentials', type: 'error' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({
        text: error.response.data.message,
        type: 'error'
      });
      generateCaptcha();
      setEmail('');
      setPassword('');
      setUserInput('');
    } finally {
      setIsLoading(false);
    }
  };

  const reloadCaptcha = () => {
    generateCaptcha();
  };

  const matte = '#393f4d';
  const dark = '#1d1e22';
  const silver = '#d4d4dc';
  const yellow = '#feda6a';

  return (
    <div className="flex justify-center items-center h-screen w-full px-4" style={{ backgroundColor: dark }}>
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

      <div className="flex w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div className="w-1/2 p-6 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-extrabold mb-1 leading-tight" style={{ color: dark }}>Login</h1>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: matte }}>Username</label>
                <input
                  name="username"
                  type="text"
                  placeholder="Please insert your username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="reg-input w-full h-10 px-3 text-sm border rounded-lg box-border transition duration-200"
                  style={{ borderColor: silver, color: matte }}
                />
              </div>

              <div className="mb-3">
                <label className="block mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: matte }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Please insert your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="reg-input w-full h-10 px-3 text-sm border rounded-lg box-border transition duration-200"
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

              <div className="mb-4">
                <label className="block mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: matte }}>Captcha</label>
                <div className="flex items-center gap-4 mb-3">
                  <div className="px-4 py-2 rounded-lg font-bold text-xl select-none" style={{ backgroundColor: matte, color: silver }}>{captchaText}</div>
                  <button type="button" onClick={reloadCaptcha} className="text-sm" style={{ color: matte }}>Reload</button>
                </div>
                <input
                  name="captcha"
                  type="text"
                  placeholder="Enter the text above"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  required
                  className="reg-input w-full h-10 px-3 text-sm border rounded-lg box-border transition duration-200"
                  style={{ borderColor: silver, color: matte }}
                />
              </div>

              {message.text && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-medium border ${message.type === 'success' ? '' : ''}`} style={{ backgroundColor: message.type === 'success' ? '#e6f4ea' : '#fdecea', color: dark }}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="reg-button w-full h-12 rounded-lg border-none font-bold text-base uppercase tracking-wider transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: matte, color: silver }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="text-center mt-4 text-sm">
                <button type="button" onClick={() => navigate('/reset-password')} className="underline" style={{ color: matte, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Recover password!</button>
                <span className="mx-2" style={{ color: 'rgba(0,0,0,0.15)' }}>|</span>
                <a href="/register" className="underline" style={{ color: matte }}>Sign up!</a>
              </div>
            </form>
          </div>
        </div>

        <RightPanel />
      </div>

      <style>{`
        .reg-input::placeholder { color: rgba(107,114,128,0.7); }
        .reg-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(57,63,77,0.1); border-color: ${matte} !important; }
        .reg-button:hover:not(:disabled) { background-color: ${dark} !important; }
        @media (max-width: 1024px) { #login-right-panel { display: none !important; } }
      `}</style>
    </div>
  );
};

export default LoginPage;
