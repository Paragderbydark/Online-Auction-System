import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../Components/AdminNavbar';
import { FaDollarSign, FaCheck, FaTimes, FaCreditCard } from 'react-icons/fa';
import { getAuthToken } from '../../Utils/auth';
import axios from 'axios';
import { PAYMENT_SERVICE_URL, SERVER_URL } from '../../Utils/config';
import { RxDoubleArrowDown } from "react-icons/rx";

const AdminPaymentsPage = () => {
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [payments, setPayments] = useState([]);

  const buyerAvatars = [
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerOne&topType=ShortHairTheCaesar&clotheType=TShirt&eyeType=Default&mouthType=Smile&skinColor=Light',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerTwo&topType=LongHairMiaWallace&clotheType=CollarSweater&eyeType=Happy&mouthType=Default&skinColor=Tanned',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerThree&topType=ShortHairShortWaved&clotheType=ShirtCrewNeck&eyeType=Wink&mouthType=Smile&skinColor=Pale',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerFour&topType=Hat&clotheType=Overall&eyeType=Side&mouthType=Contempt&skinColor=Yellow',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerFive&topType=ShortHairFrizzle&clotheType=ShirtVNeck&eyeType=Squint&mouthType=Twinkle&skinColor=Brown',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerSix&topType=WinterHat2&clotheType=Hoodie&eyeType=Close&mouthType=Serious&skinColor=DarkBrown',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerSeven&topType=ShortHairShortFlat&clotheType=GraphicShirt&eyeType=EyeRoll&mouthType=Eating&skinColor=Light',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerEight&topType=LongHairCurly&clotheType=ShirtCrewNeck&eyeType=Hearts&mouthType=Disbelief&skinColor=Tanned',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerNine&topType=Hijab&clotheType=CollarSweater&eyeType=Happy&mouthType=Smile&skinColor=Yellow',
    'https://avataaars.io/?avatarStyle=Circle&seed=BuyerTen&topType=ShortHairShortCurly&clotheType=TShirt&eyeType=Default&mouthType=Tongue&skinColor=Pale',
  ];

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
    if (paymentFilter === 'all') return true;
    if (paymentFilter === 'SUCCESFUL') return payment.transactionStatus === 'COMPLETED';
    if (paymentFilter === 'SUCCESFUL') return payment.transactionStatus === 'SUCCESFUL';
    if (paymentFilter === 'failed') return payment.transactionStatus === 'FAILED';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-900 text-green-800';
      case 'SUCCESFUL': return 'bg-green-900 text-green-800';
      case 'FAILED': return 'bg-red-900 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <FaCheck className="text-green-600" />;
      case 'SUCCESFUL': return <FaCheck className="text-green-600" />;
      case 'FAILED': return <FaTimes className="text-red-600" />;
      default: return <FaCreditCard className="text-gray-600" />;
    }
  };

  const totalRevenue = payments.filter(payment => payment.transactionStatus === 'SUCCESFUL').reduce((sum, payment) => sum + payment.finalAmount, 0);
  const pendingPayments = payments.filter(payment => payment.transactionStatus === 'PENDING').length;
  const completedPayments = payments.filter(payment => payment.transactionStatus === 'SUCCESFUL').length;
  const failedPayments = payments.filter(payment => payment.transactionStatus === 'FAILED').length;

  const fetchPayments = async () => {
    const token = getAuthToken();
    try {
      // const response = await axios.get(`${SERVER_URL}/payments/all`, {
      const response = await axios.get(`${PAYMENT_SERVICE_URL}/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      console.log("Fetched payments: " + response.data);
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments: ", error);
    }
  }

  return (
    <div>
      <AdminNavbar />
      <div className="min-h-screen" style={{backgroundColor: '#1d1e22'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{fontFamily: 'PT Serif'}}>Payment Management</h1>
            </div>

            <div className="flex items-center bg-black rounded-lg p-1 border border-white">
              <button
                onClick={() => setPaymentFilter('all')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${paymentFilter === 'all' ? 'bg-yellow-300 text-black shadow-sm' : 'text-white hover:text-white'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setPaymentFilter('completed')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${paymentFilter === 'completed' ? 'bg-yellow-300 text-black shadow-sm' : 'text-white hover:text-white'
                  }`}
              >
                Completed
              </button>
              <button
                onClick={() => setPaymentFilter('failed')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${paymentFilter === 'failed' ? 'bg-yellow-300 text-black shadow-sm' : 'text-white hover:text-white'
                  }`}
              >
                Failed
              </button>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
              <div className="text-3xl font-bold mb-2" style={{ color: '#FED6AA' }}>₹{totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-white">Total Revenue</div>
            </div>
            <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
              <div className="text-3xl font-bold mb-2" style={{ color: '#FED6AA' }}>{completedPayments}</div>
              <div className="text-sm text-white">Completed</div>
            </div>
            <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
              <div className="text-3xl font-bold mb-2" style={{ color: '#FED6AA' }}>{pendingPayments}</div>
              <div className="text-sm text-white">Pending</div>
            </div>
            <div className="rounded-xl shadow-lg p-6 text-center" style={{backgroundColor: '#393f4d'}}>
              <div className="text-3xl font-bold mb-2" style={{ color: '#FED6AA' }}>{failedPayments}</div>
              <div className="text-sm text-white">Failed</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="rounded-xl shadow-lg border border-yellow-400 border-opacity-30 hover:shadow-xl transition-all duration-300 p-6" style={{backgroundColor: '#393f4d'}}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{backgroundColor: '#2a2e37'}}>
                      {getStatusIcon(payment.transactionStatus)}
                    </div>
                    <div>
                      <h3 className="font-bold text-yellow-300">Payment ID #{payment.id}</h3>
                      <p className="text-sm text-white">
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.transactionStatus}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-800 rounded-lg">
                  <img
                    src={buyerAvatars[Math.floor(Math.random() * 10)]}
                    alt={payment.buyerInfo.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(payment.customer.name)}&background=6366f1&color=fff`;
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-white">{payment.buyerInfo.firstName} {payment.buyerInfo.lastName}</h4>
                    <p className="text-sm text-white">{payment.buyerInfo.email}</p>
                    <p className="text-sm text-white">{payment.buyerInfo.contact}</p>
                  </div>
                </div>
                <div className="flex justify-center my-2">
                  <RxDoubleArrowDown size={24} className='text-yellow-400' />
                </div>
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-800 rounded-lg">
                  <img
                    src={sellerAvatars[Math.floor(Math.random() * 10)]}
                    alt={payment.sellerInfo.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(payment.customer.name)}&background=6366f1&color=fff`;
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-yellow-300">{payment.sellerInfo.firstName} {payment.sellerInfo.lastName}</h4>
                    <p className="text-sm text-white">{payment.sellerInfo.email}</p>
                    <p className="text-sm text-white">{payment.sellerInfo.contact}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">Amount:</span>
                    <span className="text-lg font-bold text-yellow-400">₹{payment.finalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">Payment Method:</span>
                    <span className="text-sm text-yellow-300">{payment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">Transaction ID:</span>
                    <span className="text-sm text-yellow-300 font-mono">{payment.transactionId}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {payment.status === 'Pending' && (
                    <>
                      <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-2 rounded text-xs font-medium transition-colors">
                        Process Payment
                      </button>
                      <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors">
                        Cancel
                      </button>
                    </>
                  )}
                  {payment.status === 'Failed' && (
                    <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-2 rounded text-xs font-medium transition-colors">
                      Retry Payment
                    </button>
                  )}
                  {payment.status === 'Completed' && (
                    <button className="flex-1 text-yellow-400 hover:text-yellow-300 border border-yellow-400 hover:bg-yellow-400 hover:bg-opacity-20 px-3 py-2 rounded text-xs font-medium transition-colors">
                      View Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;