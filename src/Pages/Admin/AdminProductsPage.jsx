import React, { useState } from 'react';
import AdminNavbar from '../../Components/AdminNavbar';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const AdminProductsPage = () => {
  const [products] = useState([
    {
      id: 1,
      name: 'Vintage Rolex Submariner',
      category: 'Watches',
      seller: 'Classic Timepieces',
      currentBid: 25000,
      startingBid: 15000,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&crop=center',
      status: 'Active',
      endDate: 'Oct 15, 2024',
      bids: 23,
      views: 456
    },
    {
      id: 2,
      name: 'Van Gogh Original Sketch',
      category: 'Art',
      seller: 'Fine Arts Gallery',
      currentBid: 89000,
      startingBid: 50000,
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop&crop=center',
      status: 'Active',
      endDate: 'Oct 18, 2024',
      bids: 45,
      views: 1234
    },
    {
      id: 3,
      name: 'Diamond Necklace Set',
      category: 'Jewelry',
      seller: 'Luxury Gems',
      currentBid: 125000,
      startingBid: 80000,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop&crop=center',
      status: 'Pending',
      endDate: 'Oct 20, 2024',
      bids: 67,
      views: 789
    },
    {
      id: 4,
      name: 'Antique Persian Carpet',
      category: 'Antiques',
      seller: 'Heritage Auctions',
      currentBid: 15000,
      startingBid: 8000,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
      status: 'Ended',
      endDate: 'Oct 10, 2024',
      bids: 12,
      views: 234
    },
    {
      id: 5,
      name: 'Ferrari 458 Spider',
      category: 'Vehicles',
      seller: 'Exotic Cars',
      currentBid: 225000,
      startingBid: 180000,
      image: 'https://images.unsplash.com/photo-1544896478-d5b709d413c5?w=300&h=300&fit=crop&crop=center',
      status: 'Active',
      endDate: 'Oct 25, 2024',
      bids: 89,
      views: 2345
    },
    {
      id: 6,
      name: 'Ming Dynasty Vase',
      category: 'Antiques',
      seller: 'Asian Art Specialists',
      currentBid: 45000,
      startingBid: 25000,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&crop=center',
      status: 'Active',
      endDate: 'Oct 22, 2024',
      bids: 34,
      views: 567
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-yellow-300 mb-2">Products Management</h1>
              <p className="text-white">Manage all auction products and listings.</p>
            </div>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
              <FaPlus />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-900 rounded-xl shadow-lg border border-yellow-400 border-opacity-30 hover:shadow-xl transition-all duration-300">
              {/* Product Image */}
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
              </div>

              {/* Product Details */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-yellow-300 text-lg mb-2">{product.name}</h3>
                  <p className="text-yellow-200 text-sm mb-1">Category: {product.category}</p>
                  <p className="text-yellow-200 text-sm">Seller: {product.seller}</p>
                </div>

                {/* Bidding Info */}
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-yellow-300 text-sm">Current Bid</span>
                    <span className="font-bold text-yellow-300">${product.currentBid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-200 text-sm">Starting Bid</span>
                    <span className="text-yellow-200 text-sm">${product.startingBid.toLocaleString()}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center mb-4 text-sm text-yellow-200">
                  <span>{product.bids} bids</span>
                  <span>{product.views} views</span>
                  <span>Ends: {product.endDate}</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-1">
                    <FaEye />
                    <span>View</span>
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-1">
                    <FaEdit />
                    <span>Edit</span>
                  </button>
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-1">
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
