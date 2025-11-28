import SellerNavbar from "../../Components/SellerNavbar";
import styles from "../../Styles/SellerReviewsPage.module.css";
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import client from '../../../src/assets/client.jpg'
import { getAuthToken, getUserData } from "../../Utils/auth";
import { useEffect, useState } from "react";
import { REVIEW_SERVICE_URL, SERVER_URL } from "../../Utils/config";
import axios from "axios";
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';



export default function SellerReviewsPage() {

  const [reviews,setReviews] = useState([]);
  const username = getUserData().username;

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

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const token = getAuthToken();
    const userId = getUserData().userId;

    try{
      // const response = await axios.get(`${SERVER_URL}/reviews/seller/${userId}`, {
      const response = await axios.get(`${REVIEW_SERVICE_URL}/seller/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Fetched seller reviews:', response.data);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const getRandomAvatar = (buyerId) => {
    return buyerAvatars[buyerId % buyerAvatars.length];
  };

  const renderStars = (rating) => {
    const finalRating = Math.min(5, Math.max(0, rating));
    return (
      <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        {[...Array(5)].map((_, i) => {
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
        })}
      </span>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <>
      <SellerNavbar />
      <section className={styles.mainSection}>
        <div className={styles.cover}>
          <div className={styles.reviewCard}>
            <Stack direction="column" spacing={1} justifyContent="center" alignItems="center">
              <Avatar alt={username} src={client} sx={{ width: 100, height: 100 }} />
            </Stack>
            <h1 style={{fontWeight: 'bold', color: '#feda6a', marginTop: '15px'}}>{username}</h1>
            <span style={{ fontSize: '28px', color: '#f5a623', marginTop: '10px' }}>
              {renderStars(calculateAverageRating())}
            </span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#feda6a', marginTop: '10px' }}>
              {calculateAverageRating()} ({reviews.length} reviews)
            </span>
          </div> 
        </div>
        <div className={styles.cover1}>
          {reviews.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#393f4d',
              borderRadius: '12px',
              color: '#d4d4dc',
              width: '100%'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#feda6a', fontSize: '24px' }}>No Reviews Yet</h3>
              <p style={{ opacity: 0.8, fontSize: '18px' }}>
                You haven't received any reviews from buyers yet.
              </p>
            </div>
          ) : (
            reviews.map((review, index) => (
              <div className={styles.card} key={review.id || index}>
                <Stack direction="column" spacing={1} justifyContent="center" alignItems="center">
                  <Avatar 
                    alt={`Buyer ${review.buyerId}`} 
                    src={getRandomAvatar(review.buyerId)} 
                    sx={{ width: 60, height: 60 }} 
                  />
                </Stack>
                <h1 style={{fontWeight: 'bold', color: '#feda6a', marginTop: '10px', fontSize: '18px'}}>
                  Buyer #{review.buyerId}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
                  <span style={{ fontSize: '20px', color: '#f5a623' }}>
                    {renderStars(review.rating)}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#feda6a' }}>
                    {review.rating.toFixed(1)}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  color: '#d4d4dc', 
                  opacity: 0.7, 
                  marginBottom: '10px' 
                }}>
                  Auction #{review.auctionId} • {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className={styles.insideCard}>
                  <p style={{ lineHeight: '1.6', color: '#d4d4dc' }}>
                    {review.review || "No comment provided."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
      </section>
    </>
  );
}
