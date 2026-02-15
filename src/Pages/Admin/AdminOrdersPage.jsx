import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../Components/AdminNavbar';
import axios from 'axios';
import { BIDDING_SERVICE_URL, SERVER_URL } from '../../Utils/config';
import { getAuthToken } from '../../Utils/auth';

const AdminOrdersPage = () => {
  const [orderFilter, setOrderFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'SCHEDULED') return order.status === 'Pending Payment';
    if (orderFilter === 'COMPLETED') return order.status === 'Completed';
    if (orderFilter === 'ONGOING') return order.status === 'Processing';
    return true;
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-900 text-green-800';
      case 'Pending Payment': return 'bg-yellow-900 text-yellow-800';
      case 'Processing': return 'bg-blue-900 text-blue-800';
      case 'Cancelled': return 'bg-red-900 text-red-800';
      default: return 'bg-gray-900 text-gray-800';
    }
  };

  const totalRevenue = orders.filter(order => order.status === 'Completed').reduce((sum, order) => sum + order.winningBid, 0);
  const pendingPayments = orders.filter(order => order.status === 'Pending Payment').length;
  const completedOrders = orders.filter(order => order.status === 'Completed').length;

  const fetchOrders = async () => {
    const token = getAuthToken();
    try {
      const response = await axios.get(`${BIDDING_SERVICE_URL}/auctions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Fetched Orders:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  return (
    <div>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-yellow-300 mb-2">Order Management</h1>
            </div>
          
            <div className="flex items-center bg-black rounded-lg p-1 border border-yellow-400">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  orderFilter === 'all' ? 'bg-yellow-400 text-black shadow-sm' : 'text-yellow-300 hover:text-yellow-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setOrderFilter('completed')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  orderFilter === 'completed' ? 'bg-yellow-400 text-black shadow-sm' : 'text-yellow-300 hover:text-yellow-400'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setOrderFilter('pending')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  orderFilter === 'pending' ? 'bg-yellow-400 text-black shadow-sm' : 'text-yellow-300 hover:text-yellow-400'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setOrderFilter('processing')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  orderFilter === 'processing' ? 'bg-yellow-400 text-black shadow-sm' : 'text-yellow-300 hover:text-yellow-400'
                }`}
              >
                Processing
              </button>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
              <div className="text-3xl font-bold mb-2" style={{color: '#FED6AA'}}>{orders.length}</div>
              <div className="text-sm text-white">Total Orders</div>
            </div>
            <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
              <div className="text-3xl font-bold mb-2" style={{color: '#FED6AA'}}>${totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-white">Total Revenue</div>
            </div>
            <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
              <div className="text-3xl font-bold mb-2" style={{color: '#FED6AA'}}>{completedOrders}</div>
              <div className="text-sm text-white">Completed Orders</div>
            </div>
            <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
              <div className="text-3xl font-bold mb-2" style={{color: '#FED6AA'}}>{pendingPayments}</div>
              <div className="text-sm text-white">Pending Payments</div>
            </div>
          </div>

          <div className="rounded-xl shadow-lg border border-yellow-400 border-opacity-30 overflow-hidden" style={{backgroundColor: '#393f4d'}}>
            <div className="px-6 py-4 border-b border-yellow-400 border-opacity-30">
              <h2 className="text-xl font-bold text-yellow-300">Transaction History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr className="text-left text-sm font-medium text-yellow-300">
                    <th className="px-6 py-3 w-40">Order Details</th>
                    <th className="px-6 py-3 w-48">Customer</th>
                    <th className="px-6 py-3 w-56">Auction Item</th>
                    <th className="px-6 py-3 w-32 text-center">Amount</th>
                    <th className="px-6 py-3 w-28 text-center">Status</th>
                    <th className="px-6 py-3 w-36 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-400 divide-opacity-30">
                  {filteredOrders.map((order) => (
                    <tr key={order.auctionId} className="hover:bg-yellow-900 hover:bg-opacity-100 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-yellow-200">{order.orderDate}</div>
                          <div className="text-xs text-yellow-200 opacity-70">ID: {order.transactionId}</div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {/* <img 
                            src={order.customer.avatar} 
                            alt={order.customer.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customer.name)}&background=6366f1&color=fff`;
                            }}
                          /> */}
                          <div className="min-w-0">
                            <div className="font-medium text-yellow-300 text-sm truncate">{order.customer.name}</div>
                            <div className="text-sm text-yellow-200 truncate">{order.customer.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Auction Item */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={order.auctionImage} 
                            alt={order.auctionItem}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-yellow-300 text-sm truncate">{order.auctionItem}</div>
                            <div className="text-sm text-yellow-200">Winning Bid</div>
                          </div>
                        </div>
                      </td>

                      {/* Transaction */}
                      <td className="px-6 py-4 text-center">
                        <div>
                          <div className="font-bold text-yellow-300 text-lg">${order.winningBid.toLocaleString()}</div>
                          <div className="text-xs text-yellow-200">{order.paymentMethod}</div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col space-y-1">
                          <button className="text-yellow-400 hover:text-yellow-300 text-xs font-medium">
                            View Details
                          </button>
                          {order.status === 'Pending Payment' && (
                            <button className="text-yellow-400 hover:text-yellow-300 text-xs font-medium">
                              Process Payment
                            </button>
                          )}
                          {order.status === 'Processing' && (
                            <button className="text-yellow-400 hover:text-yellow-300 text-xs font-medium">
                              Ship Order
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>          
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
