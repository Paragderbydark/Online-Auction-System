import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData } from '../../Utils/auth';

const RoleSelection = () => {
  const navigate = useNavigate();
  const userData = getUserData();

  if (!userData) {
    navigate('/login');
    return null;
  }

  const handleRoleSelect = (role) => {
    if (role === 'buyer' && userData.isBuyer) {
      navigate('/buyer');
    } else if (role === 'seller' && userData.isSeller) {
      navigate('/seller');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Choose Your Role</h2>
        <p className="text-gray-600 text-center mb-8">
          Welcome {userData.username}! You can access both buyer and seller features.
          Which role would you like to use today?
        </p>
        
        <div className="space-y-4">
          {userData.isBuyer && (
            <button
              onClick={() => handleRoleSelect('buyer')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              Continue as Buyer
            </button>
          )}
          
          {userData.isSeller && (
            <button
              onClick={() => handleRoleSelect('seller')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              Continue as Seller
            </button>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            You can switch roles anytime using the navigation menu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
