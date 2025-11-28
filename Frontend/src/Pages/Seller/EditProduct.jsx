import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SellerNavbar from '../../Components/SellerNavbar'
import { IoMdArrowBack } from "react-icons/io";
import { getAuthToken, getUserData } from '../../Utils/auth';
import { PRODUCT_SERVICE_URL, SERVER_URL } from '../../Utils/config';
import axios from 'axios';

const EditProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  const productId = location.state?.productId;

  const [formData, setFormData] = useState({
    product_model: '',
    model_year: '',
    auction_date: '',
    auction_time: '',
    auction_duration: '',
    starting_price: '',
    reserve_price: '',
    price_jump: '',
    description: '',
    category: 'Luxury',
    status: 'pending'
  });

  const categories = [
    'Antique',
    'Classic', 
    'Luxury',
    'Sports',
    'Vintage'
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'terminated', label: 'Terminated' }
  ];

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    } else {
      setLoading(false);
      setError('No product ID provided');
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      // const response = await axios.get(`${SERVER_URL}/product/${productId}`, {
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/product/${productId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;
      console.log('Fetched product details for editing:', data);
      
      if (data) {
        setProduct(data);
        setFormData({
          product_model: data.productModel || data.product_model || '',
          model_year: data.modelYear || data.model_year || '',
          auction_date: data.auctionDate || data.auction_date || '',
          auction_time: data.auctionStartTime || data.auction_time || '',
          auction_duration: data.auctionDuration || data.auction_duration || '',
          starting_price: data.startPrice || data.starting_price || '',
          reserve_price: data.reservePrice || data.reserve_price || '',
          price_jump: data.priceJump || data.price_jump || '100',
          description: data.description || '',
          category: data.category || 'Luxury',
          status: data.status || 'pending'
        });
      } else {
        setError('Failed to fetch product details');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Error fetching product details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.product_model.trim()) {
      alert('Product model is required');
      return;
    }

    if (!formData.description.trim()) {
      alert('Description is required');
      return;
    }

    if (!formData.starting_price || parseFloat(formData.starting_price) <= 0) {
      alert('Starting price must be greater than 0');
      return;
    }

    if (!formData.price_jump || parseFloat(formData.price_jump) <= 0) {
      alert('Price jump must be greater than 0');
      return;
    }

    try {
      setSaving(true);
      const token = getAuthToken();
      
      const formDataToSend = new FormData();
      
      const userData = getUserData();
      const sellerId = userData?.userId || userData?.sellerId || userData?.id;
      
      if (!sellerId) {
        alert('Unable to identify seller. Please log in again.');
        return;
      }
      
      const productRequest = {
        productModel: formData.product_model.trim(),
        modelYear: formData.model_year ? parseInt(formData.model_year) : null,
        auctionDate: formData.auction_date || null,
        auctionStartTime: formData.auction_time || null,
        auctionDuration: formData.auction_duration ? parseInt(formData.auction_duration) : null,
        startPrice: parseFloat(formData.starting_price),
        reservePrice: formData.reserve_price ? parseFloat(formData.reserve_price) : null,
        priceJump: parseFloat(formData.price_jump),
        sellerId: parseInt(sellerId),
        description: formData.description.trim(),
        category: formData.category,
        status: formData.status
      };

      console.log('Updating product with data:', productRequest);

      formDataToSend.append('productRequest', new Blob([JSON.stringify(productRequest)], {
        type: 'application/json'
      }));

      // const response = await axios.put(`${SERVER_URL}/products/update/${productId}`, formDataToSend, {
      const response = await axios.put(`${PRODUCT_SERVICE_URL}/products/update/${productId}`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status !== 200) {
        throw new Error(response.data?.message || `HTTP error! status: ${response.status}`);
      }

      const result = response.data;
      console.log('Product updated successfully:', result);

      if (result.success || result.productId || result.id) {
        alert('Product updated successfully!');
        navigate('/seller/product-details', { state: { productId } });
      } else {
        alert('Product updated successfully!');
        navigate('/seller/product-details', { state: { productId } });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      
      let errorMessage = 'Error updating product';
      if (error.response?.data) {
        if (error.response.data.fieldErrors) {
          const fieldErrors = error.response.data.fieldErrors;
          const errorMessages = Object.entries(fieldErrors).map(([field, message]) => `${field}: ${message}`);
          errorMessage = `Validation errors:\n${errorMessages.join('\n')}`;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (productId) {
      navigate('/seller/product-details', { state: { productId } });
    } else {
      navigate('/seller');
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#feda6a' }}>
        <SellerNavbar />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px'
        }}>
          Loading product details...
        </div>
      </div>
    );
  }

  if (error || !productId) {
    return (
      <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#feda6a' }}>
        <SellerNavbar />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          gap: '20px'
        }}>
          <div>{error || 'Product not found or invalid product ID'}</div>
          <button 
            onClick={() => navigate('/seller')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#feda6a',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#feda6a' }}>
      <SellerNavbar />

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px 15px'
      }}>
        
        <div style={{
          backgroundColor: '#1d1e22',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px',
            marginBottom: '10px'
          }}>
            <IoMdArrowBack 
              onClick={handleCancel} 
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
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                Edit Product
              </h1>
              <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>
                Update your product details
              </div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1d1e22',
          borderRadius: '12px',
          padding: '30px'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '20px' }}>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontWeight: 'bold', 
                  marginBottom: '8px', 
                  color: '#feda6a' 
                }}>
                  Product Model *
                </label>
                <input 
                  type="text" 
                  name="product_model"
                  value={formData.product_model}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #393f4d',
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: '#393f4d',
                    color: '#feda6a',
                    outline: 'none'
                  }}
                  placeholder="Enter product model"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 'bold', 
                    marginBottom: '8px', 
                    color: '#feda6a' 
                  }}>
                    Model Year
                  </label>
                  <input 
                    type="number" 
                    name="model_year"
                    value={formData.model_year}
                    onChange={handleInputChange}
                    min="1900"
                    max="2030"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #393f4d',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: '#393f4d',
                      color: '#feda6a',
                      outline: 'none'
                    }}
                    placeholder="2024"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 'bold', 
                    marginBottom: '8px', 
                    color: '#feda6a' 
                  }}>
                    Category
                  </label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #393f4d',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: '#393f4d',
                      color: '#feda6a',
                      outline: 'none'
                    }}
                  >
                    {categories.map(category => (
                      <option key={category} value={category} style={{ backgroundColor: '#393f4d' }}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 'bold', 
                    marginBottom: '8px', 
                    color: '#feda6a' 
                  }}>
                    Starting Price *
                  </label>
                  <input 
                    type="number" 
                    name="starting_price"
                    value={formData.starting_price}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #393f4d',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: '#393f4d',
                      color: '#feda6a',
                      outline: 'none'
                    }}
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 'bold', 
                    marginBottom: '8px', 
                    color: '#feda6a' 
                  }}>
                    Reserve Price
                  </label>
                  <input 
                    type="number" 
                    name="reserve_price"
                    value={formData.reserve_price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #393f4d',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: '#393f4d',
                      color: '#feda6a',
                      outline: 'none'
                    }}
                    placeholder="15000 (optional)"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 'bold', 
                    marginBottom: '8px', 
                    color: '#feda6a' 
                  }}>
                    Price Jump *
                  </label>
                  <input 
                    type="number" 
                    name="price_jump"
                    value={formData.price_jump}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #393f4d',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: '#393f4d',
                      color: '#feda6a',
                      outline: 'none'
                    }}
                    placeholder="100"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 'bold', 
                    marginBottom: '8px', 
                    color: '#feda6a' 
                  }}>
                    Auction Date
                  </label>
                  <input 
                    type="date" 
                    name="auction_date"
                    value={formData.auction_date}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #393f4d',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: '#393f4d',
                      color: '#feda6a',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 'bold', 
                    marginBottom: '8px', 
                    color: '#feda6a' 
                  }}>
                    Auction Time
                  </label>
                  <input 
                    type="time" 
                    name="auction_time"
                    value={formData.auction_time}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #393f4d',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: '#393f4d',
                      color: '#feda6a',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 'bold', 
                    marginBottom: '8px', 
                    color: '#feda6a' 
                  }}>
                    Duration (hours)
                  </label>
                  <input 
                    type="number" 
                    name="auction_duration"
                    value={formData.auction_duration}
                    onChange={handleInputChange}
                    min="1"
                    max="168"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #393f4d',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: '#393f4d',
                      color: '#feda6a',
                      outline: 'none'
                    }}
                    placeholder="24"
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontWeight: 'bold', 
                  marginBottom: '8px', 
                  color: '#feda6a' 
                }}>
                  Status
                </label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #393f4d',
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: '#393f4d',
                    color: '#feda6a',
                    outline: 'none'
                  }}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value} style={{ backgroundColor: '#393f4d' }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontWeight: 'bold', 
                  marginBottom: '8px', 
                  color: '#feda6a' 
                }}>
                  Description *
                </label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #393f4d',
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: '#393f4d',
                    color: '#feda6a',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                  placeholder="Provide detailed description of your product..."
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button 
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '15px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    backgroundColor: saving ? '#666' : '#feda6a',
                    color: '#000000',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                
                <button 
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '15px',
                    border: '1px solid #393f4d',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    backgroundColor: 'transparent',
                    color: '#feda6a',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
