import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../Components/AdminNavbar';
import './AdminHomePage.css';

import backgroundVideo from '../../../public/VN20251113_101343.mp4';

import {
  FaDollarSign,
  FaUsers,
  FaChartLine,
  FaChartBar,
} from 'react-icons/fa';

const AdminHomePage = () => {
  const navigate = useNavigate();
  
  const [dashboardData] = useState({
    totalRevenue: 2457893.50,
    activeUsers: 1523,
    activeAuctions: 87,
    todaysBids: 342,
    revenueGrowth: 12.5,
    userGrowth: 8.3,
    auctionGrowth: -2.1,
    bidGrowth: 15.7,
    onlineUsers: 847,
    systemHealth: 99
  });

  const StatCard = ({ title, value, icon: Icon, growth, format = 'number', isRealTime = false, bgColor = 'bg-black', iconColor = 'text-blue-600', iconBg = 'bg-blue-50' }) => {
    const formatValue = (val) => {
      if (format === 'currency') {
        return `$${val.toLocaleString()}`;
      }
      if (format === 'percentage') {
        return `${val}%`;
      }
      if (format === 'compact') {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
        return val.toString();
      }
      return val.toLocaleString();
    };

    const isPositive = growth >= 0;

    return (
      <div style={{backgroundColor: 'transparent'}}>
      <div className={`${bgColor} rounded-xl shadow-lg p-4 border-0 hover:shadow-xl transition-all duration-300 stat-card relative overflow-hidden ${isRealTime ? 'slide-in-up' : ''}`} style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
        <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
          <Icon className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className={`${iconBg} p-2 rounded-lg`}>
              <Icon className={`${iconColor} text-xl`} />
            </div>
            {isRealTime && (
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1 animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Live</span>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-white text-sm font-medium mb-1 uppercase tracking-wide">{title}</p>
            <p className={`text-3xl font-bold mb-2 count-animation ${bgColor === 'bg-black' ? 'text-gray-900' : 'text-white'}`}>
              {formatValue(value)}
            </p>
            <div className="flex items-center">
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  };

  const handleRemoveProduct = (productId) => {
    setLatestProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
    setOpenDropdown(null);
  };

  const handleRemoveOrder = (orderId) => {
    setLatestOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    setOpenDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container') && !event.target.closest('.dropdown-trigger')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{backgroundColor: '#121212'}}>
    <div className="min-h-screen admin-dashboard relative overflow-hidden" style={{backgroundColor: '#121212'}}>
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      <div className="relative z-10">
        <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div style={{backgroundColor: '#121212'}}></div>
        <div className="mb-8 flex flex-col">
          <div className="text-center">
            <p className="text-7xl font-bold text-white whitespace-nowrap overflow-hidden" style={{fontFamily: 'PT Serif', letterSpacing: '-0.02em', marginTop: '120px'}}>Welcome back! Admin</p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-11 mb-6 mt-4 dashboard-grid w-full max-w-6xl">
            <StatCard
              title="Budget"
              value={dashboardData.totalRevenue}
              icon={FaDollarSign}
              growth={dashboardData.revenueGrowth}
              format="compact"
              bgColor="bg-gradient-to-br from-yellow-400 to-yellow-600"
              iconColor="text-white"
              iconBg="bg-white-900 bg-opacity-20"
              style={{ color: 'white' }}          
              
            />
            <StatCard
              title="Total Customers"
              value={dashboardData.activeUsers}
              icon={FaUsers}
              growth={dashboardData.userGrowth}
              format="compact"
              bgColor="bg-gradient-to-br from-yellow-500 to-amber-600"
              iconColor="text-white"
              iconBg="bg-white-900 bg-opacity-20"
              isRealTime={false}
            />
            <StatCard
              title="Task Progress"
              value={75.5}
              icon={FaChartLine}
              growth={dashboardData.auctionGrowth}
              format="percentage"
              bgColor="bg-gradient-to-br from-amber-500 to-orange-500"
              iconColor="text-white"
              iconBg="bg-white-900 bg-opacity-20"
            />
            <StatCard
              title="Total Profit"
              value={dashboardData.todaysBids}
              icon={FaChartBar}
              growth={dashboardData.bidGrowth}
              format="compact"
              bgColor="bg-gradient-to-br from-yellow-600 to-yellow-700"
              iconColor="text-white"
              iconBg="bg-white-900 bg-opacity-20"
            />
          </div>
        </div>

      </div>
      </div>
    </div>
    </div>
  );
};

export default AdminHomePage;
