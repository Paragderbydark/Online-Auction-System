import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SellerNavbar from '../../Components/SellerNavbar'
import { IoMdArrowBack, IoMdClose } from "react-icons/io";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import EditIcon from '@mui/icons-material/Edit';
import GavelIcon from '@mui/icons-material/Gavel';
import TimerIcon from '@mui/icons-material/Timer';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import PersonIcon from '@mui/icons-material/Person';
import { getAuthToken } from '../../Utils/auth';
import { BIDDING_SERVICE_URL, PRODUCT_SERVICE_URL, SERVER_URL } from '../../Utils/config';
import axios from 'axios';

const SellerProductDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [auction, setAuction] = useState(null);
  const [auctionId, setAuctionId] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [highestBid, setHighestBid] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [totalBids, setTotalBids] = useState(0);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [error, setError] = useState(null);

  const productId = location.state?.productId;

  useEffect(() => {
    if (productId) {
      const loadData = async () => {
        await fetchProductDetails();
        await fetchAuctionDetails();
      };
      loadData();
    } else {
      setLoading(false);
      setError('No product ID provided');
    }
  }, [productId]);

  useEffect(() => {
    if (auctionId) {
      fetchBidHistory();
    }
  }, [auctionId]);

  useEffect(() => {
    let isMounted = true;
    const pollForUpdates = async () => {
      if (!isMounted || !auctionStarted || auctionEnded) return;
      try {
        await fetchAuctionDetails();
        await fetchBidHistory();
        if (isMounted && auctionStarted && !auctionEnded) {
          setTimeout(pollForUpdates, 3000);
        }
      } catch (error) {
        if (isMounted && auctionStarted && !auctionEnded) {
          setTimeout(pollForUpdates, 5000);
        }
      }
    };
    if (auctionStarted && !auctionEnded) {
      pollForUpdates();
    }
    return () => { isMounted = false; };
  }, [auctionStarted, auctionEnded]);

  useEffect(() => {
    let timer;
    if (product?.auctionDate && product?.auctionStartTime) {
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
  }, [product, auctionStarted, auctionEnded]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      // const response = await axios.get(`${SERVER_URL}/product/${productId}`, {
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/product/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);
      const data = response.data;
      setProduct(data);
    } catch (error) {
      setError('Error fetching product details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctionDetails = async () => {
    try {
      const token = getAuthToken();
      // const response = await axios.get(`${SERVER_URL}/auctions/product/${productId}`, {
      const response = await axios.get(`${BIDDING_SERVICE_URL}/auctions/product/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        const data = response.data[0];
        setAuction(data);
        setCurrentPrice(data.currPrice);
        setAuctionId(data.auctionId);
      }
    } catch (error) {
    }
  };

  const fetchBidHistory = async () => {
    if (!auctionId) return;
    try {
      const token = getAuthToken();
      // const response = await axios.get(`${SERVER_URL}/bids/auction/${auctionId}`, {
      const response = await axios.get(`${BIDDING_SERVICE_URL}/bids/auction/${auctionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200 && Array.isArray(response.data)) {
        const formattedBids = response.data
          .sort((a, b) => new Date(b.bidTime || b.createdAt) - new Date(a.bidTime || a.createdAt))
          .map(bid => ({
            bidId: bid.bidId,
            newBidAmount: bid.newBidAmount,
            bidder: `Bidder ***${String(bid.buyerId).slice(-4)}`,
            time: formatTimeAgo(bid.bidTime || bid.createdAt),
            buyerId: bid.buyerId
          }));
        setBidHistory(formattedBids);
        setTotalBids(formattedBids.length);
        if (formattedBids.length > 0) {
          setHighestBid(formattedBids[0].newBidAmount);
        }
      }
    } catch (error) {
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const bidTime = new Date(dateString);
    const diffMs = now - bidTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getProductImages = () => {
    const images = [];
    
    if (product?.mainImageUrl) {
      if (product.mainImageUrl.startsWith('data:image/')) {
        images.push(product.mainImageUrl);
      } else {
        images.push(`data:image/jpeg;base64,${product.mainImageUrl}`);
      }
    }
    
    if (product?.additionalImageUrls && product.additionalImageUrls.length > 0) {
      product.additionalImageUrls.forEach(imageData => {
        if (imageData) {
          if (imageData.startsWith('data:image/')) {
            images.push(imageData);
          } else {
            images.push(`data:image/jpeg;base64,${imageData}`);
          }
        }
      });
    }
    
    if (images.length === 0 && product?.product_images && product.product_images.length > 0) {
      product.product_images.forEach(imagePath => {
        if (imagePath) {
          if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            images.push('');
          } else {
            if (imagePath.includes('product-images/')) {
              const parts = imagePath.split('/');
              if (parts.length >= 3) {
                const productName = parts[1];
                const imageName = parts[2];
                // images.push(`${SERVER_URL}/products/images/${productName}/${imageName}`);
                images.push(`${PRODUCT_SERVICE_URL}/images/products/${productName}/${imageName}`);
              }
            } else {
              // images.push(`${SERVER_URL}/${imagePath}`);
              images.push(`${PRODUCT_SERVICE_URL}/images/${imagePath}`);
            }
          }
        }
      });
    }
    
    // if (images.length === 0) {
    //   images.push(ferrariImg);
    // }
    
    return images;
  };

  const carImages = getProductImages();

  useEffect(() => {
    if (auction && auction.id) {
      const interval = setInterval(() => {
        fetchBidHistory(auction.id);
      }, 3000);

      return () => clearInterval(interval);
    } else if (productId) {
      const interval = setInterval(() => {
        fetchAuctionDetails();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [auction, productId]);

  const   getAuctionData = () => {
    if (!product) {
      return {
        title: "Product not found",
        currentBid: 0,
        startingBid: 0,
        reservePrice: 0,
        totalBids: 0,
        endTime: "N/A",
        seller: "You",
        location: "Not specified",
        description: "Product details not available."
      };
    }

    return {
      title: product.productModel || product.product_model || "Unknown Product",
      currentBid: currentPrice || product.startPrice || product.starting_price || 0,
      startingBid: product.startPrice || product.starting_price || 0,
      reservePrice: product.reservePrice || product.reserve_price || 0,
      totalBids: totalBids,
      endTime: product.auctionDate && product.auctionStartTime ? 
        `${product.auctionDate}T${product.auctionStartTime}` : 
        (product.auction_date && product.auction_time ? 
          `${product.auction_date}T${product.auction_time}` : "N/A"),
      seller: "You (Seller)",
      location: product.location || "Location not specified",
      description: product.description || "No description available"
    };
  };

  const auctionData = getAuctionData();

  const getSpecifications = () => {
    if (!product) return [];
    
    const specs = [];
    if (product.modelYear || product.model_year) specs.push({ label: "Model Year", value: product.modelYear || product.model_year });
    if (product.category) specs.push({ label: "Category", value: product.category });
    if (product.startPrice || product.starting_price) specs.push({ label: "Starting Price", value: `₹${(product.startPrice || product.starting_price).toLocaleString()}` });
    if (product.priceJump || product.priceJump) specs.push({ label: "Reserve Price", value: `₹${(product.priceJump || product.priceJump).toLocaleString()}` });
    if (product.auctionDuration || product.auction_duration) specs.push({ label: "Auction Duration", value: `${product.auctionDuration || product.auction_duration} hours` });
    if (product.productStatus) specs.push({ label: "Status", value: product.productStatus.charAt(0).toUpperCase() + product.productStatus.slice(1) });
    if (product.auctionDate || product.auction_date) specs.push({ label: "Auction Date", value: new Date(product.auctionDate || product.auction_date).toLocaleDateString() });
    if (product.auctionStartTime || product.auction_time) specs.push({ label: "Auction Time", value: product.auctionStartTime || product.auction_time });
    
    return specs;
  };

  const specifications = getSpecifications();

  const getFeatures = () => {
    if (!product) return [];
    
    const features = [];
    if (product.condition) features.push(product.condition);
    if (product.warranty) features.push("Warranty Included");
    if (product.features && Array.isArray(product.features)) {
      features.push(...product.features);
    }
    if (product.certification) features.push("Certified");
    if (product.service_records) features.push("Service Records Available");
    
    if (features.length === 0) {
      features.push("Authentic Product", "Quality Assured", "Seller Verified");
    }
    
    return features;
  };

  const features = getFeatures();

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
    } else if (product && ((product.auctionDate && product.auctionStartTime) || (product.auction_date && product.auction_time))) {
      const timer = setInterval(() => {
        const auctionDate = product.auctionDate || product.auction_date;
        const auctionTime = product.auctionStartTime || product.auction_time;
        calculateAuctionTimeLeft(auctionDate, auctionTime);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [auction, product]);

  const handleEditItem = () => {
    navigate('/seller/edit-product', { state: { productId } });
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % carImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + carImages.length) % carImages.length);
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

  function calculateAuctionTimeLeft(auctionDate, auctionTime, durationHours = 1) {
    const start = new Date(`${auctionDate}T${auctionTime}`);
    const now = new Date();
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    let diff = end - now;
    if (diff < 0) diff = 0;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#feda6a' }}>
        <SellerNavbar />
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

  if (error || !productId) {
    return (
      <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#feda6a' }}>
        <SellerNavbar />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          gap: '20px'
        }}>
          <div>{error || 'Product not found or invalid product ID'}</div>
          <button 
            onClick={() => navigate('/seller')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#feda6a',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#feda6a' }}>
      <SellerNavbar />

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
                onClick={() => navigate('/seller')} 
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
                  {auctionData.title}
                </h1>
                <div style={{ display: 'flex', gap: '25px', fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>
                  
                  <span>Seller: {auctionData.seller}</span>
                  <span>Auction ID: {auctionId}</span>
                </div>
              </div>
              <button 
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: '#feda6a',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={handleEditItem}
              >
                <EditIcon />
                Edit Item
              </button>
            </div>

            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
              <img 
                src={carImages[selectedImage]} 
                alt="Car" 
                style={{
                  width: '100%',
                  height: '450px',
                  objectFit: 'cover',
                  cursor: 'zoom-in'
                }}
                onClick={() => setIsImageEnlarged(true)}
                onError={(e) => {
                  console.log('Main image failed to load:', carImages[selectedImage]);
                  e.target.src = '';
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
                {selectedImage + 1} / {carImages.length}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', gap: '8px' }}>
              {carImages.map((img, index) => (
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
                    console.log('Thumbnail image failed to load:', img);
                    e.target.src = '';
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
              About This Vehicle
            </h2>
            <p style={{ 
              fontSize: '15px', 
              lineHeight: '1.6', 
              margin: '0 0 20px 0',
              opacity: 0.9,
              color: '#d4d4dc'
            }}>
              {auctionData.description}
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
                {features.map((feature, index) => (
                  <div key={index} style={{
                    backgroundColor: '#393f4d',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    textAlign: 'center',
                    border: '1px solid #feda6a'
                  }}>
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
              Auction Starts In
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
              ₹{auctionData.currentBid.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '15px' }}>
              {auctionData.totalBids} bids • Starting bid: ₹{auctionData.startingBid.toLocaleString()}
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
                      ₹{bid.newBidAmount}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>
                      {bid.bidder || `Bidder ***${bid.buyerId ? bid.buyerId.slice(-4) : 'XXXX'}`}
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.5 }}>
                      Bid ID: {bid.id}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7, textAlign: 'right' }}>
                    {bid.time || formatTimeAgo(bid.bidTime)}
                    <div style={{ fontSize: '10px', opacity: 0.5 }}>
                      {bid.status}
                    </div>
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
                <span style={{ fontWeight: 'bold' }}>${highestBid.toLocaleString()}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #393f4d'
              }}>
                <span style={{ opacity: 0.7 }}>Starting Price</span>
                <span style={{ fontWeight: 'bold' }}>₹{auctionData.startingBid}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #393f4d'
              }}>
                <span style={{ opacity: 0.7 }}>Reserve Price</span>
                <span style={{ fontWeight: 'bold' }}>₹{product.priceJump}</span>
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
            src={carImages[selectedImage]} 
            alt="Enlarged view"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain'
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
            {selectedImage + 1} of {carImages.length} • Use arrow keys to navigate • ESC to close
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerProductDetails