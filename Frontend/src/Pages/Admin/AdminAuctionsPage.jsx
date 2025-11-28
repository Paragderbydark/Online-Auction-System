import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../Components/AdminNavbar';
import { getAuthToken, getUserData } from '../../Utils/auth';
import { BIDDING_SERVICE_URL, PRODUCT_SERVICE_URL, SERVER_URL } from '../../Utils/config';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminAuctionsPage = () => {
  const [auctionView, setAuctionView] = useState('live');
  const [loading, setLoading] = useState(false);
  const [pendingAuctions, setPendingAuctions] = useState([]);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [timers, setTimers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getPendingItems();
    getLiveItems();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      [...liveAuctions, ...pendingAuctions].forEach(auction => {
        newTimers[auction.id] = calculateTimeLeft(auction.auctionDate, auction.startTime);
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [liveAuctions, pendingAuctions]);

  const calculateTimeLeft = (auctionDate, startTime) => {
    if (!auctionDate || !startTime) return 'TBD';

    try {
      const auctionDateTime = new Date(`${auctionDate}T${startTime}`);
      const now = new Date();
      const difference = auctionDateTime - now;

      if (difference <= 0) {
        return 'Started';
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else {
        return `${minutes}m ${seconds}s`;
      }
    } catch (error) {
      console.error('Error calculating time:', error);
      return 'TBD';
    }
  };

  const getPendingItems = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      // const url = `${SERVER_URL}/admin/products/pending`;
      const url = `${PRODUCT_SERVICE_URL}/admin/products/pending`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });


      if (response.status !== 200) {
        console.error('Response error:', response.data);
        throw new Error(`Failed to fetch pending items: ${response.status} ${response.statusText}`);
      }

      const data = response.data;
      console.log('pending product:', data);

      if (Array.isArray(data)) {
        const transformedProducts = data.map(product => ({
          id: product.productId,
          title: product.productModel,
          category: product.category,
          modelYear: product.modelYear,
          startingBid: product.startPrice,
          priceJump: product.priceJump,
          estimatedBidders: Math.floor(Math.random() * 20) + 5,
          auctionDate: product.auctionDate,
          startTime: product.auctionStartTime,
          duration: product.auctionDuration,
          description: product.description,
          image: product.mainImageUrl
            ? `data:image/jpeg;base64,${product.mainImageUrl}`
            : null,
          seller: `Seller ${product.sellerId}`,
          status: product.productStatus === 'PENDING' ? 'Pending Approval' : 'Scheduled'
        }));

        setPendingAuctions(transformedProducts);
      }
      else {
        console.error('Failed to fetch pending items:', data.message);
        setPendingAuctions([]);
      }
    } catch (error) {
      console.error('Error fetching pending items:', error);
      setPendingAuctions([]);
    } finally {
      setLoading(false);
    }
  }

  const getLiveItems = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      // const url = `${SERVER_URL}/admin/products/approved`;
      const url = `${PRODUCT_SERVICE_URL}/admin/products/approved`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });


      if (response.status !== 200) {
        console.error('Response error:', response.data);
        throw new Error(`Failed to fetch pending items: ${response.status} ${response.statusText}`);
      }

      const data = response.data;
      console.log('Response data:', data);

      if (Array.isArray(data)) {
        const transformedProducts = data.map(product => ({
          id: product.productId,
          title: product.productModel,
          category: product.category,
          modelYear: product.modelYear,
          startingBid: product.startPrice,
          priceJump: product.priceJump,
          estimatedBidders: Math.floor(Math.random() * 20) + 5,
          auctionDate: product.auctionDate,
          startTime: product.auctionStartTime,
          duration: product.auctionDuration,
          description: product.description,
          image: product.mainImageUrl
            ? `data:image/jpeg;base64,${product.mainImageUrl}`
            : null,
          seller: `Seller ${product.sellerId}`,
          status: product.productStatus === 'Approved' ? 'Approved' : 'Scheduled'
        }));

        setLiveAuctions(transformedProducts);
        console.log('Live auctions set:', liveAuctions);
      }
      else {
        console.error('Failed to fetch live items:', data.message);
        setLiveAuctions([]);
      }
    } catch (error) {
      console.error('Error fetching live items:', error);
      setLiveAuctions([]);
    } finally {
      setLoading(false);
    }
  }

  const approveProduct = async (productId) => {
    try {
      const token = getAuthToken();
      const adminId = getUserData().userId;
      // const url = `${SERVER_URL}/admin/products/${productId}/approve?adminId=${adminId}`;
      const url = `${PRODUCT_SERVICE_URL}/admin/products/${productId}/approve?adminId=${adminId}`;
      const response = await axios.put(url, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        console.error('Response error:', response.data);
        throw new Error(`Failed to approve product: ${response.status} ${response.statusText}`);
      }

      const data = response.data;
      console.log('Approve response:', data);

      if (response.status == 200) {
        alert('Product approved successfully!');
        setPendingAuctions(prevAuctions =>
          prevAuctions.filter(auction => auction.id !== productId)
        );
        const auctionProduct = pendingAuctions.find(auction => auction.id === productId);
        if (auctionProduct) {
          const auctionData = {
            productId: auctionProduct.id,
            currPrice: auctionProduct.startingBid,
            bidCount: 0,
            currStatus: 'SCHEDULED',
          };
          try {
            // await axios.post(`${SERVER_URL}/auctions/create-auction`, auctionData, {
            await axios.post(`${BIDDING_SERVICE_URL}/auctions/create-auction`, auctionData, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            console.log('Auction record created with SCHEDULED status');
          } catch (err) {
            console.error('Error creating auction record:', err);
          }
        }
      } else {
        alert('Failed to approve product: ' + data.message);
      }
    } catch (error) {
      console.error('Error approving product:', error);
    }
  }

  const declineProduct = async (productId) => {
    try {
      const token = getAuthToken();

      const adminId = getUserData().userId;
      // const url = `${SERVER_URL}/admin/products/${productId}/decline?adminId=${adminId}`;
      const url = `${PRODUCT_SERVICE_URL}/admin/products/${productId}/decline?adminId=${adminId}`;

      const response = await axios.put(url, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        console.error('Response error:', response.data);
        throw new Error(`Failed to decline product: ${response.status} ${response.statusText}`);
      }

      const data = response.data;
      console.log('Decline response:', data);

      if (response.status == 200) {
        alert('Product declined successfully!');
        setPendingAuctions(prevAuctions =>
          prevAuctions.filter(auction => auction.id !== productId)
        );
      } else {
        alert('Failed to decline product: ' + data.message);
      }
    } catch (error) {
      console.error('Error declining product:', error);
    }
  }

  const handleApproveButton = (productId) => {
    approveProduct(productId, 'APPROVED');
  }

  const handleRejectButton = (productId) => {
    declineProduct(productId, 'REJECTED');
  }

  const handlePlaceBid = () => {
    alert('you have to login as buyer');
  }

  const handleWatchBid = (auction) => {
    navigate('/admin/product-details', {
      state: {
        productId: auction.id,
        from: 'admin-auctions'
      },
    });
    console.log('Navigating to admin product details for productId:', auction.id);
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

  return (
    <div>
      <AdminNavbar />
      <div className="min-h-screen" style={{backgroundColor: '#1d1e22'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{fontFamily: 'PT Serif'}}>
                {auctionView === 'live' ? 'Live Auctions' : 'Pending Auctions'}
              </h1>
            </div>

            <div className="flex items-center bg-black rounded-lg p-1 border border-white">
              <button

                onClick={() => setAuctionView('live')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${auctionView === 'live'
                  ? 'bg-yellow-300 text-black shadow-sm'
                  : 'text-white hover:text-white'
                  }`}
              >
                Live Auctions
              </button>
              <button
                onClick={() => setAuctionView('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${auctionView === 'pending'
                  ? 'bg-yellow-300 text-black shadow-sm'
                  : 'text-white hover:text-white'
                  }`}
              >
                Pending Auctions
              </button>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {auctionView === 'live' ? (
              <>
                <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
                  <div className="text-3xl font-bold mb-2 text-white">{liveAuctions.length}</div>
                  <div className="text-sm text-white">Active Auctions</div>
                </div>

                <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
                  <div className="text-3xl font-bold mb-2 text-white">
                    ₹{liveAuctions.reduce((sum, auction) => sum + (auction.currentBid || auction.startingBid || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-white">Total Value</div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
                  <div className="text-3xl font-bold mb-2 text-white">{pendingAuctions.length}</div>
                  <div className="text-sm text-white">Pending Auctions</div>
                </div>
                <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
                  <div className="text-3xl font-bold mb-2">
                    ₹{pendingAuctions.reduce((sum, auction) => sum + auction.startingBid, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-white">Starting Value</div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {auctionView === 'live' ? (
              liveAuctions.map((auction) => (
                <div key={auction.id} className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden" style={{backgroundColor: '#393f4d'}}>
                  <div className="flex h-80">
                    <div className="relative w-96 flex-shrink-0 p-4" style={{backgroundColor: '#2a2e37'}}>
                      <div className="absolute top-3 right-3 flex items-center bg-red-100 text-red-600 text-xs px-2 py-1 rounded-md z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse"></div>
                        LIVE
                      </div>
                      <div className="flex justify-center items-center h-56 mt-1">
                        <img
                          src={auction.image}
                          alt={auction.title}
                          className="w-full h-full object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 p-6 justify-between flex-row flex">
                      <div className="flex-1 flex flex-col justify-between pr-6">
                        <div>
                          <h3 className="font-bold text-2xl mb-4 text-white">{auction.title}</h3>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center">
                              <span className="text-sm px-3 py-1 rounded-full text-white" style={{backgroundColor: '#2a2e37'}}>{auction.category}</span>
                            </div>
                            <span className="text-sm font-medium text-white">{auction.modelYear}</span>
                          </div>
                          <p className="text-sm mb-4 text-gray-300">{auction.description || 'No description available'}</p>
                        </div>
                        
                        <div>
                          <div className="text-sm mb-1 text-white">Current Price</div>
                          <div className="text-3xl font-bold text-white">₹{(auction.startPrice || auction.startingBid || 0).toLocaleString()}</div>
                          <div className="text-sm text-yellow-400 mt-2 font-semibold">Price Jump: ₹{auction.priceJump?.toLocaleString() || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-center px-4">
                        <div className="rounded-lg p-4 text-center" style={{backgroundColor: '#2a2e37'}}>
                          <div className="text-sm mb-2 text-gray-400">Time Left</div>
                          <div className="text-2xl font-bold text-yellow-400">{timers[auction.id] || 'TBD'}</div>
                        </div>
                      </div>
                      <div className="w-40 flex flex-col justify-between text-center">
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm mb-1 text-white">Auction Date</div>
                            <div className="text-xs font-semibold text-white">{auction.auctionDate || 'TBD'}</div>
                          </div>

                          <div>
                            <div className="text-sm mb-1 text-white">Start Time</div>
                            <div className="text-xs font-semibold text-white">{auction.startTime || 'TBD'}</div>
                          </div>

                          <div>
                            <div className="text-sm mb-1 text-white">Duration</div>
                            <div className="text-xs font-semibold text-white">{auction.duration || 'N/A'}</div>
                          </div>
                        </div>
                        

                        <div className="flex gap-2 w-full mt-6">
                          <button onClick={handlePlaceBid} className="flex-1 border border-white hover:bg-white text-white hover:text-black text-xs font-semibold py-3 px-2 rounded-lg transition-colors cursor-pointer">
                            Place Bid
                          </button>
                          <button onClick={() => handleWatchBid(auction)} className="flex-1 border border-white bg-white text-black hover:text-white hover:bg-transparent text-xs font-semibold py-3 px-2 rounded-lg transition-colors cursor-pointer">
                            Watch
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              pendingAuctions.map((auction) => (
                <div key={auction.id} className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden" style={{backgroundColor: '#393f4d'}}>
                  <div className="flex h-80">
                    <div className="relative w-96 flex-shrink-0 p-4" style={{backgroundColor: '#2a2e37'}}>
                      <div className="absolute top-3 right-3 flex items-center bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-md z-10">
                        <div className={`w-1.5 h-1.5 rounded-full mr-1 ${auction.status === 'Scheduled' ? 'bg-blue-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                        {auction.status === 'Scheduled' ? 'SCHEDULED' : 'PENDING'}
                      </div>
                      <div className="flex justify-center items-center h-56 mt-1">
                        <img
                          src={auction.image}
                          alt={auction.title}
                          className="w-full h-full object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <span className="text-6xl hidden items-center justify-center w-full h-full">
                          {auction.category === 'Hypercars' ? '🏎️' :
                            auction.category === 'Classic Cars' ? '🚗' :
                              auction.category === 'Supercars' ? '�' : '�'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 p-6 justify-between flex-row flex">
                      <div className="flex-1 flex flex-col justify-between pr-6">
                        <div>
                          <h3 className="font-bold text-2xl mb-4 text-white">{auction.title}</h3>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center">
                              <span className="text-sm px-3 py-1 rounded-full text-white" style={{backgroundColor: '#2a2e37'}}>{auction.category}</span>
                            </div>
                            <span className="text-sm font-medium text-white">by {auction.seller}</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm mb-1 text-white">Starting Bid</div>
                          <div className="text-3xl font-bold text-white">${auction.startingBid.toLocaleString()}</div>
                          <div className="text-sm text-yellow-400 mt-2 font-semibold">Price Jump: ₹{auction.priceJump?.toLocaleString() || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-center px-4">
                        <div className="bg-gray-800 rounded-lg p-4 text-center">
                          <div className="text-sm mb-2 text-gray-400">Starts In</div>
                          <div className="text-2xl font-bold text-yellow-400">{timers[auction.id] || 'TBD'}</div>
                        </div>
                      </div>
                      <div className="w-40 flex flex-col justify-between text-center">
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm mb-1 text-white">Auction Date</div>
                            <div className="text-xs font-semibold text-white">{auction.auctionDate || 'TBD'}</div>
                          </div>
                          <div>
                            <div className="text-sm mb-1 text-white">Start Time</div>
                            <div className="text-xs font-semibold text-white">{auction.startTime || 'TBD'}</div>
                          </div>
                          <div>
                            <div className="text-sm mb-1 text-white">Duration</div>
                            <div className="text-xs font-semibold text-white">{auction.duration || 'N/A'}</div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                              <button onClick={() => handleApproveButton(auction.id)} className="text-black text-xs font-semibold py-3 px-2 rounded-lg transition-colors cursor-pointer" style={{ backgroundColor: '#FED6AA' }}>
                                Approve
                              </button>
                              <button onClick={() => handleRejectButton(auction.id)} className="border text-xs font-semibold py-3 px-2 rounded-lg transition-colors text-white border-white cursor-pointer">
                                Reject
                              </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuctionsPage;
