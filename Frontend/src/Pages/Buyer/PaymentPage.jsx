import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BuyerNavbar from '../../Components/BuyerNavbar';
import { IoMdArrowBack } from "react-icons/io";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SecurityIcon from '@mui/icons-material/Security';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getAuthToken, getUserData } from '../../Utils/auth';
import { PAYMENT_SERVICE_URL, SERVER_URL } from '../../Utils/config';
import axios from 'axios';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auctionDetails = location.state?.auctionDetails || {};
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    email: '',
    billingAddress: ''
  });

  useEffect(() => {
    console.log('Auction Details:', auctionDetails);
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    if (processing) return;

    if (selectedPaymentMethod === 'card') {
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName) {
        alert('Please fill in all card details');
        return;
      }
    }
    
    if (!formData.email || !formData.billingAddress) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setProcessing(true);
      const token = getAuthToken();
      const userData = getUserData();
      const buyerId = userData.userId;
      const sellerId = auctionDetails.sellerId;
      const productId = auctionDetails.productId;
      const auctionId = auctionDetails.auctionId;
      const finalAmount = auctionDetails.total;
      const paymentMethod = selectedPaymentMethod;
      const transactionStatus = 'SUCCESFUL';
      const transactionId = 'TXN-' + Date.now();
      const paymentTime = new Date();
      const pad = (n) => n < 10 ? '0' + n : n;
      const paymentTimeStr = `${paymentTime.getFullYear()}-${pad(paymentTime.getMonth()+1)}-${pad(paymentTime.getDate())} ${pad(paymentTime.getHours())}:${pad(paymentTime.getMinutes())}:${pad(paymentTime.getSeconds())}`;

      const paymentData = {
        buyerId,
        sellerId,
        transactionId,
        productId,
        auctionId,
        finalAmount,
        paymentMethod,
        transactionStatus,
        paymentTime: paymentTimeStr,
      };

      console.log('Payment Data:', paymentData);

      // const response = await axios.post(`${SERVER_URL}/payments/create-payment`, paymentData, {
      const response = await axios.post(`${PAYMENT_SERVICE_URL}/create-payment`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = response.data;
      if (response.status !== 201) {
        throw new Error(result.message || 'Payment failed');
      }
      if (result && result.id) {
        alert(`Payment successful! Transaction ID: ${result.transactionId}`);
        navigate('/buyer/product-details', {
          state: {
            productId: auctionDetails.productId,
            paymentCompleted: true,
            confirmationNumber: result.transactionId
          }
        });
      } else {
        alert(result.message || 'Payment failed');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const cardStyle = {
    backgroundColor: '#1d1e22',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '20px',
    border: '1px solid #393f4d',
  };

  const backStyle = {
    fontSize: '40px',
    cursor: 'pointer',
    padding: '8px',
    backgroundColor: '#393f4d',
    borderRadius: '50%',
    color: '#feda6a'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #393f4d',
    fontSize: '16px',
    backgroundColor: '#393f4d',
    color: '#d4d4dc',
    marginBottom: '15px',
    transition: 'all 0.3s ease',
  };

  const buttonStyle = {
    width: '100%',
    padding: '15px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#000000',
    backgroundColor: '#feda6a',
  };

  const paymentMethodStyle = {
    border: '1px solid #393f4d',
    borderRadius: '8px',
    padding: '15px',
    margin: '10px 0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: '#393f4d',
  };

  const selectedPaymentMethodStyle = {
    ...paymentMethodStyle,
    border: '2px solid #feda6a',
    backgroundColor: '#1d1e22',
  };

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#feda6a' }}>
      <style>
        {`
          .payment-input:focus {
            outline: none;
            border-color: #feda6a !important;
          }
          
          .payment-input::placeholder {
            color: #d4d4dc;
            opacity: 0.7;
          }
        `}
      </style>
      
      <BuyerNavbar />
      
      <div style={{ 
        maxWidth: '100%', 
        margin: '0 auto', 
        padding: '20px 15px', 
        display: 'grid', 
        gridTemplateColumns: '1fr 380px', 
        gap: '25px' 
      }}>
        
        <div>
          <div style={cardStyle}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              marginBottom: '25px',
              paddingBottom: '15px',
              borderBottom: '1px solid #393f4d'
            }}>
              <IoMdArrowBack 
                onClick={() => window.history.back()} 
                style={backStyle}
              />
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                Complete Payment
              </h1>
            </div>

            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '20px', 
              color: '#feda6a',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <PaymentIcon style={{ color: '#feda6a' }} />
              Payment Method
            </h2>
            
            <div
              style={selectedPaymentMethod === 'card' ? selectedPaymentMethodStyle : paymentMethodStyle}
              onClick={() => setSelectedPaymentMethod('card')}
            >
              <CreditCardIcon style={{ color: '#feda6a', fontSize: '24px' }} />
              <div>
                <h3 style={{ margin: 0, color: '#d4d4dc', fontSize: '16px' }}>Credit/Debit Card</h3>
                <p style={{ margin: 0, color: '#d4d4dc', fontSize: '12px', opacity: 0.7 }}>Visa, MasterCard, American Express</p>
              </div>
            </div>

            <div
              style={selectedPaymentMethod === 'bank' ? selectedPaymentMethodStyle : paymentMethodStyle}
              onClick={() => setSelectedPaymentMethod('bank')}
            >
              <AccountBalanceIcon style={{ color: '#feda6a', fontSize: '24px' }} />
              <div>
                <h3 style={{ margin: 0, color: '#d4d4dc', fontSize: '16px' }}>Bank Transfer</h3>
                <p style={{ margin: 0, color: '#d4d4dc', fontSize: '12px', opacity: 0.7 }}>Direct bank transfer</p>
              </div>
            </div>

            {selectedPaymentMethod === 'card' && (
              <div style={{ marginTop: '25px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  marginBottom: '15px', 
                  color: '#feda6a'
                }}>
                  Card Details
                </h3>
                
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Card Number"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  style={inputStyle}
                  className="payment-input"
                  maxLength="19"
                />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    style={inputStyle}
                    className="payment-input"
                    maxLength="5"
                  />
                  <input
                    type="text"
                    name="cvv"
                    placeholder="CVV"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    style={inputStyle}
                    className="payment-input"
                    maxLength="4"
                  />
                </div>
                
                <input
                  type="text"
                  name="cardName"
                  placeholder="Name on Card"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  style={inputStyle}
                  className="payment-input"
                />
              </div>
            )}

            <div style={{ marginTop: '25px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                color: '#feda6a'
              }}>
                Billing Information
              </h3>
              
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                style={inputStyle}
                className="payment-input"
              />
              
              <input
                type="text"
                name="billingAddress"
                placeholder="Billing Address"
                value={formData.billingAddress}
                onChange={handleInputChange}
                style={inputStyle}
                className="payment-input"
              />
            </div>
          </div>
        </div>

        <div style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
          <div style={cardStyle}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '20px', 
              color: '#feda6a'
            }}>
              Order Summary
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#feda6a', fontSize: '16px' }}>
                {auctionDetails.productTitle || auctionDetails.title}
              </h4>
              <p style={{ margin: 0, color: '#d4d4dc', fontSize: '14px', opacity: 0.8 }}>
                Seller: {auctionDetails.seller || 'Classic Cars Europe'}
              </p>
            </div>
            
            <div style={{ borderTop: '1px solid #393f4d', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#d4d4dc' }}>
                <span>Winning Bid:</span>
                <span style={{ fontWeight: 'bold' }}>${auctionDetails.winningBid}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#d4d4dc' }}>
                <span>Auction Fee (5%):</span>
                <span>₹{auctionDetails.auctionFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#d4d4dc' }}>
                <span>Shipping:</span>
                <span>₹{auctionDetails.shippingFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#d4d4dc' }}>
                <span>Insurance:</span>
                <span>₹{auctionDetails.insuranceFee}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                borderTop: '2px solid #feda6a',
                paddingTop: '15px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#feda6a'
              }}>
                <span>Total:</span>
                <span>₹{auctionDetails.total}</span>
              </div>
            </div>
          </div>

          <div style={{
            ...cardStyle,
            border: '2px solid #feda6a',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <SecurityIcon style={{ color: '#feda6a', fontSize: '24px' }} />
              <h3 style={{ margin: 0, color: '#feda6a', fontSize: '16px' }}>Secure Payment</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <LockIcon style={{ color: '#feda6a', fontSize: '16px' }} />
              <span style={{ fontSize: '13px', color: '#d4d4dc' }}>SSL encryption</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircleIcon style={{ color: '#feda6a', fontSize: '16px' }} />
              <span style={{ fontSize: '13px', color: '#d4d4dc' }}>PCI compliant</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircleIcon style={{ color: '#feda6a', fontSize: '16px' }} />
              <span style={{ fontSize: '13px', color: '#d4d4dc' }}>Buyer protection</span>
            </div>
          </div>

          <button 
            style={{
              ...buttonStyle,
              opacity: processing ? 0.7 : 1,
              cursor: processing ? 'not-allowed' : 'pointer'
            }}
            onClick={handlePayment}
            disabled={processing}
          >
            <PaymentIcon />
            {processing ? 'Processing...' : `Pay $${auctionDetails.total}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
