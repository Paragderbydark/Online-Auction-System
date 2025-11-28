import BuyerNavbar from "../../Components/BuyerNavbar";
import { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { FaCheck, FaTimes, FaCreditCard, FaDollarSign, FaRupeeSign } from 'react-icons/fa';
import { getAuthToken, getUserData } from "../../Utils/auth";
import axios from "axios";
import { PAYMENT_SERVICE_URL, SERVER_URL } from "../../Utils/config";


export default function BuyerPaymentPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState([]);

  const sellerAvatars = [
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerA&topType=ShortHairShortFlat&clotheType=BlazerShirt&accessoriesType=Prescription02&eyeType=Default&mouthType=Serious&skinColor=Light',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerB&topType=ShortHairShortRound&clotheType=BlazerSweater&accessoriesType=Wayfarers&eyeType=Squint&mouthType=Default&skinColor=Tanned',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerC&topType=LongHairStraight2&clotheType=CollarSweater&accessoriesType=Blank&eyeType=Happy&mouthType=Smile&skinColor=Yellow',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerD&topType=Eyepatch&clotheType=ShirtCrewNeck&accessoriesType=Kurt&eyeType=Default&mouthType=Serious&skinColor=Pale',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerE&topType=ShortHairShortCurly&clotheType=BlazerShirt&accessoriesType=Prescription01&eyeType=Wink&mouthType=Twinkle&skinColor=Brown',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerF&topType=LongHairBigHair&clotheType=CollarSweater&accessoriesType=Blank&eyeType=Default&mouthType=Concerned&skinColor=DarkBrown',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerG&topType=Turban&clotheType=BlazerSweater&accessoriesType=Prescription02&eyeType=Side&mouthType=Contempt&skinColor=Light',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerH&topType=ShortHairDreads01&clotheType=Overall&accessoriesType=Blank&eyeType=Happy&mouthType=Smile&skinColor=Tanned',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerI&topType=ShortHairShortRound&clotheType=BlazerShirt&accessoriesType=Round&eyeType=Default&mouthType=Default&skinColor=Yellow',
    'https://avataaars.io/?avatarStyle=Circle&seed=SellerJ&topType=ShortHairShortFlat&clotheType=CollarSweater&accessoriesType=Blank&eyeType=Squint&mouthType=Serious&skinColor=Pale',
  ];

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'completed') return payment.transactionStatus === 'COMPLETED';
    if (activeFilter === 'failed') return payment.transactionStatus === 'FAILED';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESFUL': return 'bg-green-900 text-white';
      case 'FAILED': return 'bg-red-900 text-white';
      default: return 'bg-gray-100 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <FaCheck className="text-green-600" />;
      case 'FAILED': return <FaTimes className="text-red-600" />;
      default: return <FaCreditCard className="text-gray-600" />;
    }
  };

  const totalSpent = payments.filter(payment => payment.transactionStatus === 'SUCCESFUL').reduce((sum, payment) => sum + payment.finalAmount, 0);
  const completedPayments = payments.filter(payment => payment.transactionStatus === 'SUCCESFUL').length;
  const failedPayments = payments.filter(payment => payment.transactionStatus === 'FAILED').length;

  const fetchPayments = async () => {
    const token = getAuthToken();
    const userId = getUserData().userId;

    try{
      // const response = await axios.get(`${SERVER_URL}/payments/buyer/${userId}`, {
      const response = await axios.get(`${PAYMENT_SERVICE_URL}/buyer/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log("Payments fetched:", response.data);
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <BuyerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <IoMdArrowBack
                onClick={() => navigate('/buyer')}
                style={{
                  fontSize: '40px',
                  cursor: 'pointer',
                  padding: '8px',
                  backgroundColor: '#393f4d',
                  borderRadius: '50%',
                  color: '#feda6a'
                }}
              />
              <div>
                <h1 className="text-3xl font-bold text-yellow-300 mb-2">Payment History</h1>
                <p className="text-yellow-200">Track all your auction transactions and payment details</p>
              </div>
            </div>

            <div className="flex items-center bg-black rounded-lg p-1 border border-yellow-400">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeFilter === 'all' ? 'bg-yellow-400 text-black shadow-sm' : 'text-yellow-300 hover:text-yellow-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('SUCCESFUL')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeFilter === 'SUCCESFUl' ? 'bg-yellow-400 text-black shadow-sm' : 'text-yellow-300 hover:text-yellow-400'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveFilter('failed')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeFilter === 'failed' ? 'bg-yellow-400 text-black shadow-sm' : 'text-yellow-300 hover:text-yellow-400'
                }`}
              >
                Failed
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-900 rounded-xl shadow-lg p-6 text-center border border-yellow-400 border-opacity-30">
              <div className="text-3xl font-bold mb-2 text-yellow-300">₹{totalSpent.toLocaleString()}</div>
              <div className="text-sm text-yellow-200">Total Spent</div>
            </div>
            <div className="bg-gray-900 rounded-xl shadow-lg p-6 text-center border border-yellow-400 border-opacity-30">
              <div className="text-3xl font-bold mb-2 text-yellow-300">{completedPayments}</div>
              <div className="text-sm text-yellow-200">Completed Transactions</div>
            </div>
            <div className="bg-gray-900 rounded-xl shadow-lg p-6 text-center border border-yellow-400 border-opacity-30">
              <div className="text-3xl font-bold mb-2 text-yellow-300">{failedPayments}</div>
              <div className="text-sm text-yellow-200">Failed Transactions</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-yellow-400 border-opacity-30 mb-2"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="bg-gray-900 rounded-xl shadow-lg border border-yellow-400 border-opacity-30 hover:shadow-xl transition-all duration-300 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-800">
                    {getStatusIcon(payment.transactionStatus)}
                  </div>
                  <div>
                    <h3 className="font-bold text-yellow-300">Payment ID #{payment.id}</h3>
                    <p className="text-sm text-yellow-200">
                      {new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      }).format(new Date(payment.paymentTime))}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.transactionStatus)}`}>
                  {payment.transactionStatus}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-yellow-200 mb-2">Paid to Seller:</p>
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <img
                    src={sellerAvatars[payment.sellerId % sellerAvatars.length]}
                    alt={`Seller ${payment.sellerId}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-yellow-300">Seller ID: {payment.sellerId}</h4>
                    <p className="text-sm text-yellow-200">Product ID: {payment.productId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-200">Amount Paid:</span>
                  <span className="text-lg font-bold text-yellow-400">₹                                                                                             {payment.finalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-200">Payment Method:</span>
                  <span className="text-sm text-yellow-300">{payment.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-200">Transaction ID:</span>
                  <span className="text-sm text-yellow-300 font-mono">{payment.transactionId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-200">Auction ID:</span>
                  <span className="text-sm text-yellow-300">#{payment.auctionId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <FaRupeeSign className="mx-auto text-6xl text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold text-yellow-300 mb-2">No Payments Found</h3>
            <p className="text-yellow-200">You haven't made any payments yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
