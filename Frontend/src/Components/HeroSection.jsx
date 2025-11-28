import React, { useEffect } from 'react';
import carVideo from '../assets/car.mp4';
import { useNavigate } from 'react-router-dom';


const HeroSection = () => {
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
  }
  
  return (
    <section
      className="relative mt-[-25px] h-[70vh] md:h-[95vh] flex items-center justify-center p-4 my-4 mx-4 md:mx-auto max-w-10xl textured"
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        boxShadow: 'inset 0 0 120px rgba(0,0,0,0.35)'
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover top-0 left-0 z-0"
      >
        <source src={carVideo} type="video/mp4" />
      </video>

      <div className="text-center text-white relative z-10 px-4">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight" style={{ color: 'var(--hero-contrast, #d4d4dc)', fontFamily: 'Balthazar, serif', }}>
          A True Piece. A True Legacy
        </h2>
        <button
          className="bg-[#feda6a] text-[#1d1e22] font-semibold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer"
          style={{ boxShadow: '0 10px 25px rgba(254,218,106,0.15)' }}
          onClick={() => navigate('/login')}
        >
          Explore Now
        </button>
      </div>
    </section>
  );
};

export default HeroSection;