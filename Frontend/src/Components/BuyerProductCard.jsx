import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BIDDING_SERVICE_URL } from '../Utils/config';

const fallbackImage = 'https://via.placeholder.com/500x300/393f4d/feda6a?text=No+Image+Available';

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
    durationMinutes =
      (d.days || 0) * 24 * 60 +
      (d.hours || 0) * 60 +
      (d.minutes || 0) +
      Math.ceil((d.seconds || 0) / 60);
  }

  if (!auctionDate || !auctionTime) return 'upcoming';
  const start = new Date(`${auctionDate}T${auctionTime}`);
  if (isNaN(start.getTime())) return 'upcoming';
  const now = new Date();
  const end = new Date(start.getTime() + durationMinutes * 60000);
  if (now < start) return 'upcoming';
  if (now >= start && now < end) return 'live';
  return 'ended';
}

function BuyerProductCard({ products = [], loading = false }) {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user'));
  const userId = userData?.userId || userData?.id;
  const [auctionStatusMap, setAuctionStatusMap] = useState({});

  useEffect(() => {
    async function fetchAuctionStatuses() {
      const statusMap = {};
      await Promise.all(products.map(async (product) => {
        try {
          const res = await axios.get(`${BIDDING_SERVICE_URL}/auctions/product/${product.productId}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          if (Array.isArray(res.data) && res.data.length > 0) {
            statusMap[product.productId || product.id] = {
              status: res.data[0].currStatus || res.data[0].status,
              auctionId: res.data[0].auctionId
            };
          } else {
            statusMap[product.productId || product.id] = { status: 'NO_AUCTION', auctionId: null };
          }
        } catch (e) {
          statusMap[product.productId || product.id] = { status: 'NO_AUCTION', auctionId: null };
        }
      }));
      setAuctionStatusMap(statusMap);
    }
    if (products.length > 0) fetchAuctionStatuses();
  }, [products]);

  const handleAction = (productId, status) => {
    const auctionId = auctionStatusMap[productId]?.auctionId || null;
    navigate('/buyer/product-details', { state: { productId: productId.toString(), auctionId } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1d1e22]">
        <div className="text-[#feda6a] text-xl">Loading products...</div>
      </div>
    );
  }

  const displayItems = products.slice(0, 10);

  const formatProduct = (product) => {
    const status = getAuctionStatus(product);
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

    let timeLeftLabel = '';
    if (!auctionDate || !auctionTime) {
      timeLeftLabel = '';
    } else {
      const start = new Date(`${auctionDate}T${auctionTime}`);
      const now = new Date();
      const end = new Date(start.getTime() + durationMinutes * 60000);
      if (status === 'upcoming') {
        timeLeftLabel = getTimeDiffString(start, now);
      } else if (status === 'live') {
        timeLeftLabel = getTimeDiffString(end, now);
      } else {
        timeLeftLabel = '';
      }
    }

    let currentBid = product.currentBid;
    if (currentBid === undefined) currentBid = product.highestBid;
    if (currentBid === undefined) currentBid = product.reserve_price;
    if (currentBid === undefined) currentBid = product.startPrice || product.starting_price || 0;

    if (product.productModel) {
      let imageUrl = fallbackImage;
      if (product.mainImageUrl) {
        if (product.mainImageUrl.startsWith('data:image/')) {
          imageUrl = product.mainImageUrl;
        } else {
          imageUrl = `data:image/jpeg;base64,${product.mainImageUrl}`;
        }
      }
      return {
        id: product.productId,
        name: product.productModel,
        baseBid: product.startPrice || 100000,
        currentBid: currentBid,
        timeLeft: timeLeftLabel,
        image: imageUrl,
        status: status === 'live' ? 'Live' : 'Active',
        rawStatus: status,
        description: product.description
      };
    }
    if (product.product_model) {
      let imageUrl = fallbackImage;
      if (product.product_images && product.product_images.length > 0) {
        const firstImage = product.product_images[0];
        if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
          imageUrl = fallbackImage;
        } else {
          const baseUrl = SERVER_URL.replace('/api/v1', '');
          imageUrl = `${baseUrl}/data/${firstImage}`;
        }
      }
      return {
        id: product.id,
        name: product.product_model,
        baseBid: product.starting_price || 100000,
        currentBid: currentBid,
        timeLeft: timeLeftLabel,
        image: imageUrl,
        status: status === 'live' ? 'Live' : 'Active',
        rawStatus: status,
        description: product.description
      };
    }
    return product;
  };

  function getTimeDiffString(future, now) {
    let diff = future - now;
    if (diff <= 0) return '0m';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    let str = '';
    if (days > 0) str += `${days}d `;
    if (hours > 0 || days > 0) str += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) str += `${minutes}m`;
    else str += `${seconds}s`;
    return str.trim();
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-6 bg-[#1d1e22] min-h-screen">
      {displayItems.map((product) => {
        const item = formatProduct(product);
        let buttonText = '';
        // Use auctionStatusMap for status if available
        const auctionStatusObj = auctionStatusMap[product.productId || product.id] || { status: item.rawStatus, auctionId: null };
        const auctionStatus = auctionStatusObj.status;
        if (auctionStatus === 'UPCOMING' || auctionStatus === 'upcoming') buttonText = 'See Product Details';
        else if (auctionStatus === 'LIVE' || auctionStatus === 'live') buttonText = 'Place Bid';
        else if (auctionStatus === 'COMPLETED' || auctionStatus === 'completed' || auctionStatus === 'ENDED' || auctionStatus === 'ended') buttonText = 'Watch History';
        else buttonText = 'See Product Details';
        return (
        <div key={item.id} className="bg-[#393f4d] rounded-2xl shadow-lg w-full h-fit overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl relative border border-[#feda6a]/20 flex flex-col">
          <div className="absolute top-4 right-4 bg-[#feda6a] text-[#1d1e22] px-3 py-1 rounded-lg text-sm font-semibold shadow-md z-10">
            {auctionStatus}
          </div>

          <div className="p-4 pb-2">
            <h4 className="m-0 text-xl font-semibold text-[#feda6a] truncate pr-20">
              {item.name}
            </h4>
          </div>

          <div className="h-48 mx-4 mb-4 overflow-hidden rounded-xl border border-[#feda6a]/20 bg-gray-800 flex items-center justify-center">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                console.log('Image failed to load:', item.image);
                e.target.src = fallbackImage;
              }}
            />
          </div>

          <div className="p-4 pt-0 space-y-3 flex-grow">
            <div className="flex justify-between items-center">
              <span className="text-[#d4d4dc] font-medium text-sm">Base Bid:</span>
              <span className="font-semibold text-[#feda6a] text-sm">
                ₹{item.baseBid.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#d4d4dc] font-medium text-sm">Current Bid:</span>
              <span className="font-semibold text-[#feda6a] text-sm">
                ₹{item.currentBid !== undefined ? item.currentBid.toLocaleString() : item.baseBid.toLocaleString()}
              </span>
            </div>

            {(item.status === 'Live' || item.status === 'Active') && item.timeLeft && (
              <div className="flex justify-between items-center">
                <span className="text-[#d4d4dc] font-medium text-sm">{item.status === 'Live' ? 'Bidding Time Left:' : 'Auction Starts In:'}</span>
                <span className="font-semibold text-red-400 bg-[#1d1e22] px-2 py-1 rounded-md text-xs">
                  {item.timeLeft}
                </span>
              </div>
            )}

            <button 
              className="w-full py-3 px-4 bg-[#feda6a] text-[#1d1e22] rounded-xl transition-all duration-300 font-semibold mt-4 hover:bg-[#feda6a]/90 hover:shadow-lg active:scale-95 cursor-pointer" 
              onClick={() => handleAction(item.id, auctionStatusObj.status)}
              disabled={product.sellerId === userId}
              style={product.sellerId === userId ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {product.sellerId === userId ? 'You cannot bid on your own product' : buttonText}
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );
}

export default BuyerProductCard;