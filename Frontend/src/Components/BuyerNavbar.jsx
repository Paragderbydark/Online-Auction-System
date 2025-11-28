import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';
import { getUserData, isSeller, logout } from '../Utils/auth';
import axios from 'axios';

import '../Styles/NavbarStyles.css';
import config, { SERVER_URL, USER_SERVICE_URL } from '../Utils/config';


const BuyerNavbar = () => {

  const navigate = useNavigate();
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState(null);
  const [showSellerDialog, setShowSellerDialog] = useState(false);
  const navContainerRef = useRef(null);

  const handleLogoClick = () => {
    navigate('/buyer');
  }

  const handleLogout = () => {
    logout();
  }

  const getItemPosition = (itemIndex) => {
    if (!navContainerRef.current || hoveredNavItem === null) return { width: 0, left: 0 };

    const navItems = navContainerRef.current.children;
    const targetItem = navItems[itemIndex + 1];

    if (!targetItem) return { width: 0, left: 0 };

    return {
      width: targetItem.offsetWidth,
      left: targetItem.offsetLeft,
    };
  };

  const assignSellerRole = async () => {
    const userData = getUserData();
    const userId = userData.userId;
    const token = localStorage.getItem('authToken');
    try {
      // const response = await axios.post(`${SERVER_URL}/users/assign-seller-role/${userId}`, {}, {
      const response = await axios.post(`${USER_SERVICE_URL}/assign-seller-role/${userId}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    }
    catch (error) {
      console.error('Error assigning seller role:', error);
    }
  }
  const checkSellerRole = async () => {
    if (isSeller()) {
      navigate('/seller');
    } else {
      setShowSellerDialog(true);
    }
  }

  const handleSellerDialogYes = async () => {
    await assignSellerRole();
    setShowSellerDialog(false);
    logout();
    navigate('/login');
  };

  const handleSellerDialogNo = () => {
    setShowSellerDialog(false);
  };

  const currentPosition = getItemPosition(hoveredNavItem);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
      if (showProfileDropdown && !event.target.closest('.profile-container')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showProfileDropdown]);

  const navStyle = {
    height: '83px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px',
    background: 'linear-gradient(135deg, #1d1e22, #202125ff)',
    color: '#d4d4dc',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
  }

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

  const iconContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  }

  const navItemsContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
    marginRight: '20px',
  }

  const navItemStyle = {
    color: '#d4d4dc',
    fontSize: '19px',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    fontFamily: 'PT Sans, sans-serif',
    position: 'relative',
    letterSpacing: '0.5px',
    zIndex: 2,
  }

  const slidingBackgroundStyle = {
    position: 'absolute',
    height: '40px',
    backgroundColor: 'rgba(254, 218, 106, 0.15)',
    borderRadius: '8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1,
    border: '1px solid rgba(254, 218, 106, 0.3)',
  }

  const iconStyle = {
    fontSize: '24px',
    height: 'auto',
    width: 'auto',
    cursor: 'pointer',
    padding: '12px',
    display: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d4d4dc',
    transition: 'all 0.3s ease',
  }

  const hoverStyle = {
    transform: 'translateY(-2px) scale(1.05)',
    color: '#feda6a',
  }

  const profileIconStyle = {
    fontSize: '55px',
    cursor: 'pointer',
    padding: '12px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d4d4dc',
  }


  return (
    <div>
      <div style={navStyle}>
        <h1
          style={logoStyle}
          onClick={handleLogoClick}
          className="logo-hover"
        >
          One Piece
        </h1>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={navItemsContainerStyle} ref={navContainerRef}>
            <div
              style={{
                ...slidingBackgroundStyle,
                width: currentPosition.width,
                left: currentPosition.left,
                opacity: hoveredNavItem !== null ? 1 : 0,
              }}
            />

            <span
              style={{
                ...navItemStyle,
                color: '#feda6a',
                fontWeight: 'bold',
                position: 'relative',
              }}
              className="nav-item-current-page"
            >
              Buy
            </span>

            <span
              style={{
                ...navItemStyle,
                ...(hoveredNavItem === 1 ? { color: '#feda6a' } : {}),
              }}
              className={hoveredNavItem === 1 ? 'nav-item-active' : ''}
              onClick={checkSellerRole}
              onMouseEnter={() => setHoveredNavItem(1)}
              onMouseLeave={() => setHoveredNavItem(null)}
            >
              Sell
            </span>

            <div
              className="history-dropdown-container"
              style={{ position: 'relative' }}
            >
              <span
                style={{
                  ...navItemStyle,
                  ...(hoveredNavItem === 2 ? { color: '#feda6a' } : {}),
                }}
                className={hoveredNavItem === 2 ? 'nav-item-active' : ''}
                onClick={() => navigate('/buyer/payments')}
                onMouseEnter={() => setHoveredNavItem(2)}
                onMouseLeave={() => setHoveredNavItem(null)}
              >
                Payments
              </span>
            </div>

            <span
              style={{
                ...navItemStyle,
                ...(hoveredNavItem === 3 ? { color: '#feda6a' } : {}),
              }}
              className={hoveredNavItem === 3 ? 'nav-item-active' : ''}
              onClick={() => navigate('/buyer/reviews')}
              onMouseEnter={() => setHoveredNavItem(3)}
              onMouseLeave={() => setHoveredNavItem(null)}
            >
              Reviews
            </span>
          </div>

          <div style={iconContainerStyle}>
            <div className={`icon-container profile-container ${showProfileDropdown ? 'active' : ''}`}>
              <AccountCircleSharpIcon
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{
                  ...profileIconStyle,
                  ...(hoveredIcon === 'profile' ? hoverStyle : {}),
                }}
                className="icon-hover"
                onMouseEnter={() => setHoveredIcon('profile')}
                onMouseLeave={() => setHoveredIcon(null)}
              />
              <div className="tooltip">Profile</div>

              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div
                    className="profile-dropdown-item"
                    onClick={() => {
                      navigate('/userprofile');
                      setShowProfileDropdown(false);
                    }}
                  >
                    <FaUser className="profile-dropdown-icon" />
                    View Profile
                  </div>
                  <div
                    className="profile-dropdown-item"
                    onClick={() => {
                      handleLogout();
                      setShowProfileDropdown(false);
                    }}
                  >
                    <FaSignOutAlt className="profile-dropdown-icon" />
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSellerDialog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#222', padding: '32px 24px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)', minWidth: 420, color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 18 }}>Currently, You do not have seller privileges.<br/>Do you want to register as a seller for OnePiece?</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
              <button onClick={handleSellerDialogYes} style={{ padding: '8px 24px', background: '#feda6a', color: '#222', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>Continue</button>
              <button onClick={handleSellerDialogNo} style={{ padding: '8px 24px', background: '#444', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuyerNavbar