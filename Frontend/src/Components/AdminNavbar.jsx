import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { logout } from '../Utils/auth';

const AdminNavbar = () => {

    const navigate = useNavigate();
    const [hoveredIcon, setHoveredIcon] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [hoveredNavItem, setHoveredNavItem] = useState(null);
    const navContainerRef = useRef(null);

    const handleLogoClick = () => {
        navigate('/admin');
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
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
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
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    }

    const iconContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        height: '100%',
    }

    const navItemsContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        position: 'relative',
        marginRight: '20px',
    }

    const navItemStyle = {
        color: '#d4d4dc',
        fontSize: '17px',
        fontWeight: 'bold',
        cursor: 'pointer',
        padding: '8px 14px',
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
        fontSize: '35px',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d4d4dc',
        transition: 'all 0.3s ease',
        borderRadius: '6px',
    }

    const hoverStyle = {
        transform: 'translateY(-2px) scale(1.05)',
        color: '#feda6a',
    }

    const profileIconStyle = {
        fontSize: '40px',
        cursor: 'pointer',
        padding: '8px',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d4d4dc',
        borderRadius: '6px',
        height: '40px',
        width: '40px',
    }

  return (
    <div>
      <style>
        {`
          .admin-badge {
            background: linear-gradient(135deg, #feda6a, #ffed85);
            color: #1d1e22;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        `}
      </style>
      
      <div style={navStyle}>
        <h1 
          style={logoStyle} 
          onClick={handleLogoClick}
          className="logo-hover"
        >
          <AdminPanelSettingsIcon style={{ fontSize: '45px', color: '#d4d4dc' }} />
          One Piece
          <span className="admin-badge">ADMIN</span>
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
              onClick={() => navigate('/admin/auctions')}
              onMouseEnter={() => setHoveredNavItem(0)}
              onMouseLeave={() => setHoveredNavItem(null)}
            >
              Auctions
            </span>

            <span
              style={{
                ...navItemStyle,
                ...(hoveredNavItem === 1 ? { color: '#feda6a' } : {}),
              }}
              className={hoveredNavItem === 1 ? 'nav-item-active' : ''}
              onClick={() => navigate('/admin/users')}
              onMouseEnter={() => setHoveredNavItem(1)}
              onMouseLeave={() => setHoveredNavItem(null)}
            >
              Users
            </span>
            <span
              style={{
                ...navItemStyle,
                ...(hoveredNavItem === 3 ? { color: '#feda6a' } : {}),
              }}
              className={hoveredNavItem === 3 ? 'nav-item-active' : ''}
              onClick={() => navigate('/admin/payments')}
              onMouseEnter={() => setHoveredNavItem(3)}
              onMouseLeave={() => setHoveredNavItem(null)}
            >
              Payments
            </span>

            <span
              style={{
                ...navItemStyle,
                ...(hoveredNavItem === 4 ? { color: '#feda6a' } : {}),
              }}
              className={hoveredNavItem === 4 ? 'nav-item-active' : ''}
              onClick={() => navigate('/admin/reviews')}
              onMouseEnter={() => setHoveredNavItem(4)}
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
                      navigate('/admin');
                      setShowProfileDropdown(false);
                    }}
                  >
                    <AdminPanelSettingsIcon className="profile-dropdown-icon" />
                    Admin Dashboard
                  </div>
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

export default AdminNavbar
