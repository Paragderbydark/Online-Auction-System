import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { IoMdArrowBack, IoMdClose } from "react-icons/io";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import GavelIcon from '@mui/icons-material/Gavel';
import PaymentIcon from '@mui/icons-material/Payment';
import TimerIcon from '@mui/icons-material/Timer';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuyerNavbar from '../../Components/BuyerNavbar';
import { getAuthToken, getUserData } from '../../Utils/auth';
import { BIDDING_SERVICE_URL, PAYMENT_SERVICE_URL, PRODUCT_SERVICE_URL, SERVER_URL } from '../../Utils/config';
import { PiTimerBold } from "react-icons/pi";
import axios from 'axios';  

const BuyerProductDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auctionStartHandled = React.useRef(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [paymentTimeLeft, setPaymentTimeLeft] = useState({
    hours: 0,
    minutes: 24,
    seconds: 0
  });

  const [auctionStarted, setAuctionStarted] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [paymentTimeExpired, setPaymentTimeExpired] = useState(false);
  const [placingBid, setPlacingBid] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState({
    days: 0,
    hours: 0,
    minutes: 2,
    seconds: 0
  });

  const productId = location.state?.productId;

  const auctionIdFromState = location.state?.auctionId;
  const [auctionId, setAuctionId] = useState(auctionIdFromState || null);
  const [highestBid, setHighestBid] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [currentAuctionId, setCurrentAuctionId] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [auction, setAuction] = useState(null);


  useEffect(() => {
    if (productId) {
      const loadData = async () => {
        await fetchProductDetails();
        await fetchAuctionDetails();
      };
      loadData();
    } else {
      setLoading(false);
    }

    if (location.state?.paymentCompleted) {
      setPaymentStatus('completed');
      setDeliveryStatus('on_the_way');
      alert(`Payment completed! Your item is now being prepared for delivery. Confirmation: ${location.state.confirmationNumber || 'N/A'}`);
    }
    if (auctionIdFromState) {
      setAuctionId(auctionIdFromState);
    }
  }, [productId]);

  useEffect(() => {
    if (auctionId) {
      console.log(`auctionId is set to ${auctionId}, fetching bid history.`);
      fetchBidHistory();
    }
  }, [auctionId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      // const response = await axios.get(`${SERVER_URL}/product/${productId}`, {
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;
      console.log('Fetched product details:', data);

      if (data) {
        setProduct(data);

        if (data.auctionDuration) {
          setAuctionDuration({
            days: 0,
            hours: data.auctionDuration,
            minutes: 0,
            seconds: 0
          });
        }

        if (data.auctionDate && data.auctionStartTime) {
          calculateUpcomingAuctionTimeLeft(data.auctionDate, data.auctionStartTime);
        }
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
        const data = response.data[0];
        console.log('Fetched auction details:', data);
        setAuction(data);
        setCurrentPrice(data.currPrice);
        if (!auctionId) setAuctionId(data.auctionId);
        console.log("fetched auction ID:", data.auctionId);
        setCurrentAuctionId(data.auctionId);
        console.log("Set auction ID to:", currentAuctionId);
      }
    } catch (error) {
      console.error('Error fetching auction details:', error);
      return null;
    }
  };

  const markAuctionAsCompleted = async () => {
  try {
    const token = getAuthToken();
    const auctionUpdateData = {
          productId: productId,
          currPrice: auction.currPrice,
          bidCount: auction.bidCount,
          currStatus: 'COMPLETED'
        };
    if (!auctionId) return;
    await axios.put(
      // `${SERVER_URL}/auction/${auctionId}`,
      `${BIDDING_SERVICE_URL}/auction/${auctionId}`,
      auctionUpdateData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    await fetchAuctionDetails();
  } catch (error) {
    console.error('Error updating auction status to COMPLETED:', error);
  }
};

  const fetchBidHistory = async () => {
    if (!auctionId) {
      console.warn("fetchBidHistory: auctionId is not set yet.");
      return null;
    }
    try {
      const token = getAuthToken();
      // const response = await axios.get(`${SERVER_URL}/bids/auction/${auctionId}`, {
      const response = await axios.get(`${BIDDING_SERVICE_URL}/bids/auction/${auctionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Fetched bid history:', response.data);
      if (response.status === 200) {
        const data = response.data;

        if (Array.isArray(data)) {
          const formattedBids = data
            .sort((a, b) => new Date(b.bidTime || b.createdAt) - new Date(a.bidTime || a.createdAt))
            .map(bid => ({
              bidId: bid.bidId,
              newBidAmount: bid.newBidAmount,
              bidder: `Bidder ***${String(bid.buyerId).slice(-4)}`,
              time: formatTimeAgo(bid.bidTime || bid.createdAt),
              buyerId: bid.buyerId,
              isCurrentUser: getUserData().userId === bid.buyerId
            }));

          setBidHistory(formattedBids);
          console.log('Formatted bid history:', formattedBids);

          if (formattedBids.length > 0) {
            const highest = formattedBids[0].newBidAmount;
            setHighestBid(highest);
            
            if (formattedBids[0].isCurrentUser) {
              setIsWinner(true);
            } else {
              setIsWinner(false);
            }
          }
          return formattedBids;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching bid history:', error);
      return null;
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const token = getAuthToken();
      const userData = getUserData();

      if (!userData?.buyerId || !auction?.id) {
         console.log("Waiting for auction data to check payment...");
         if (!auction && productId) {
           setTimeout(checkPaymentStatus, 2000);
         }
         return;
      }
      
      // const response = await axios.get(`${SERVER_URL}/payments?buyerId=${userData.buyerId}&auctionId=${auction.auctionId}`, {
      const response = await axios.get(`${PAYMENT_SERVICE_URL}/payments?buyerId=${userData.buyerId}&auctionId=${auction.auctionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const data = response.data;
        if (data.success && data.payments && data.payments.length > 0) {
          const payment = data.payments[0];
          setPaymentStatus(payment.status);

          if (payment.status === 'completed') {
            const deliveryStatuses = ['preparing', 'on_the_way', 'ready_for_delivery'];
            const randomStatus = deliveryStatuses[Math.floor(Math.random() * deliveryStatuses.length)];
            setDeliveryStatus(randomStatus);
          }
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
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

  const calculateUpcomingAuctionTimeLeft = (auctionDate, auctionTime) => {
    const auctionDateTime = new Date(`${auctionDate}T${auctionTime}`);
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
      return false;
    }
    return true;
  };

  const calculateAuctionDurationTimeLeft = (auctionDate, auctionTime) => {
    const auctionDateTime = new Date(`${auctionDate}T${auctionTime}`);
    const now = new Date();
    const auctionEndTime = new Date(
      auctionDateTime.getTime() +
      (auctionDuration.days * 24 * 60 * 60 * 1000) +
      (auctionDuration.hours * 60 * 60 * 1000) +
      (auctionDuration.minutes * 60 * 1000) +
      (auctionDuration.seconds * 1000)
    );
    const endDiff = auctionEndTime - now;

    if (endDiff > 0) {
      const days = Math.floor(endDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((endDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((endDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((endDiff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      setAuctionEnded(false);
      return false;
    }
    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    setAuctionEnded(true);
    setAuctionStarted(false);
    return true;
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

    return images;
  };

  const carImages = getProductImages();

  useEffect(() => {
    if (!product?.auctionDate || !product?.auctionStartTime) return;

    const timer = setInterval(async () => {
      const isUpcomingOver = calculateUpcomingAuctionTimeLeft(product.auctionDate, product.auctionStartTime);
      
      if (isUpcomingOver) {
        if (!auctionStartHandled.current) {
          setAuctionStarted(true);
          await fetchAuctionDetails();
          if (auction && auction.currStatus === 'SCHEDULED') {
            try {
              const token = getAuthToken();
              await axios.put(
                // `${SERVER_URL}/auction/${auction.auctionId}`,
                `${BIDDING_SERVICE_URL}/auction/${auction.auctionId}`,
                {
                  productId: auction.productId,
                  currPrice: auction.currPrice,
                  bidCount: auction.bidCount,
                  currStatus: 'ONGOING'
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              await fetchAuctionDetails();
            } catch (err) {
              console.error('Error updating auction to ONGOING:', err);
            }
          }
          auctionStartHandled.current = true;
        }
        const isDurationOver = calculateAuctionDurationTimeLeft(product.auctionDate, product.auctionStartTime);
        
        if (isDurationOver && !auctionEnded) {
            setAuctionEnded(true); 
            setAuctionStarted(false); 
            markAuctionAsCompleted();
            if (bidHistory.length > 0) {
                const userData = getUserData();
                const highestBidder = bidHistory[0];
                if (highestBidder && userData && highestBidder.buyerId === userData.id) {
                    setIsWinner(true);
                    setPaymentTimeLeft({ hours: 24, minutes: 0, seconds: 0 });
                }
            }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [product, auctionDuration, auctionEnded, bidHistory, auction]);

  useEffect(() => {
    if (auctionEnded && isWinner && !paymentTimeExpired && paymentStatus !== 'completed') {
      const paymentTimer = setInterval(() => {
        setPaymentTimeLeft(prev => {
          const newTime = { ...prev };
          if (newTime.seconds > 0) {
            newTime.seconds--;
          } else if (newTime.minutes > 0) {
            newTime.minutes--;
            newTime.seconds = 59;
          } else if (newTime.hours > 0) {
            newTime.hours--;
            newTime.minutes = 59;
            newTime.seconds = 59;
          } else {
            setPaymentTimeExpired(true);
            setIsWinner(false);
            alert('Payment time expired! The auction may go to the next highest bidder.'); 
            clearInterval(paymentTimer);
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(paymentTimer);
    }
  }, [auctionEnded, isWinner, paymentTimeExpired, paymentStatus]);

  useEffect(() => {
    let isMounted = true;

    const pollForUpdates = async () => {
      if (!isMounted || !auctionStarted || auctionEnded) {
        return;
      }

      try {
        console.log("Polling for updates...");
            fetchAuctionDetails(),
            fetchBidHistory()

        if (isMounted && auctionStarted && !auctionEnded) {
          setTimeout(pollForUpdates, 3000);
        }

      } catch (error) {
        console.error("Error during polling:", error);
        if (isMounted && auctionStarted && !auctionEnded) {
          setTimeout(pollForUpdates, 5000);
        }
      }
    };

    if (auctionStarted && !auctionEnded) {
      pollForUpdates();
    }

    return () => {
      isMounted = false;
    };
  }, [auctionStarted, auctionEnded]);


  const handleBidSubmit = async () => {
    if (!auctionStarted) {
      alert('Auction has not started yet. Please wait for the auction to begin.');
      return;
    }

    if (auctionEnded) {
      alert('Auction has ended. No more bids can be placed.');
      return;
    }

    if (!product || !auction) {
      alert('Product or Auction information not available. Please refresh.');
      return;
    }

    const newBidAmount = parseFloat(bidAmount);
    if (!bidAmount || isNaN(newBidAmount)) {
      alert('Please enter a valid bid amount.');
      return;
    }

    const minIncrement = product.priceJump || 0;
    
    const minBidRequired = (auction.bidCount === 0) 
      ? product.startPrice 
      : (auction.currPrice + minIncrement);
    
    if (auction.bidCount === 0) {
        if (newBidAmount < product.startPrice) {
             alert(`The first bid must be at least $${product.startPrice.toLocaleString()}`);
             return;
        }
    } else {
        const requiredAmount = auction.currPrice + minIncrement;
        if (newBidAmount < requiredAmount) {
            alert(`Your bid must be at least $${requiredAmount.toLocaleString()}`);
            return;
        }
    }

    if (newBidAmount <= auction.currPrice) {
       alert(`Your bid must be higher than the current price of $${auction.currPrice.toLocaleString()}`);
       return;
    }


    try {
      setPlacingBid(true);
      const token = getAuthToken();
      const userData = getUserData();

      if (!userData || !userData.id) {
        alert('Please log in to place a bid.');
        setPlacingBid(false);
        return;
      }

      const bidData = {
        auctionId: auction.auctionId,
        bidAmount: newBidAmount,
        buyerId: userData.userId
      };
      
      if (auction.bidCount === 0) {
        console.log("Placing first bid:", bidData);
        // const response = await axios.post(`${SERVER_URL}/place-bid`, bidData, {
        const response = await axios.post(`${BIDDING_SERVICE_URL}/place-bid`, bidData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          alert(`Bid placed successfully for $${newBidAmount.toLocaleString()}!`);
        } else {
          throw new Error(`Failed to place bid: ${response.statusText}`);
        }
      } else {
        console.log("Updating bid:", bidData);
        
        // const updateBidRes = await axios.post(`${SERVER_URL}/place-bid`, bidData, {
        const updateBidRes = await axios.post(`${BIDDING_SERVICE_URL}/place-bid`, bidData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (updateBidRes.status !== 200) {
          throw new Error(`Failed to update bid: ${updateBidRes.statusText}`);
        }
        
        const auctionUpdateData = {
          productId: productId,
          currPrice: newBidAmount,
          bidCount: auction.bidCount + 1,
          currStatus: 'ONGOING'
        };
        
        console.log("Updating auction:", auctionUpdateData);
        // const updateAuctionRes = await axios.put(`${SERVER_URL}/auction/${auctionId}`, auctionUpdateData, {
          const updateAuctionRes = await axios.put(`${BIDDING_SERVICE_URL}/auction/${auctionId}`, auctionUpdateData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (updateAuctionRes.status !== 200) {
          throw new Error(`Failed to update auction: ${updateAuctionRes.statusText}`);
        }

        alert(`Bid updated successfully to $${newBidAmount.toLocaleString()}!`);
      }

      setBidAmount('');
      await fetchBidHistory();
      await fetchAuctionDetails();

    } catch (error) {
      console.error('Error placing bid:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error placing bid. Please check your connection and try again.';
      alert(errorMessage);
    } finally {
      setPlacingBid(false);
    }
  };


  const handleProceedToPayment = () => {
    const winningAmount = highestBid || currentPrice || product.startPrice;
    const auctionFee = Math.round(winningAmount * 0.05);
    const shippingFee = 2500;
    const insuranceFee = 1000; 

    const paymentData = {
      productId: productId,
      auctionId: auction.auctionId,
      buyerId: getUserData().userId,
      sellerId: product.sellerId,
      productTitle: product.title,
      winningBid: winningAmount,
      auctionFee: auctionFee,
      shippingFee: shippingFee,
      insuranceFee: insuranceFee,
      total: winningAmount + auctionFee + shippingFee + insuranceFee
    };

    navigate('/buyer/payment', { state: { auctionDetails: paymentData } });
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
  }, [isImageEnlarged, selectedImage, carImages.length]);

  const getProductInfo = () => {
    if (!product) {
      return {
        title: "Product not found",
        description: "The requested product could not be found.",
        startPrice: 0,
        priceJump: 1000,
        totalBids: 0,
        seller: "Unknown",
        status: "unknown"
      };
    }

    return {
      title: product.productModel || "Unknown Product",
      description: product.description || "No description available",
      startPrice: product.startPrice,
      priceJump: product.priceJump,
      totalBids: bidHistory.length,
      seller: `${product.sellerId}`,
      productStatus: product.productStatus || "unknown",
      modelYear: product.modelYear,
      category: product.category,
    };
  };

  const getMinimumBidDisplay = () => {
      if (!product) return 0;
      
      if (!auctionStarted || auctionEnded) {
          return product.startPrice;
      }
      
      if (auction && auction.bidCount === 0) {
          return product.startPrice;
      }
      
      return (currentPrice || product.startPrice) + (product.priceJump || 0);
  };

  const productInfo = getProductInfo();
  
  const displayPrice = currentPrice || productInfo.startPrice;
  const minimumBidToShow = getMinimumBidDisplay();

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-[#feda6a]">
        <BuyerNavbar />
        <div className="flex justify-center items-center h-50vh text-lg">
          Loading product details...
        </div>
      </div>
    );
  }

  if (!productId || !product) {
    return (
      <div className="bg-black min-h-screen text-[#feda6a]">
        <BuyerNavbar />
        <div className="flex flex-col justify-center items-center h-50vh text-lg gap-5">
          <div>Product not found or invalid product ID</div>
          <button
            onClick={() => navigate('/buyer/home')}
            className="py-3 px-6 bg-[#feda6a] text-black border-none rounded-lg text-base font-bold cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-[#feda6a]">
      <BuyerNavbar />

      <div className="max-w-full mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

        <div className="space-y-6">
          <div className="bg-[#1d1e22] rounded-xl p-5 mb-5">
            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-[#393f4d]">
              <IoMdArrowBack
                onClick={() => window.history.back()}
                className="text-4xl cursor-pointer p-2 bg-[#393f4d] rounded-full text-[#feda6a]"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold m-0">
                  {productInfo.title}
                </h1>
                <div className="flex gap-6 text-xs opacity-80 mt-1">
                  <span>Seller: {productInfo.seller}</span>
                  <span>Auction ID: {currentAuctionId}</span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg shadow-lg border border-[#feda6a]/20">
              <img
                src={carImages[selectedImage]}
                alt="Product"
                className="w-full h-[450px] object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
                onClick={() => setIsImageEnlarged(true)}
                onError={(e) => {
                  console.log('Main image failed to load:', carImages[selectedImage]);
                  e.target.src = 'https://placehold.co/600x400/1d1e22/feda6a?text=Image+Error';
                }}
              />

              {carImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 border-none rounded-full w-11 h-11 text-[#feda6a] cursor-pointer flex items-center justify-center text-xl transition-all duration-200 hover:scale-110"
                  >
                    <IoChevronBackOutline />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 border-none rounded-full w-11 h-11 text-[#feda6a] cursor-pointer flex items-center justify-center text-xl transition-all duration-200 hover:scale-110"
                  >
                    <IoChevronForwardOutline />
                  </button>
                </>
              )}

              <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-2 text-[#feda6a]">
                <ZoomInIcon />
              </div>

              <div className="absolute bottom-4 right-4 bg-black/70 rounded-lg px-3 py-1 text-[#feda6a] text-sm">
                {selectedImage + 1} / {carImages.length}
              </div>
            </div>

            {carImages.length > 1 && (
              <div className="flex justify-center mt-4 gap-2 max-w-full overflow-x-auto pb-2">
                {carImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`View ${index + 1}`}
                    className={`w-16 h-12 rounded object-cover cursor-pointer transition-all duration-300 flex-shrink-0 ${selectedImage === index
                      ? 'border-2 border-[#feda6a] opacity-100 scale-105'
                      : 'border-2 border-transparent opacity-60 hover:opacity-80'
                      }`}
                    onClick={() => setSelectedImage(index)}
                    onError={(e) => {
                      console.log('Thumbnail image failed to load:', img);
                      e.target.src = 'https://placehold.co/64x48/1d1e22/feda6a?text=Error';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#1d1e22] rounded-xl p-6">
            <h2 className="text-xl mb-5 text-[#feda6a]">
              About This Vehicle
            </h2>
            <p className="text-sm leading-relaxed mb-5 opacity-90 text-[#d4d4dc]">
              {productInfo.description}
            </p>

            <div className="mt-6 pt-5 border-t border-[#393f4d]">
              <h3 className="text-lg mb-4 text-[#feda6a]">
                Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-[#393f4d]">
                  <span className="opacity-70">Model Year</span>
                  <span className="font-bold">{productInfo.modelYear || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#393f4d]">
                  <span className="opacity-70">Category</span>
                  <span className="font-bold">{productInfo.category || 'General'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#393f4d]">
                  <span className="opacity-70">Starting Price</span>
                  <span className="font-bold">₹{productInfo.startPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#393f4d]">
                  <span className="opacity-70">Price Jump</span>
                  <span className="font-bold">₹{(productInfo.priceJump || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#393f4d]">
                  <span className="opacity-70">Auction Status</span>
                  <span className={`font-bold ${!auctionStarted && !auctionEnded ? 'text-green-500' : auctionStarted ? 'text-yellow-500' : 'text-red-500'}`}>
                    {!auctionStarted && !auctionEnded ? 'Upcoming' : auctionStarted ? 'Live' : 'Ended'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#393f4d]">
                  <span className="opacity-70">Status</span>
                  <span className="font-bold capitalize">{productInfo.productStatus}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#393f4d]">
                  <span className="opacity-70">Seller ID</span>
                  <span className="font-bold">{product?.sellerId || 'N/A'}</span>
                </div>
                {product?.auctionDate && (
                  <div className="flex justify-between py-2 border-b border-[#393f4d]">
                    <span className="opacity-70">Auction Date</span>
                    <span className="font-bold">{new Date(product.auctionDate).toLocaleDateString()}</span>
                  </div>
                )}
                {product?.auctionStartTime && (
                  <div className="flex justify-between py-2 border-b border-[#393f4d]">
                    <span className="opacity-70">Auction Time</span>
                    <span className="font-bold">{product.auctionStartTime}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-[#393f4d]">
                  <span className="opacity-70">Auction Duration</span>
                  <span className="font-bold">{auctionDuration.hours} hour{auctionDuration.hours !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#393f4d]">
              <h3 className="text-lg mb-4 text-[#feda6a]">
                Key Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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

        <div className="sticky top-5 h-fit-content space-y-5">
          {paymentStatus === 'completed' ? null : !auctionStarted && !auctionEnded ? (
            <div className="bg-[#1d1e22] rounded-xl p-5 text-center border-2 border-green-500">
              <div className="text-base mb-4 flex items-center justify-center gap-2">
                <TimerIcon />
                Auction Starts In
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <div className="text-2xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
                  <div className="text-xs opacity-70">DAYS</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-xs opacity-70">HOURS</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-xs opacity-70">MINS</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-xs opacity-70">SECS</div>
                </div>
              </div>
            </div>
          ) : auctionStarted && !auctionEnded ? (
            <div className="bg-[#1d1e22] rounded-xl p-5 text-center border-2 border-yellow-500">
              <div className="text-base mb-4 flex items-center justify-center gap-2">
                
                🔥 Auction Live - <TimerIcon /> Ends In
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <div className="text-2xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
                  <div className="text-xs opacity-70">DAYS</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-xs opacity-70">HOURS</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-xs opacity-70">MINS</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-xs opacity-70">SECS</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#393f4d] rounded-xl p-5 text-center border-2 border-[#feda6a]">
              <div className="text-lg font-bold mb-3">
                {isWinner && paymentStatus !== 'completed' ? '🎉 You Won!' : 'Auction Ended'}
              </div>
              {isWinner && !paymentTimeExpired && paymentStatus !== 'completed' && (
                <div>
                  <div className="text-sm mb-2 opacity-80">
                    Complete payment within:
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <div className="text-xl font-bold">{String(paymentTimeLeft.hours).padStart(2, '0')}</div>
                      <div className="text-xs opacity-70">HOURS</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">{String(paymentTimeLeft.minutes).padStart(2, '0')}</div>
                      <div className="text-xs opacity-70">MINS</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">{String(paymentTimeLeft.seconds).padStart(2, '0')}</div>
                      <div className="text-xs opacity-70">SECS</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-[#1d1e22] rounded-xl p-6">
            <div className="text-sm opacity-80 mb-2">
              {!auctionStarted && !auctionEnded ? 'Starting Bid' :
                auctionEnded ? (isWinner ? 'Winning Bid' : 'Final Bid') : 'Current Bid'}
            </div>
            <div className="text-4xl font-bold mb-2">
              ₹{displayPrice.toLocaleString()}
            </div>
            <div className="text-xs opacity-70 mb-5">
              {productInfo.totalBids} bids
              {auctionStarted && !auctionEnded && ` • Next min. bid: ₹${minimumBidToShow.toLocaleString()}`}
            </div>

            {!auctionStarted && !auctionEnded ? (
              <div className="p-4 bg-[#393f4d] rounded-lg text-center text-sm border border-green-500">
                <PiTimerBold />Bidding will begin when auction starts
              </div>
            ) : auctionStarted && !auctionEnded ? (
              <div>
                <input
                  type="number"
                  placeholder={`Enter $${minimumBidToShow.toLocaleString()} or more`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full p-4 rounded-lg border border-[#393f4d] text-base font-bold text-center bg-[#393f4d] text-[#feda6a] mb-4 placeholder-[#feda6a]/50"
                />
                <button
                  className="w-full p-4 border-none rounded-lg text-base font-bold cursor-pointer bg-[#feda6a] text-black flex items-center justify-center gap-2 mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={handleBidSubmit}
                  disabled={placingBid}
                >
                  <GavelIcon />
                  {placingBid ? 'Placing Bid...' : 'Place Bid'}
                </button>
              </div>
            ) : isWinner && !paymentTimeExpired ? (
              paymentStatus === 'completed' ? (
                <div className="bg-[#1d1e22] border-2 border-green-500 rounded-lg p-5 text-center">
                  <CheckCircleIcon className="text-green-500 text-5xl mb-2" />
                  <h3 className="text-green-500 m-0 mb-2">Payment Completed!</h3>
                  <div className="flex items-center justify-center gap-2 bg-[#2d3436] p-2 rounded-md mt-3">
                    <LocalShippingIcon className="text-[#feda6a]" />
                    <span className="text-[#feda6a] font-bold text-sm">
                      {deliveryStatus === 'preparing' && 'Preparing for shipping'}
                      {deliveryStatus === 'on_the_way' && 'On the way (3-5 days)'}
                      {deliveryStatus === 'ready_for_delivery' && 'Arriving today!'}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  className="w-full p-4 border-none rounded-lg text-base font-bold cursor-pointer bg-[#feda6a] text-black flex items-center justify-center gap-2 mb-4"
                  onClick={handleProceedToPayment}
                >
                  <PaymentIcon />
                  Pay Now
                </button>
              )
            ) : null}
          </div>

          <div className="bg-[#1d1e22] rounded-xl p-5">
            <h3 className="text-lg mb-4 text-[#feda6a]">
              Recent Bids
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {bidHistory.length > 0 ? bidHistory.map((bid) => (
              <div key={bid.bidId} className={`flex justify-between items-center py-2 border-b border-[#393f4d] ${bid.isCurrentUser ? 'bg-[#feda6a]/10 p-2 rounded' : ''}`}>
                <div>
                  <div className={`font-bold text-sm ${bid.isCurrentUser ? 'text-[#feda6a]' : ''}`}>
                    ₹{bid.newBidAmount.toLocaleString()}
                  </div>
                  <div className={`text-xs opacity-70 ${bid.isCurrentUser ? 'text-[#feda6a]' : ''}`}>
                    {bid.isCurrentUser ? 'You' : bid.bidder}
                  </div>
                </div>
                <div className={`text-xs opacity-70 ${bid.isCurrentUser ? 'text-[#feda6a]' : ''}`}>
                  {bid.time}
                </div>
              </div>
            )) : (
                <div className="text-sm opacity-70 text-center py-4">
                    No bids yet.
                </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {isImageEnlarged && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setIsImageEnlarged(false)}>
          <button
            onClick={(e) => { e.stopPropagation(); setIsImageEnlarged(false); }}
            className="absolute top-5 right-5 bg-black/70 border-none rounded-full w-12 h-12 text-[#feda6a] cursor-pointer text-2xl flex items-center justify-center"
          >
            <IoMdClose />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-8 bg-black/70 border-none rounded-full w-14 h-14 text-[#feda6a] cursor-pointer text-3xl flex items-center justify-center"
          >
            <IoChevronBackOutline />
          </button>

          <img
            src={carImages[selectedImage]}
            alt="Enlarged view"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking image
          />

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-8 bg-black/70 border-none rounded-full w-14 h-14 text-[#feda6a] cursor-pointer text-3xl flex items-center justify-center"
          >
            <IoChevronForwardOutline />
          </button>

          <div className="absolute bottom-8 bg-black/70 rounded-full px-4 py-2 text-[#feda6a] text-sm">
            {selectedImage + 1} / {carImages.length}
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerProductDetails