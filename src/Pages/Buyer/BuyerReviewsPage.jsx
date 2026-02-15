import React, { useState, useEffect } from 'react'
import BuyerNavbar from '../../Components/BuyerNavbar'
import { FaStar, FaUser, FaStarHalfAlt, FaEdit, FaTrash } from 'react-icons/fa'
import { getAuthToken, getUserData } from '../../Utils/auth'
import axios from 'axios'
import { REVIEW_SERVICE_URL, SERVER_URL } from '../../Utils/config'

const BuyerReviewsPage = () => {
  const [activeTab, setActiveTab] = useState('write')
  const [reviewData, setReviewData] = useState({
    sellerId: '',
    auctionId: '',
    review: '',
    rating: 0
  })
  const [myReviews, setMyReviews] = useState([])
  const [feedbackReviews, setFeedbackReviews] = useState([])
  const [reviewId, setReviewId] = useState('')
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadMyReviews()
    loadFeedbackReviews()
  }, [])

  const loadMyReviews = async() => {
    const token = getAuthToken();
    const userId = getUserData().userId;

    try{
      // const response = await axios.get(`${SERVER_URL}/reviews/buyer/${userId}`, {
      const response = await axios.get(`${REVIEW_SERVICE_URL}/buyer/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Fetched reviews:', response.data);
      setReviewId(response.data.id);
      setMyReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }

  const loadFeedbackReviews = async() => {
    const token = getAuthToken();
    const userId = getUserData().userId;

    try{
      // const response = await axios.get(`${SERVER_URL}/reviews/seller/${userId}`, {
      const response = await axios.get(`${REVIEW_SERVICE_URL}/seller/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Fetched feedback reviews:', response.data);
      setFeedbackReviews(response.data);
    } catch (error) {
      console.error('Error fetching feedback reviews:', error);
    }
  }

  const handleStarClick = (rating) => {
    setReviewData(prev => ({
      ...prev,
      rating: rating
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProductSelect = (product) => {
    setReviewData(prev => ({
      ...prev,
      auctionId: product.auctionId,
      sellerId: product.sellerId
    }))
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!reviewData.auctionId || !reviewData.review) {
      alert('Please fill in all required fields')
      return
    }

    if (reviewData.rating === 0) {
      alert('Please provide a rating')
      return
    }

    const token = getAuthToken();
    const userId = getUserData().userId;

    try {
      // const response = await axios.post(`${SERVER_URL}/reviews/create-review`, {
      const response = await axios.post(`${REVIEW_SERVICE_URL}/create-review`, {
        buyerId: userId,
        sellerId: reviewData.sellerId,
        auctionId: reviewData.auctionId,
        review: reviewData.review,
        rating: reviewData.rating
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Review submitted:', response.data);
      
      setReviewData({
        sellerId: '',
        auctionId: '',
        review: '',
        rating: 0
      })

      alert('Review submitted successfully!')
      loadMyReviews()
      setActiveTab('my-reviews')
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.')
    }
  }

  const handleUpdateReview = async () => {
    const token = getAuthToken();
    const userId = getUserData().userId;

    try {
      // const response = await axios.put(`${SERVER_URL}/reviews/update/${reviewId}`, {
      const response = await axios.put(`${REVIEW_SERVICE_URL}/update/${reviewId}`, {
        buyerId: userId,
        sellerId: reviewData.sellerId,
        auctionId: reviewData.auctionId,
        review: reviewData.review,
        rating: reviewData.rating
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Review updated:', response.data);
      alert('Review updated successfully!');
      loadMyReviews();
      setActiveTab('my-reviews');
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review. Please try again.');
    }
  }

  const handleEditReview = (review) => {
    setReviewData({
      sellerId: review.sellerId,
      auctionId: review.auctionId,
      review: review.review,
      rating: review.rating
    });
    setReviewId(review.id);
    setIsEditing(true);
    setActiveTab('write');
  };

  const handleDeleteReview = async (id) => {
    const token = getAuthToken();
    const userId = getUserData().userId;

    try{
      // await axios.delete(`${SERVER_URL}/reviews/delete/${id}`, {
      const response = await axios.delete(`${REVIEW_SERVICE_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      alert('Review deleted successfully!');
      loadMyReviews();
      setActiveTab('my-reviews');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  }

  const renderStarRating = (rating, onStarClick) => {
    const handleStarClick = (starIndex, e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const starWidth = rect.width;
      const isLeftHalf = clickX < starWidth / 2;
      
      const newRating = isLeftHalf ? starIndex - 0.5 : starIndex;
      onStarClick(newRating);
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= Math.floor(rating);
            const isHalfFilled = star === Math.ceil(rating) && rating % 1 !== 0;
            
            return (
              <div 
                key={star} 
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={(e) => handleStarClick(star, e)}
              >
                {isHalfFilled ? (
                  <>
                    <FaStar className="star" style={{ color: '#6b7280' }} />
                    <FaStarHalfAlt 
                      className="star filled" 
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0,
                        pointerEvents: 'none'
                      }} 
                    />
                  </>
                ) : (
                  <FaStar className={`star ${isFilled ? 'filled' : ''}`} />
                )}
              </div>
            );
          })}
        </div>
        {rating > 0 && (
          <span style={{ 
            fontSize: '1.2rem', 
            fontWeight: 'bold', 
            color: '#feda6a' 
          }}>
            {rating.toFixed(1)}/5
          </span>
        )}
      </div>
    )
  }

  const renderDisplayStars = (rating) => {
    const finalRating = Math.min(5, Math.max(0, rating));

    return (
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          
          if (starValue <= Math.floor(finalRating)) {
            return <FaStar key={i} style={{ color: '#feda6a', fontSize: '1rem' }} />;
          } else if (starValue === Math.ceil(finalRating) && finalRating % 1 !== 0) {
            return <FaStarHalfAlt key={i} style={{ color: '#feda6a', fontSize: '1rem' }} />;
          }
          return <FaStar key={i} style={{ color: '#6b7280', fontSize: '1rem' }} />;
        })}
        <span style={{ marginLeft: '8px', fontSize: '0.9rem', opacity: 0.8, color: '#d4d4dc' }}>
          {finalRating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1d1e22',
      color: '#d4d4dc'
    }}>
      <BuyerNavbar />
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '40px',
          textAlign: 'center',
          color: '#feda6a'
        }}>
          Product Reviews
        </h1>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '40px',
          borderBottom: '2px solid #393f4d'
        }}>
          <button
            onClick={() => setActiveTab('write')}
            style={{
              padding: '15px 30px',
              backgroundColor: 'transparent',
              border: 'none',
              color: activeTab === 'write' ? '#feda6a' : '#d4d4dc',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderBottom: activeTab === 'write' ? '3px solid #feda6a' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            Write Review
          </button>
          <button
            onClick={() => setActiveTab('my-reviews')}
            style={{
              padding: '15px 30px',
              backgroundColor: 'transparent',
              border: 'none',
              color: activeTab === 'my-reviews' ? '#feda6a' : '#d4d4dc',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderBottom: activeTab === 'my-reviews' ? '3px solid #feda6a' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            My Reviews ({myReviews.length})
          </button>
        </div>

        {activeTab === 'write' && (
          <div style={{
            backgroundColor: '#393f4d',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '30px', 
              color: '#feda6a' 
            }}>
              {isEditing ? 'Update Your Review' : 'Write a New Review'}
            </h2>

            <form onSubmit={isEditing ? (e) => { e.preventDefault(); handleUpdateReview(); } : handleSubmitReview}>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: 'bold' 
                }}>
                  Auction ID:
                </label>
                <input
                  type="number"
                  name="auctionId"
                  value={reviewData.auctionId}
                  onChange={(e) => setReviewData(prev => ({ ...prev, auctionId: e.target.value }))}
                  placeholder="Enter auction ID"
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '2px solid #1d1e22',
                    backgroundColor: '#1d1e22',
                    color: '#d4d4dc',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: 'bold' 
                }}>
                  Seller ID:
                </label>
                <input
                  type="number"
                  name="sellerId"
                  value={reviewData.sellerId}
                  onChange={(e) => setReviewData(prev => ({ ...prev, sellerId: e.target.value }))}
                  placeholder="Enter seller ID"
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '2px solid #1d1e22',
                    backgroundColor: '#1d1e22',
                    color: '#d4d4dc',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: 'bold' 
                }}>
                  Rating:
                </label>
                {renderStarRating(reviewData.rating, handleStarClick)}
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: 'bold' 
                }}>
                  Your Review:
                </label>
                <textarea
                  name="review"
                  value={reviewData.review}
                  onChange={(e) => setReviewData(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="Share your experience with this seller..."
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '2px solid #1d1e22',
                    backgroundColor: '#1d1e22',
                    color: '#d4d4dc',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#feda6a',
                  color: '#1d1e22',
                  padding: '15px 40px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginRight: isEditing ? '15px' : 0
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#ffed85'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#feda6a'}
              >
                {isEditing ? 'Update Review' : 'Submit Review'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  style={{
                    backgroundColor: '#393f4d',
                    color: '#feda6a',
                    padding: '15px 30px',
                    borderRadius: '8px',
                    border: '1px solid #feda6a',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    setIsEditing(false);
                    setReviewData({ sellerId: '', auctionId: '', review: '', rating: 0 });
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        )}

        {activeTab === 'my-reviews' && (
          <div>
            {myReviews.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#393f4d',
                borderRadius: '12px'
              }}>
                <FaUser size={60} color="#feda6a" style={{ marginBottom: '20px' }} />
                <h3 style={{ marginBottom: '15px', color: '#feda6a' }}>No Reviews Yet</h3>
                <p style={{ color: '#d4d4dc', opacity: 0.8 }}>
                  You haven't written any reviews. Start by writing your first review!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {myReviews.map(review => (
                  <div
                    key={review.id}
                    style={{
                      backgroundColor: '#393f4d',
                      borderRadius: '12px',
                      padding: '30px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '20px' 
                    }}>
                      <div>
                        <p style={{ 
                          color: '#d4d4dc', 
                          opacity: 0.9,
                          marginBottom: '5px'
                        }}>
                          Auction ID: #{review.auctionId}
                        </p>
                        <p style={{ 
                          color: '#d4d4dc', 
                          opacity: 0.7,
                          fontSize: '0.9rem'
                        }}>
                          Seller ID: {review.sellerId}
                        </p>
                        <p style={{ 
                          color: '#d4d4dc', 
                          opacity: 0.6,
                          fontSize: '0.85rem',
                          marginTop: '5px'
                        }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #feda6a',
                          color: '#feda6a',
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleEditReview(review)}
                        >
                          <FaEdit />
                        </button>
                        <button style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #d4d4dc',
                          color: '#d4d4dc',
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleDeleteReview(review.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {renderDisplayStars(review.rating)}
                    </div>
                    <span className="text-sm font-medium text-yellow-300">{review.rating}/5</span>
                  </div>

                    <p style={{ 
                      lineHeight: 1.6, 
                      color: '#d4d4dc',
                      marginBottom: '15px'
                    }}>
                      {review.review}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .star-rating {
          display: flex;
          gap: 8px;
        }
        
        .star {
          font-size: 2rem;
          color: #6b7280;
          transition: all 0.2s ease;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }
        
        .star-rating > div:hover .star {
          transform: scale(1.15);
          filter: drop-shadow(0 4px 8px rgba(254, 218, 106, 0.4));
        }
        
        .star.filled {
          color: #feda6a;
          filter: drop-shadow(0 2px 8px rgba(254, 218, 106, 0.5));
        }
        
        .display-stars {
          display: flex;
          gap: 3px;
          margin-top: 5px;
        }
        
        .display-star {
          font-size: 1rem;
          color: #393f4d;
        }
        
        .display-star.filled {
          color: #feda6a;
        }
        
        input:focus, textarea:focus {
          outline: none;
          border-color: #feda6a !important;
        }
        
        input[type="radio"]:checked {
          accent-color: #feda6a;
        }
      `}</style>
    </div>
  )
}

export default BuyerReviewsPage