import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import AdminNavbar from '../../Components/AdminNavbar'
import { getAuthToken } from '../../Utils/auth'
import { BIDDING_SERVICE_URL, PRODUCT_SERVICE_URL, SERVER_URL } from '../../Utils/config'
import { IoMdArrowBack, IoMdClose } from "react-icons/io";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import GavelIcon from '@mui/icons-material/Gavel';
import TimerIcon from '@mui/icons-material/Timer';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

const AdminProductDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [auction, setAuction] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [highestBid, setHighestBid] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [totalBids, setTotalBids] = useState(0);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);

  const productId = location.state?.productId || location.state?.product?.id || params.id;

  const [auctionStatus, setAuctionStatus] = useState('Upcoming');
  const [auctionTimeLeft, setAuctionTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const fallbackImages = [
    'https://via.placeholder.com/800x600?text=No+Image+Available'
  ];

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    } else {
      setLoading(false);
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      // const response = await axios.get(`${SERVER_URL}/product/${productId}`, {
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/product/${productId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;
      console.log('Fetched product details:', data);
      
      if (data && data.productId) {
        setProduct(data);
        setCurrentPrice(data.startPrice || data.startingPrice || 0);
        await fetchAuctionDetails();
        if (data.auctionDate && data.auctionStartTime) {
          calculateAuctionTimeLeft(data.auctionDate, data.auctionStartTime);
        }
      } else {
        console.error('Failed to fetch product details:', data);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctionDetails = async () => {
    try {
      const token = getAuthToken();
      // const response = await axios.get(`${SERVER_URL}/auctions/product/${productId}`, {
      const response = await axios.get(`${BIDDING_SERVICE_URL}/auctions/product/${productId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const data = response.data;
        console.log('Fetched auction details:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          const activeAuction = data.find(a => a.currStatus === 'ONGOING' || a.status === 'active') || data[0];
          setAuction(activeAuction);
          setCurrentPrice(activeAuction.currentPrice || activeAuction.startingPrice || 0);
          setHighestBid(activeAuction.currentPrice || 0);
          
          await fetchBidHistory();
          
          const now = new Date();
          const startTime = new Date(activeAuction.startTime);
          const endTime = new Date(activeAuction.endTime);
          
          setAuctionStarted(now >= startTime);
          setAuctionEnded(now >= endTime);
        } else {
          console.log('No auction found for this product');
        }
      }
    } catch (error) {
      console.error('Error fetching auction details:', error);
    }
  };

  const fetchBidHistory = async () => {
    try {
      const token = getAuthToken();
      const auctionId = auction.auctionId;
      // const response = await axios.get(`${SERVER_URL}/bids/auction/${auctionId}`, {
      const response = await axios.get(`${BIDDING_SERVICE_URL}/bids/auction/${auctionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const data = response.data;
        console.log('Fetched bid history:', data);
        
        if (Array.isArray(data)) {
          const sortedBids = data.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
          setBidHistory(sortedBids);
          setTotalBids(sortedBids.length);
          
          if (sortedBids.length > 0) {
            const highest = Math.max(...sortedBids.map(bid => parseFloat(bid.amount)));
            setHighestBid(highest);
            setCurrentPrice(highest);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching bid history:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const bidTime = new Date(dateString);
    const diffInMs = now - bidTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const calculateAuctionTimeLeft = (auctionDate, auctionTime) => {
    try {
      const auctionDateTime = new Date(`${auctionDate}T${auctionTime}`);
      const now = new Date();
      const diff = auctionDateTime - now;
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    } catch (error) {
      console.error('Error calculating auction time:', error);
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  const getProductImages = () => {
    if (!product) return fallbackImages;
    const images = [];
    if (product.mainImageUrl) {
      if (product.mainImageUrl.startsWith('data:image/')) {
        images.push(product.mainImageUrl);
      } else {
        images.push(`data:image/jpeg;base64,${product.mainImageUrl}`);
      }
    }
    if (Array.isArray(product.additionalImageUrls)) {
      product.additionalImageUrls.forEach(img => {
        if (img) {
          if (img.startsWith('data:image/')) {
            images.push(img);
          } else {
            images.push(`data:image/jpeg;base64,${img}`);
          }
        }
      });
    }
    return images.length > 0 ? images : fallbackImages;
  };

  const productImages = getProductImages();

  useEffect(() => {
    if (auction) {
      const interval = setInterval(() => {
        fetchBidHistory(auction.id);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [auction]);

  useEffect(() => {
    if (auction && auction.endTime) {
      const timer = setInterval(() => {
        const now = new Date();
        const endTime = new Date(auction.endTime);
        const diff = endTime - now;
        
        if (diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          setAuctionEnded(true);
          clearInterval(timer);
          return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      }, 1000);

      return () => clearInterval(timer);
    } else if (product && product.auction_date && product.auction_time) {
      const timer = setInterval(() => {
        calculateAuctionTimeLeft(product.auction_date, product.auction_time);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [auction, product]);

  const getProductInfo = () => {
    if (!product) return {};
    
    return {
      title: product.productModel || 'Unknown Product',
      currentBid: currentPrice || product.startPrice || 0,
      startingBid: product.startPrice || 0,
      reservePrice: product.priceJump || 0,
      seller: `Seller ${product.sellerId || 'Unknown'}`,
      description: product.description || 'No description available'
    };
  };

  const productInfo = getProductInfo();

  const getSpecifications = () => {
    if (!product) return [];
    
    return [
      { label: "Product Model", value: product.productModel || 'N/A' },
      { label: "Category", value: product.category || 'General' },
      { label: "Model Year", value: product.modelYear || 'N/A' },
      { label: "Starting Price", value: `₹${(product.startPrice || 0).toLocaleString()}` },
      { label: "Reserve Price", value: `₹${(product.priceJump || 0).toLocaleString()}` },
      { label: "Current Price", value: `₹${(currentPrice || 0).toLocaleString()}` },
      { label: "Auction Date", value: product.auctionDate || 'TBD' },
      { label: "Auction Time", value: product.auctionStartTime || 'TBD' },
      { label: "Duration", value: product.auctionDuration ? `${product.auctionDuration} hours` : 'TBD' },
      { label: "Status", value: product.productStatus || 'Unknown' }
    ];
  };

  const getFeatures = () => {
    if (!product) return [];
    
    const features = [];
    
    if (auctionEnded) features.push('Auction Ended');
    else if (auctionStarted) features.push('Live Auction');
    else if (product.status === 'active') features.push('Auction Scheduled');
    if (product.status === 'pending') features.push('Pending Approval');
    if (product.product_images && product.product_images.length > 0) features.push('Multiple Images');
    if (product.description) features.push('Detailed Description');
    if (currentPrice >= productInfo.reservePrice) features.push('Reserve Met');
    
    features.push('Admin Verified', 'Secure Transaction', 'Authentic Product', 'Quality Assured');
    
    return features;
  };

  const specifications = getSpecifications();
  const features = getFeatures();

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleKeyPress = (e) => {
    if (isImageEnlarged) {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setIsImageEnlarged(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isImageEnlarged]);

  useEffect(() => {
    if (!auction) return;
    let timer;
    if (auction.startTime && auction.endTime) {
      timer = setInterval(() => {
        const now = new Date();
        const start = new Date(auction.startTime);
        const end = new Date(auction.endTime);
        if (now < start) {
          setAuctionStatus('Upcoming');
          const diff = start - now;
          setAuctionTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60)
          });
        } else if (now >= start && now < end) {
          setAuctionStatus('Live');
          const diff = end - now;
          setAuctionTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60)
          });
        } else {
          setAuctionStatus('Ended');
          setAuctionTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [auction]);

  const [error, setError] = useState(null);

  useEffect(() => {
    let timer;
    if (product && product.auctionDate && product.auctionStartTime) {
      timer = setInterval(() => {
        const auctionDateTime = new Date(`${product.auctionDate}T${product.auctionStartTime}`);
        const now = new Date();
        const startDiff = auctionDateTime - now;
        if (startDiff > 0) {
          setAuctionStarted(false);
          setAuctionEnded(false);
          const days = Math.floor(startDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((startDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((startDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((startDiff % (1000 * 60)) / 1000);
          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          setAuctionStarted(true);
          const duration = product.auctionDuration || 2/60;
          const auctionEndTime = new Date(auctionDateTime.getTime() + duration * 60 * 60 * 1000);
          const endDiff = auctionEndTime - now;
          if (endDiff > 0) {
            const days = Math.floor(endDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((endDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((endDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((endDiff % (1000 * 60)) / 1000);
            setTimeLeft({ days, hours, minutes, seconds });
            setAuctionEnded(false);
          } else {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            setAuctionEnded(true);
            setAuctionStarted(false);
          }
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [product]);

  useEffect(() => {
    if (auction && auction.id && auctionStarted && !auctionEnded) {
      const interval = setInterval(() => {
        fetchBidHistory(auction.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [auction, auctionStarted, auctionEnded]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#feda6a' }}>
        <AdminNavbar />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px'
        }}>
          Loading product details...
        </div>
      </div>
    );
  }

  if (!productId || !product) {
    return (
      <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#feda6a' }}>
        <AdminNavbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ background: '#23232b', border: '1px solid #f87171', borderRadius: 12, padding: 40, textAlign: 'center', color: '#f87171' }}>
            <h2 style={{ marginBottom: 12 }}>Product Not Found</h2>
            <div style={{ color: '#feda6a', marginBottom: 20 }}>The requested product could not be found or loaded.</div>
            <button onClick={() => navigate(-1)} style={{ background: '#feda6a', color: '#23232b', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#feda6a' }}>
      <AdminNavbar />
      <div style={{ 
        maxWidth: '100%', 
        margin: '0 auto', 
        padding: '20px 15px', 
        display: 'grid', 
        gridTemplateColumns: '1fr 380px', 
        gap: '25px' 
      }}>
        <div>
          <div style={{
            backgroundColor: '#1d1e22',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '1px solid #393f4d'
            }}>
              <IoMdArrowBack 
                onClick={() => navigate(-1)} 
                style={{
                  fontSize: '40px',
                  cursor: 'pointer',
                  padding: '8px',
                  backgroundColor: '#393f4d',
                  borderRadius: '50%',
                  color: '#feda6a'
                }}
              />
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                  {product.productModel || product.title}
                </h1>
                <div style={{ display: 'flex', gap: '25px', fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>
                  <span>Seller: {product.sellerId}</span>
                </div>
              </div>
            </div>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
              <img 
                src={productImages[selectedImage]} 
                alt="Product" 
                style={{
                  width: '100%',
                  height: '450px',
                  objectFit: 'cover',
                  cursor: 'zoom-in'
                }}
                onClick={() => setIsImageEnlarged(true)}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                }}
              />
              <button
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '45px',
                  height: '45px',
                  color: '#feda6a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
              >
                <IoChevronBackOutline />
              </button>
              <button
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '45px',
                  height: '45px',
                  color: '#feda6a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
              >
                <IoChevronForwardOutline />
              </button>
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: '8px',
                padding: '8px',
                color: '#feda6a'
              }}>
                <ZoomInIcon />
              </div>
              <div style={{
                position: 'absolute',
                bottom: '15px',
                right: '15px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: '8px',
                padding: '5px 10px',
                color: '#feda6a',
                fontSize: '12px'
              }}>
                {selectedImage + 1} / {productImages.length}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', gap: '8px' }}>
              {productImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`View ${index + 1}`}
                  style={{
                    width: '60px',
                    height: '40px',
                    borderRadius: '4px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: selectedImage === index ? '2px solid #feda6a' : '2px solid transparent',
                    opacity: selectedImage === index ? 1 : 0.6,
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setSelectedImage(index)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{
            backgroundColor: '#1d1e22',
            borderRadius: '12px',
            padding: '25px'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#feda6a' }}>
              About This Product
            </h2>
            <p style={{ 
              fontSize: '15px', 
              lineHeight: '1.6', 
              margin: '0 0 20px 0',
              opacity: 0.9,
              color: '#d4d4dc'
            }}>
              {product.description}
            </p>
            <div style={{ 
              marginTop: '25px', 
              paddingTop: '20px', 
              borderTop: '1px solid #393f4d' 
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#feda6a' }}>
                Specifications
              </h3>
              {specifications.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', fontSize: '14px' }}>
                  {specifications.map((spec, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #393f4d' }}>
                      <span style={{ opacity: 0.7 }}>{spec.label}</span>
                      <span style={{ fontWeight: 'bold' }}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '14px', opacity: 0.7 }}>
                  No specifications available
                </div>
              )}
            </div>
            <div style={{ 
              marginTop: '25px', 
              paddingTop: '20px', 
              borderTop: '1px solid #393f4d' 
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#feda6a' }}>
                Key Features
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {['Authentic Item', 'Verified Seller', 'Secure Bidding', 'Quality Assured',
                  'Protected Transaction', 'Customer Support'].map((feature, index) => (
                    <div key={index} className="bg-[#393f4d] p-2 rounded text-xs text-center border border-[#feda6a]/50">
                      {feature}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
          <div style={{
            backgroundColor: '#1d1e22',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <TimerIcon />
              {auctionEnded ? 'Auction Ended' : auctionStarted ? 'Auction Ends In' : 'Auction Starts In'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{String(timeLeft.days).padStart(2, '0')}</div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>DAYS</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{String(timeLeft.hours).padStart(2, '0')}</div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>HOURS</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>MINS</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>SECS</div>
              </div>
            </div>
          </div>
          <div style={{
            backgroundColor: '#1d1e22',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>
              Current Bid
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
              ₹{(currentPrice || product.startPrice || product.startingPrice || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '15px' }}>
              {totalBids} bids • Starting bid: ₹{(product.startPrice || product.startingPrice || 0).toLocaleString()}
            </div>
            {auctionEnded ? (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#e74c3c', 
                color: '#ffffff', 
                borderRadius: '8px', 
                textAlign: 'center',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                Auction Ended
              </div>
            ) : !auctionStarted ? (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#3498db', 
                color: '#ffffff', 
                borderRadius: '8px', 
                textAlign: 'center',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                Auction Not Started
              </div>
            ) : (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#27ae60', 
                color: '#ffffff', 
                borderRadius: '8px', 
                textAlign: 'center',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                Auction Live - {totalBids} Bid{totalBids !== 1 ? 's' : ''} Placed
              </div>
            )}
          </div>
          <div style={{
            backgroundColor: '#1d1e22',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '15px',
              color: '#feda6a'
            }}>
              <GavelIcon style={{ marginRight: '8px' }} />
              Recent Bids ({totalBids})
            </h3>
            {bidHistory.length > 0 ? (
              bidHistory.slice(0, 5).map((bid, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: index < Math.min(4, bidHistory.length - 1) ? '1px solid #393f4d' : 'none'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      ₹{parseFloat(bid.amount || bid.newBidAmount).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>
                      Bidder: {bid.buyerId || bid.bidder}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7, textAlign: 'right' }}>
                    {formatTimeAgo(bid.bidTime || bid.time)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                opacity: 0.7, 
                fontSize: '14px' 
              }}>
                {auctionStarted ? 'No bids yet' : 'Auction not started'}
              </div>
            )}
            {bidHistory.length > 5 && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '10px', 
                fontSize: '12px', 
                opacity: 0.7 
              }}>
                +{bidHistory.length - 5} more bids
              </div>
            )}
          </div>
          <div style={{
            backgroundColor: '#1d1e22',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '15px',
              color: '#feda6a'
            }}>
              <PersonIcon style={{ marginRight: '8px' }} />
              Auction Statistics
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #393f4d'
              }}>
                <span style={{ opacity: 0.7 }}>Total Bids</span>
                <span style={{ fontWeight: 'bold' }}>{totalBids}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #393f4d'
              }}>
                <span style={{ opacity: 0.7 }}>Highest Bid</span>
                <span style={{ fontWeight: 'bold' }}>₹{highestBid.toLocaleString()}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #393f4d'
              }}>
                <span style={{ opacity: 0.7 }}>Starting Price</span>
                <span style={{ fontWeight: 'bold' }}>₹{product.startPrice || product.startingPrice || 0}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #393f4d'
              }}>
                <span style={{ opacity: 0.7 }}>Reserve Price</span>
                <span style={{ fontWeight: 'bold' }}>₹{product.reservePrice || product.reserve_price || 0}</span>
              </div>
              {auction && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0'
                }}>
                  <span style={{ opacity: 0.7 }}>Auction Status</span>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: auctionEnded ? '#e74c3c' : auctionStarted ? '#27ae60' : '#3498db'
                  }}>
                    {auctionEnded ? 'Ended' : auctionStarted ? 'Live' : 'Not Started'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isImageEnlarged && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setIsImageEnlarged(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              color: '#feda6a',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IoMdClose />
          </button>
          <button
            onClick={prevImage}
            style={{
              position: 'absolute',
              left: '30px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              color: '#feda6a',
              cursor: 'pointer',
              fontSize: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IoChevronBackOutline />
          </button>
          <img 
            src={productImages[selectedImage]} 
            alt="Enlarged view"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
            }}
          />
          <button
            onClick={nextImage}
            style={{
              position: 'absolute',
              right: '30px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              color: '#feda6a',
              cursor: 'pointer',
              fontSize: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IoChevronForwardOutline />
          </button>
          <div style={{
            position: 'absolute',
            bottom: '30px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '20px',
            padding: '10px 20px',
            color: '#feda6a'
          }}>
            {selectedImage + 1} of {productImages.length} • Use arrow keys to navigate • ESC to close
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProductDetails;
