import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const logoStyle = {
    fontSize: '45px',
    fontWeight: '600',
    cursor: 'pointer',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    fontFamily: 'Balthazar, serif',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px',
    marginLeft: '-150px',
  }

  return (
    <header>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 bg-black shadow-md" style={{ paddingTop: '2.05rem', paddingBottom: '1.05rem' }}>
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <div className="flex items-center ">
            <a
              href="/"
              className=" text-[#d4d4dc] font-extrabold text-xl transition-colors transform hover:text-[#feda6a] hover:-translate-y-0.5"
              aria-label="Home"
              style={logoStyle}
            >
              One Piece
            </a>
          </div>

          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-1 rounded-md text-sm text-[#d4d4dc] border border-transparent hover:bg-[#feda6a] hover:text-[#1d1e22] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#feda6a]"
              aria-label="Login"
            >
              Login
            </button>

            <button
              onClick={() => navigate('/register')}
              className="px-3 py-1 rounded-md text-sm bg-[#feda6a] text-[#1d1e22] hover:brightness-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#feda6a]"
              aria-label="Register"
            >
              Register
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
