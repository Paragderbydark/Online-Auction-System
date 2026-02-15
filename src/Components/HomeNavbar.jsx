import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell, FaHeart, FaUser, FaSignOutAlt } from "react-icons/fa";
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';
// import './NotificationStyles.css';


const HomeNavbar = () => {

    const navigate = useNavigate();
    const [hoveredIcon, setHoveredIcon] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    const sampleNotifications = [
        {
            id: 1,
            type: "bid",
            title: "New Bid Alert",
            message: "Someone just bid $490,000 on 1967 Shelby GT500",
            time: "2 minutes ago",
            isNew: true,
            icon: "🏎️"
        },
        {
            id: 2,
            type: "outbid",
            title: "You've been outbid",
            message: "Your bid on 1955 Mercedes 300SL has been exceeded",
            time: "15 minutes ago",
            isNew: true,
            icon: "⚡"
        },
        {
            id: 3,
            type: "ending",
            title: "Auction Ending Soon",
            message: "1963 Porsche 911 auction ends in 2 hours",
            time: "1 hour ago",
            isNew: false,
            icon: "⏰"
        },
        {
            id: 4,
            type: "won",
            title: "Congratulations!",
            message: "You won the 1969 Dodge Charger auction",
            time: "2 hours ago",
            isNew: false,
            icon: "🏆"
        },
        {
            id: 5,
            type: "watch",
            title: "New Listing",
            message: "1970 Plymouth Barracuda matching your interests",
            time: "3 hours ago",
            isNew: false,
            icon: "👀"
        }
    ];

    const handleLogoClick = () => {
        navigate('/buyer');
    }

    const handleLogout = () => {
        // JWT logout logic will be implemented later
        navigate('/');
    }

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
        height: '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 30px',
        background: 'linear-gradient(135deg, #1b3c53, #456882)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(27, 60, 83, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
    }

    const logoStyle = {
        fontSize: '48px',
        fontWeight: 'bold',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #f9f3ef, #d2c1b6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontFamily: 'Balthazar, serif',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        letterSpacing: '1px',
    }

    const searchContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '25px',
        padding: '8px 20px',
        border: '2px solid rgba(249, 243, 239, 0.2)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        minWidth: '350px',
    }

    const searchInputStyle = {
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: '16px',
        width: '100%',
        marginLeft: '10px',
        fontFamily: 'PT Sans, sans-serif',
    }

    const iconContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    }

    const iconStyle = {
        fontSize: '24px',
        height: 'auto',
        width: 'auto',
        cursor: 'pointer',
        padding: '12px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        border: '2px solid transparent',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
    }

    const hoverStyle = {
        transform: 'translateY(-3px) scale(1.1)',
        backgroundColor: 'rgba(249, 243, 239, 0.2)',
        border: '2px solid #d2c1b6',
        boxShadow: '0 8px 25px rgba(210, 193, 182, 0.3)',
        color: '#d2c1b6',
    }

    const profileIconStyle = {
        fontSize: '60px',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        border: '2px solid transparent',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
    }


  return (
    <div>
      <style>
        {`
          .navbar-search:focus-within {
            background-color: rgba(255, 255, 255, 0.25);
            border-color: #d2c1b6;
            box-shadow: 0 0 20px rgba(210, 193, 182, 0.4);
          }

          .navbar-search input::placeholder {
            color: rgba(255, 255, 255, 0.7);
          }

          .logo-hover:hover {
            transform: scale(1.05);
            filter: drop-shadow(0 4px 8px rgba(249, 243, 239, 0.3));
          }

          .icon-hover:hover {
            transform: translateY(-3px) scale(1.1) !important;
            background-color: rgba(249, 243, 239, 0.2) !important;
            border: 2px solid #d2c1b6 !important;
            box-shadow: 0 8px 25px rgba(210, 193, 182, 0.3) !important;
            color: #d2c1b6 !important;
          }

          .icon-container {
            position: relative;
            display: inline-block;
          }

          .search-icon-hover:hover {
            color: #d2c1b6;
            transform: scale(1.1);
          }

          .profile-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: linear-gradient(135deg, #1b3c53, #456882);
            border: 2px solid rgba(249, 243, 239, 0.3);
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
            min-width: 200px;
            z-index: 1001;
            backdrop-filter: blur(10px);
            overflow: hidden;
            margin-top: 10px;
          }

          .profile-dropdown-item {
            padding: 15px 20px;
            cursor: pointer;
            color: white;
            transition: all 0.3s ease;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: 'PT Sans', sans-serif;
            font-size: 16px;
          }

          .profile-dropdown-item:last-child {
            border-bottom: none;
          }

          .profile-dropdown-item:hover {
            background: rgba(249, 243, 239, 0.2);
            color: #d2c1b6;
            transform: translateX(5px);
          }

          .profile-dropdown-icon {
            font-size: 18px;
          }
        `}
      </style>
      
      <div style={navStyle}>
        <h1 
          style={logoStyle} 
          onClick={handleLogoClick}
          className="logo-hover"
        >
          One Piece
        </h1>

        {/* <div 
          style={searchContainerStyle}
          className="navbar-search"
        >
          <SearchIcon
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            className="search-icon-hover"
          />
          <input
            type="text"
            placeholder="Search auctions, cars, brands..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={searchInputStyle}
          />
        </div> */}

        <div style={iconContainerStyle}>
          <div className="icon-container">
            <FaHeart 
              style={{
                ...iconStyle,
                ...(hoveredIcon === 'heart' ? hoverStyle : {}),
              }}
              className="icon-hover"
              onMouseEnter={() => setHoveredIcon('heart')}
              onMouseLeave={() => setHoveredIcon(null)}
              onClick={() => navigate('/wishlist')}
            />
            <div 
              className="notification-badge"
              style={{
                backgroundColor: '#ff6b6b',
                color: 'white',
              }}
            >
              3
            </div>
          </div>

          <div className="icon-container notification-container">
            <FaBell 
              style={{
                ...iconStyle,
                ...(hoveredIcon === 'bell' ? hoverStyle : {}),
              }}
              className="icon-hover"
              onMouseEnter={() => setHoveredIcon('bell')}
              onMouseLeave={() => setHoveredIcon(null)}
              onClick={() => setShowNotifications(!showNotifications)}
            />
            <div 
              className="notification-badge"
              style={{
                backgroundColor: '#4ecdc4',
                color: 'white',
              }}
            >
              7
            </div>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  Notifications
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {sampleNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.isNew ? 'new' : ''}`}
                    >
                      <div className="notification-header">
                        <div className="notification-icon">
                          {notification.icon}
                        </div>
                        <div className="notification-title">
                          {notification.title}
                        </div>
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-time">
                        {notification.time}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="notifications-footer">
                  <a href="#" className="view-all-btn" onClick={(e) => e.preventDefault()}>
                    View All Notifications
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="icon-container profile-container">
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
  )
}

export default HomeNavbar