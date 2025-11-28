import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../Components/AdminNavbar';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { getAuthToken } from '../../Utils/auth';
import axios from 'axios';
import { REVIEW_SERVICE_URL, SERVER_URL } from '../../Utils/config';
import { RxDoubleArrowRight } from "react-icons/rx";

const AdminReviewPage = () => {
  const [reviews, setReviews] = useState([]);

  const avatars = [
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-900 text-green-800';
      case 'Pending': return 'bg-yellow-900 text-yellow-800';
      case 'Rejected': return 'bg-red-900 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    const finalRating = Math.min(5, Math.max(0, rating));

    return [...Array(5)].map((_, i) => {
      const starValue = i + 1;

      if (starValue <= finalRating) {
        return <FaStar key={i} className="text-sm text-yellow-400" />;
      } else if (starValue - finalRating < 1 && starValue - finalRating > 0) {

        const fractionalPart = finalRating - Math.floor(finalRating);

        if (fractionalPart > 0) {
          return <FaStarHalfAlt key={i} className="text-sm text-yellow-400" />;
        }
      }

      return <FaStar key={i} className="text-sm text-gray-300" />;
    });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const token = getAuthToken();

    try {
      // const response = await axios.get(`${SERVER_URL}/reviews/admin/all`, {
      const response = await axios.get(`${REVIEW_SERVICE_URL}/admin/all`, {
        headers:
        {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(response.data);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }

  const handleDeleteReview = async (reviewId) => {
    const token = getAuthToken();
    try {
      // await axios.delete(`${SERVER_URL}/reviews/delete/${reviewId}`, {
      await axios.delete(`${REVIEW_SERVICE_URL}/delete/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  }

  return (
    <div>
      <AdminNavbar />
      <div className="min-h-screen" style={{backgroundColor: '#1d1e22'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{fontFamily: 'PT Serif'}}>Reviews Management</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6" style={{backgroundColor: '#393f4d'}}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={avatars[Math.floor(Math.random() * avatars.length)]}
                      alt={review.buyerInfo.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer.name)}&background=6366f1&color=fff`;
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-white">{review.buyerInfo.firstName} {review.buyerInfo.lastName}</h3>
                      <p className='text-sm text-white'>{review.buyerInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex justify-center my-2">
                    <RxDoubleArrowRight size={24} className='text-yellow-400' />
                  </div>
                  <div className="flex items-center space-x-3">
                    <img
                      src={avatars[Math.floor(Math.random() * avatars.length)]}
                      alt={review.buyerInfo.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer.name)}&background=6366f1&color=fff`;
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-white">{review.sellerInfo.firstName} {review.sellerInfo.lastName}</h3>
                      <p className='text-sm text-white'>{review.sellerInfo.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-yellow-300">Auction ID #{review.auctionId}</h4>
                  </div>
                </div>

                <div className="flex justify-between items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm font-medium text-white">{review.rating}/5</span>
                  </div>
                  <p className="text-sm text-white mb-3">
                    {new Intl.DateTimeFormat('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    }).format(new Date(review.createdAt))}
                  </p>
                </div>

                <p className="text-white mb-4 leading-relaxed">{review.review}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-600">
                  <div className="flex justify-end w-full">
                    <button onClick={() => handleDeleteReview(review.id)} className="w-20 text-white hover:bg-white hover:text-black text-xs font-large font-bold p-2 border border-white rounded-lg transition duration-300">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewPage;