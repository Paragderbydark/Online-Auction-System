import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerNavbar from '../../Components/SellerNavbar';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import styles from '../../Styles/AddProduct.module.css';
import { PRODUCT_SERVICE_URL, SERVER_URL } from '../../Utils/config';
import { getUserData } from '../../Utils/auth';
import axios from 'axios';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productModel: '',
    modelYear: null,
    auctionDate: '',
    auctionStartTime: '',
    auctionDuration: '',
    startPrice: '',
    priceJump: '',
    description: '',
    category: 'Antique',
    mainImage: null,
    additionalImages: null
  });
  
  const [uploadMessage, setUploadMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'Antique',
    'Classic',
    'Sports',
    'Vintage',
    'Luxury',
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productModel.trim()) {
      newErrors.productModel = 'Product model is required';
    }

    if (!formData.modelYear) {
      newErrors.modelYear = 'Model year is required';
    } else if (formData.modelYear > new Date().getFullYear()) {
      newErrors.modelYear = 'Model year cannot be in the future';
    }

    if (!formData.auctionDate) {
      newErrors.auctionDate = 'Auction date is required';
    } else {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 3);
      if (new Date(formData.auctionDate) < minDate) {
        newErrors.auctionDate = 'Auction date must be at least 3 days from today';
      }
    }

    if (!formData.auctionStartTime) {
      newErrors.auctionStartTime = 'Auction time is required';
    }

    if (!formData.auctionDuration) {
      newErrors.auctionDuration = 'Auction duration is required';
    } else if (isNaN(formData.auctionDuration) || Number(formData.auctionDuration) < 1) {
      newErrors.auctionDuration = 'Duration must be a number greater than 0';
    }

    if (!formData.startPrice) {
      newErrors.startPrice = 'Starting price is required';
    } else if (isNaN(formData.startPrice) || Number(formData.startPrice) < 1) {
      newErrors.startPrice = 'Starting price must be a number greater than 0';
    }

    if (!formData.priceJump) {
      newErrors.priceJump = 'Price jump is required';
    } else if (isNaN(formData.priceJump) || Number(formData.priceJump) < 1) {
      newErrors.priceJump = 'Price jump must be a number greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.mainImage) {
      newErrors.mainImage = 'At least one main image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    if (e && e.target) {
      const { name, value, files } = e.target;
      
      if (name === 'mainImage') {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
        if (files && files.length > 0) {
          setUploadMessage(`Main image selected: ${files[0].name}`);
        }
      } else if (name === 'additionalImages') {
        setFormData(prev => ({ ...prev, [name]: files }));
        if (files && files.length > 0) {
          setUploadMessage(`${files.length} additional image(s) selected`);
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      const yearOnly = e.getFullYear();
      setFormData(prev => ({ ...prev, modelYear: yearOnly }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      const userData = getUserData();
      if (!userData || !userData.userId) {
        alert('Unable to get seller information. Please login again.');
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();
      
      const productRequest = {
        sellerId: userData.userId,
        productModel: formData.productModel,
        modelYear: parseInt(formData.modelYear),
        startPrice: parseInt(formData.startPrice),
        priceJump: parseInt(formData.priceJump),
        description: formData.description,
        auctionDate: formData.auctionDate,
        auctionStartTime: formData.auctionStartTime,
        auctionDuration: parseInt(formData.auctionDuration),
        category: formData.category
      };

      formDataToSend.append('productRequest', new Blob([JSON.stringify(productRequest)], {
        type: 'application/json'
      }));

      if (formData.mainImage) {
        formDataToSend.append('mainImage', formData.mainImage);
      }

      if (formData.additionalImages) {
        for (let i = 0; i < formData.additionalImages.length; i++) {
          formDataToSend.append('additionalImages', formData.additionalImages[i]);
        }
      }

      // const response = await axios.post(`${SERVER_URL}/products/add-product`, formDataToSend, {
      const response = await axios.post(`${PRODUCT_SERVICE_URL}/products/add-product`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      alert('Product added successfully!');
      navigate('/seller');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SellerNavbar />
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Add New Product</h1>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label htmlFor="productModel">Product Model *</label>
                <input
                  type="text"
                  id="productModel"
                  name="productModel"
                  value={formData.productModel}
                  onChange={handleChange}
                  placeholder="Enter product model"
                  className={errors.productModel ? styles.error : ''}
                />
                {errors.productModel && <span className={styles.errorText}>{errors.productModel}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="modelYear">Model Year *</label>
                <DatePicker
                  selected={formData.modelYear ? new Date(formData.modelYear, 0) : null}
                  onChange={handleChange}
                  showYearPicker
                  dateFormat="yyyy"
                  placeholderText="Select year"
                  className={`${styles.yearPicker} ${errors.modelYear ? styles.error : ''}`}
                />
                {errors.modelYear && <span className={styles.errorText}>{errors.modelYear}</span>}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label htmlFor="auctionDate">Auction Date *</label>
                <input
                  type="date"
                  id="auctionDate"
                  name="auctionDate"
                  value={formData.auctionDate}
                  onChange={handleChange}
                  className={errors.auctionDate ? styles.error : ''}
                />
                {errors.auctionDate && <span className={styles.errorText}>{errors.auctionDate}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="auctionStartTime">Auction Time *</label>
                <input
                  type="time"
                  id="auctionStartTime"
                  name="auctionStartTime"
                  value={formData.auctionStartTime}
                  onChange={handleChange}
                  className={errors.auctionStartTime ? styles.error : ''}
                />
                {errors.auctionStartTime && <span className={styles.errorText}>{errors.auctionStartTime}</span>}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label htmlFor="auctionDuration">Auction Duration (hours) *</label>
                <input
                  type="number"
                  id="auctionDuration"
                  name="auctionDuration"
                  value={formData.auctionDuration}
                  onChange={handleChange}
                  placeholder="Enter duration in hours"
                  min="1"
                  className={errors.auctionDuration ? styles.error : ''}
                />
                {errors.auctionDuration && <span className={styles.errorText}>{errors.auctionDuration}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label htmlFor="startPrice">Starting Price ($) *</label>
                <input
                  type="number"
                  id="startPrice"
                  name="startPrice"
                  value={formData.startPrice}
                  onChange={handleChange}
                  placeholder="Enter starting price"
                  min="1"
                  step="0.01"
                  className={errors.startPrice ? styles.error : ''}
                />
                {errors.startPrice && <span className={styles.errorText}>{errors.startPrice}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="priceJump">Price Jump ($) *</label>
                <input
                  type="number"
                  id="priceJump"
                  name="priceJump"
                  value={formData.priceJump}
                  onChange={handleChange}
                  placeholder="Enter price jump amount"
                  min="1"
                  step="0.01"
                  className={errors.priceJump ? styles.error : ''}
                />
                {errors.priceJump && <span className={styles.errorText}>{errors.priceJump}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter detailed product description (minimum 50 characters)"
                rows="4"
                className={errors.description ? styles.error : ''}
              />
              <small className={styles.charCount}>
                {formData.description.length}/50 characters minimum
              </small>
              {errors.description && <span className={styles.errorText}>{errors.description}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="mainImage">Main Product Image *</label>
              <input
                type="file"
                id="mainImage"
                name="mainImage"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="mainImage" className={`${styles.customUpload} ${errors.mainImage ? styles.error : ''}`}>
                Upload Main Image
              </label>
              {uploadMessage && <span className={styles.uploadMessage}>{uploadMessage}</span>}
              {errors.mainImage && <span className={styles.errorText}>{errors.mainImage}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="additionalImages">Additional Images (Optional)</label>
              <input
                type="file"
                id="additionalImages"
                name="additionalImages"
                multiple
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="additionalImages" className={styles.customUpload}>
                Upload Additional Images
              </label>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate('/seller')}
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddProduct;