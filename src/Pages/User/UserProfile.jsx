import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { getUserData, getAuthHeaders, getAuthToken, getUserRole } from '../../Utils/auth';
import { SERVER_URL, USER_SERVICE_URL } from '../../Utils/config';
import axios from 'axios';

const InfoItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[#feda6a] font-medium">{label}</span>
    <span className="text-[#d4d4dc]">{value || 'Not provided'}</span>
  </div>
);

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    username: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const userData = getUserData();
      
      if (!userData || !userData.id) {
        setError('User not authenticated');
        return;
      }

      // const response = await axios.get(`${SERVER_URL}/users/profile/${userData.userId}`, {
      const response = await axios.get(`${USER_SERVICE_URL}/profile/${userData.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status !== 200) {
        throw new Error('Failed to fetch user profile');
      }

      console.log(response.data);
      const data = response.data;
      setUserProfile(data);
      setEditForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        contact: data.contact || '',
        username: data.username || ''
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setError(null);
    setSuccessMessage('');
    fetchUserProfile();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getProfileImage = () => {
    return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkY36XkesV2esKBb7ds9iQinTHYG9R8pOGqQ&s";
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({
        firstName: userProfile?.firstName || '',
        lastName: userProfile?.lastName || '',
        email: userProfile?.email || '',
        contact: userProfile?.contact || '',
        username: userProfile?.username || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editForm.username || !editForm.email || !editForm.firstName || !editForm.lastName) {
      setError('Username, email, first name and last name are required');
      return;
    }

    if (editForm.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setUpdateLoading(true);
      setError(null);
      const userData = getUserData();
      const token = getAuthToken();
      
      if (!userData || !userData.userId) {
        setError('User not authenticated');
        return;
      }

      // const response = await axios.put(`${SERVER_URL}/users/profile/${userData.userId}`, {
      const response = await axios.put(`${USER_SERVICE_URL}/profile/${userData.userId}`, {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        contact: editForm.contact.trim()
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        const updatedData = response.data;
        
        setUserProfile(prevProfile => ({
          ...prevProfile,
          ...updatedData,
          firstName: updatedData.firstName || prevProfile?.firstName || '',
          lastName: updatedData.lastName || prevProfile?.lastName || '',
          email: updatedData.email || prevProfile?.email || '',
          contact: updatedData.contact || prevProfile?.contact || '',
          username: updatedData.username || prevProfile?.username || '',
          userId: updatedData.userId || prevProfile?.userId
        }));
        
        setEditForm({
          firstName: updatedData.firstName || '',
          lastName: updatedData.lastName || '',
          email: updatedData.email || '',
          contact: updatedData.contact || '',
          username: updatedData.username || ''
        });
        
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setError(null);
        
        setTimeout(() => {
          fetchUserProfile();
        }, 500);
      } else {
        setError('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1d1e22] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#feda6a] mx-auto mb-4"></div>
          <div className="text-[#feda6a] text-xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="min-h-screen bg-[#1d1e22] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-[#feda6a] text-[#1d1e22] rounded-lg hover:bg-[#feda6a]/90 transition-colors duration-200 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1d1e22]">
      <div className="p-6 bg-[#393f4d] shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 rounded-full hover:bg-[#1d1e22] transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-6 w-6 text-[#feda6a]" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#d4d4dc]">Profile Page</h1>
                <p className="text-[#d4d4dc]/80">View All Your Profile Details Here</p>
              </div>
            </div>
            <button 
              onClick={handleEditToggle}
              className="px-4 py-2 bg-[#feda6a] text-[#1d1e22] rounded-lg hover:bg-[#feda6a]/90 transition-colors duration-200 font-semibold"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 mt-16">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-600 text-white rounded-lg">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-600 text-white rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          <div className="bg-[#393f4d] p-6 rounded-xl shadow-lg">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-[#feda6a]/20 flex items-center justify-center mb-4">
                <img 
                  src={getProfileImage()} 
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#feda6a]"
                />
              </div>
              <h2 className="text-xl font-bold text-[#d4d4dc]">
                {userProfile.firstName} {userProfile.lastName}
              </h2>
              <p className="text-[#feda6a] font-medium mt-1">
                {getUserRole()}
              </p>
              <p className="text-[#d4d4dc]/70 text-sm mt-1">
                @{userProfile.username}
              </p>
            </div>
          </div>

          <div className="bg-[#393f4d] p-6 rounded-xl shadow-lg">
            <div className="border-b border-[#d4d4dc]/20 pb-4 mb-6">
              <h2 className="text-xl font-bold text-[#d4d4dc]">
                {isEditing ? 'Edit Profile' : 'Bio & Other Details'}
              </h2>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="text-[#feda6a] font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleInputChange}
                        className="bg-[#1d1e22] text-[#d4d4dc] p-3 rounded-lg border border-[#d4d4dc]/20 focus:border-[#feda6a] focus:outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[#feda6a] font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={handleInputChange}
                        className="bg-[#1d1e22] text-[#d4d4dc] p-3 rounded-lg border border-[#d4d4dc]/20 focus:border-[#feda6a] focus:outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[#feda6a] font-medium mb-2">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={editForm.username}
                        onChange={handleInputChange}
                        className="bg-[#1d1e22] text-[#d4d4dc] p-3 rounded-lg border border-[#d4d4dc]/20 focus:border-[#feda6a] focus:outline-none"
                        required
                        minLength={3}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="text-[#feda6a] font-medium mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        className="bg-[#1d1e22] text-[#d4d4dc] p-3 rounded-lg border border-[#d4d4dc]/20 focus:border-[#feda6a] focus:outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[#feda6a] font-medium mb-2">Contact</label>
                      <input
                        type="tel"
                        name="contact"
                        value={editForm.contact}
                        onChange={handleInputChange}
                        className="bg-[#1d1e22] text-[#d4d4dc] p-3 rounded-lg border border-[#d4d4dc]/20 focus:border-[#feda6a] focus:outline-none"
                        placeholder="1234567890"
                      />
                    </div>
                    <InfoItem label="Role" value={getUserRole()} />
                    <InfoItem label="User ID" value={userProfile?.userId} />
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-6 py-2 bg-[#feda6a] text-[#1d1e22] rounded-lg hover:bg-[#feda6a]/90 transition-colors duration-200 font-semibold disabled:opacity-50"
                  >
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InfoItem label="First Name" value={userProfile?.firstName} />
                  <InfoItem label="Last Name" value={userProfile?.lastName} />
                  <InfoItem label="Username" value={userProfile?.username} />
                  <InfoItem label="Email" value={userProfile?.email} />
                </div>
                <div className="space-y-4">
                  <InfoItem label="Contact" value={userProfile?.contact} />
                  <InfoItem label="Role" value={getUserRole()} />
                  <InfoItem label="User ID" value={userProfile?.userId} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;