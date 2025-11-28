import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import SellerNavbar from '../../Components/SellerNavbar';
import styles from '../../Styles/SellerHomePage.module.css'
import { PRODUCT_SERVICE_URL, SERVER_URL } from '../../Utils/config';
import { debugAuthState, getUserData } from '../../Utils/auth';
import axios from 'axios';

const SellerHomePage = () => {
  const navigate = useNavigate();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [auctionItems, setAuctionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    debugAuthState();
    fetchSellerProducts();
  }, []);

  const fetchSellerProducts = async () => {
  try {
    setLoading(true);
    const userData = getUserData();
    console.log('User data:', userData);
    
    if (!userData) {
      setError('User not authenticated. Please log in.');
      setLoading(false);
      return;
    }
    
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    console.log('Token available:', !!token);

    if (!token) {
      setError('User not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    const sellerId = userData.userId;
    if (!sellerId) {
      setError('User ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    if (!userData.roles || !userData.roles.includes('ROLE_SELLER')) {
      setError('You do not have seller privileges. Please contact support to enable seller features.');
      setLoading(false);
      return;
    }

    // const response = await axios.get(`${SERVER_URL}/products/seller/${sellerId}`, {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products/seller/${sellerId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    const data = response.data;
    console.log('Fetched products:', data);
    
    setAuctionItems(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    if (error.response?.status === 404) {
      setError('Seller not found. Please ensure you have seller privileges.');
    } else if (error.response?.status === 403) {
      setError('You do not have permission to access seller features.');
    } else {
      setError(`Failed to fetch products: ${error.response?.data || error.message}`);
    }
  } finally {
    setLoading(false);
  }
} 

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'APPROVED': return 'Approved';
      case 'DECLINED': return 'Declined';
      case 'pending': return 'Pending';
      case 'Approved': return 'Approved';
      case 'Declined': return 'Declined';
      default: return status;
    }
  };

  const getImageUrl = (imageData) => {

    if (imageData.startsWith('data:')) {
      return imageData;
    }

    if (typeof imageData === 'string' && imageData.length > 50) {
      return `data:image/jpeg;base64,${imageData}`;
    }

    if (imageData.startsWith('http')) {
      return imageData;
    }

    return null;
  };

  const [formData, setFormData] = useState({
    review: ''
  });

  const handleRevSnd = () => {
    setShowReviewForm((prev) => (!prev));
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (formData.review.trim() === '') return alert("Please enter a review before submitting.");
    alert("Review submitted successfully!");
  };

  return (
    <>
      <SellerNavbar />
      <main className={styles.mainSection}>
        <button onClick={() => navigate('/seller/add-product')} className={styles.addBtn}>+ Add Item</button>

        {loading && <div className={styles.loading}>Loading your products...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && auctionItems.length === 0 && (
          <div className={styles.noProducts}>
            <h3>No Products Yet</h3>
            <p>You haven't added any products to auction yet.</p>
            <p>Click the "+ Add Item" button above to start selling your first item!</p>
          </div>
        )}

        <div className={styles.imageGrid}>
          {auctionItems.map((item, index) => (
            <div key={item.productId || index}>
              <div className={styles.head}>
                <h4 style={{ margin: 0, padding: 0 }}>
                  {(item.productModel || item.title)?.length > 12 ? (item.productModel || item.title)?.slice(0, 12) + '...' : (item.productModel || item.title)}
                </h4>
                <div className={styles.badge}>{getStatusDisplay(item.productStatus)}</div>
              </div>
              <div className={styles.imageContainer}>
                <img
                  src={item.mainImageUrl ? getImageUrl(item.mainImageUrl) : (item.additionalImageUrls && item.additionalImageUrls.length > 0 ? getImageUrl(item.additionalImageUrls[0]) : '')}
                  alt={item.productModel || item.title}
                  onError={(e) => {
                    console.log('Failed to load image for product:', item.productId);
                    e.target.src = '';
                  }}
                />
              </div>
              <div className={styles.auctionInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Starting Price:</span>
                  <span className={styles.value}>₹{item.startPrice}</span>
                </div>
                {item.modelYear && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Model Year:</span>
                    <span className={styles.value}>{item.modelYear}</span>
                  </div>
                )}
                {item.category && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Category:</span>
                    <span className={styles.value}>{item.category}</span>
                  </div>
                )}
              </div>
              <button 
                className={styles.viewDetailsBtn}
                onClick={() => navigate('/seller/product-details', { state: { productId: item.productId } })}
              >
                View Full Details
              </button>
            </div>
          ))}
        </div>
      </main>

      {showReviewForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer1}>
            <svg className={styles.closeIcon} onClick={() => setShowReviewForm(!showReviewForm)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <h1>Add Review</h1>
            <form onSubmit={handleReviewSubmit}>
              <textarea name="review" value={formData.review} onChange={handleChange} required />
              <button type="submit" className={`${styles.value} ${styles.review}`}>Submit</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SellerHomePage;
