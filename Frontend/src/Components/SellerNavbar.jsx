import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';
import '../Styles/NavbarStyles.css';
import { logout } from '../Utils/auth';

const SellerNavbar = () => {

    const navigate = useNavigate();
    const [hoveredIcon, setHoveredIcon] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [hoveredNavItem, setHoveredNavItem] = useState(null);
    const navContainerRef = useRef(null);

    const handleLogoClick = () => {
        navigate('/seller');
    }

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        logout();
    }

    const getItemPosition = (itemIndex) => {
        if (!navContainerRef.current || hoveredNavItem === null) return { width: 0, left: 0 };
        
        const navItems = navContainerRef.current.children;
        const targetItem = navItems[itemIndex + 1]; // +1 to skip the sliding background div
        
        if (!targetItem) return { width: 0, left: 0 };
        
        return {
            width: targetItem.offsetWidth,
            left: targetItem.offsetLeft,
        };
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
        position: 'relative',
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
        display: 'flex',
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
                ...(hoveredNavItem === 0 ? { color: '#feda6a' } : {}),
              }}
              className={hoveredNavItem === 0 ? 'nav-item-active' : ''}
              onClick={() => navigate('/buyer')}
              onMouseEnter={() => setHoveredNavItem(0)}
              onMouseLeave={() => setHoveredNavItem(null)}
            >
              Buy
            </span>
            <span
              style={{
                ...navItemStyle,
                color: '#feda6a',
                fontWeight: 'bold',
                position: 'relative',
              }}
              className="nav-item-current-page"
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
                onClick={() => navigate('/seller/payments')}
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
              onClick={() => navigate('/seller/reviews')}
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
    </div>
  )
}

export default SellerNavbar