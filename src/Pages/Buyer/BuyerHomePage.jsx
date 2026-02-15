import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BuyerProductCard from '../../Components/BuyerProductCard';
import BuyerNavbar from '../../Components/BuyerNavbar';
import '../../Styles/BuyerHomePage.css';
import { getAuthToken, getUserData } from '../../Utils/auth';
import { PRODUCT_SERVICE_URL, SERVER_URL } from '../../Utils/config';
import axios from 'axios';
import { FaFilter } from 'react-icons/fa';

const BuyerHomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auctionStatus, setAuctionStatus] = useState('all');

  const categories = [
    { key: 'all', label: 'All Categories' },
    { key: 'Antique', label: 'Antique' },
    { key: 'Classic', label: 'Classic' },
    { key: 'Luxury', label: 'Luxury' },
    { key: 'Sports', label: 'Sports' },
    { key: 'Vintage', label: 'Vintage' }
  ];

  const stats = [
    { value: '1,250+', label: 'Active Auctions' },
    { value: '$45M+', label: 'Total Sales' },
    { value: '15,000+', label: 'Happy Buyers' },
    { value: '99.8%', label: 'Success Rate' }
  ];

  const auctionStatusOptions = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'live', label: 'Live' },
    { key: 'completed', label: 'Completed' },
  ];

  const getProducts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // const response = await axios.get(`${SERVER_URL}/products`, {
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/products`, {
        headers: headers
      });

      const data = response.data;
      
      if (Array.isArray(data)) {
        setProducts(data);
        setFilteredProducts(data);
      } else {
        console.error('Invalid response format:', data);
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectCategory = async(e) => {
    const category = e.target.innerText;
    setSelectedCategory(category);
    
    if (category === 'All Categories') {
      setFilteredProducts(products);
    } else {
      try {
        const token = getAuthToken();
        
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        // const categoryProducts = await axios.get(`${SERVER_URL}/products/category/${category}`, {
        const categoryProducts = await axios.get(`${PRODUCT_SERVICE_URL}/products/category/${category}`, {
          headers: headers
        });
        
        if (Array.isArray(categoryProducts.data)) {
          setFilteredProducts(categoryProducts.data);
        } else {
          console.error('Invalid category response format:', categoryProducts.data);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error('Error fetching category products:', error);
        setFilteredProducts([]);
      }
    }
  }

  function getAuctionStatus(product) {
    const auctionDate = product.auctionDate || product.auction_date;
    const auctionTime = product.auctionStartTime || product.auction_time || product.time;
    let durationMinutes = 60;
    if (typeof product.auctionDurationMinutes === 'number') {
      durationMinutes = product.auctionDurationMinutes;
    } else if (typeof product.auctionDuration === 'number') {
      durationMinutes = product.auctionDuration * 60;
    } else if (typeof product.auctionDuration === 'object' && product.auctionDuration !== null) {
      const d = product.auctionDuration;
      durationMinutes = (d.days || 0) * 24 * 60 + (d.hours || 0) * 60 + (d.minutes || 0) + Math.ceil((d.seconds || 0) / 60);
    }
    if (!auctionDate || !auctionTime) return 'upcoming';
    const start = new Date(`${auctionDate}T${auctionTime}`);
    if (isNaN(start.getTime())) return 'upcoming';
    const now = new Date();
    const end = new Date(start.getTime() + durationMinutes * 60000);
    if (now < start) return 'upcoming';
    if (now >= start && now < end) return 'live';
    return 'completed';
  }

  useEffect(() => {
    let filtered = products;
    const userData = getUserData();
    const userId = userData?.userId || userData?.id;
    if (userId) {
      filtered = filtered.filter((product) => product.sellerId !== userId);
    }
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        (product.productModel || product.product_model || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (auctionStatus !== 'all') {
      filtered = filtered.filter((product) => getAuctionStatus(product) === auctionStatus);
    }
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, auctionStatus]);

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="buyer-home-page">
      <BuyerNavbar />
      
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Discover Extraordinary
              <span className="hero-accent"> Luxury Cars</span>
            </h1>
            <div className="brand-slogan">Your Trusted Piece of Market</div>
            <p className="hero-subtitle">
              Bid on the world's most prestigious automobiles in our exclusive auction platform. 
              From classic collectibles to modern supercars, find your dream car today.
            </p>
          </div>
          
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="category-section">
        <div className="category-content">
          <h2 className="category-title">Browse by Category</h2>
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category.key}
                className={`category-btn ${selectedCategory === category.label ? 'active' : ''}`}
                onClick={handleSelectCategory}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="auctions-section">
        <div className="auctions-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 className="auctions-title">Featured Auctions</h2>
            <p className="auctions-subtitle">Don't miss these exclusive opportunities</p>
          </div>
          <div className="auction-status-filter" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaFilter style={{ color: '#feda6a', fontSize: '1.2rem' }} />
            <select
              value={auctionStatus}
              onChange={e => setAuctionStatus(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #feda6a', background: '#1d1e22', color: '#feda6a' }}
            >
              {auctionStatusOptions.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <BuyerProductCard products={filteredProducts} loading={loading} />
      </div>
    </div>
  )
}

export default BuyerHomePage