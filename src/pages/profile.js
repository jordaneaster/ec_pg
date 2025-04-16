import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaGlobe, FaCamera, FaSave, FaSignOutAlt, FaTimes, FaSpinner } from 'react-icons/fa';

export default function ProfilePage() {
  const { user, signOut, updateProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState('/default-avatar.png'); // Default avatar
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    website: '',
    bio: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Populate form with user data if available
    setFormData(prevData => ({
      ...prevData,
      email: user.email || '',
      fullName: user.user_metadata?.full_name || '',
      phone: user.user_metadata?.phone || '',
      address: user.user_metadata?.address || '',
      company: user.user_metadata?.company || '',
      website: user.user_metadata?.website || '',
      bio: user.user_metadata?.bio || '',
    }));
    
    // Set avatar if available
    if (user.user_metadata?.avatar_url) {
      setAvatar(user.user_metadata.avatar_url);
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // For demo purposes, we'll just use a fake URL
    // In a real app, you would upload this to storage
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatar(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // In a real app, you would update the user profile in your database
      await updateProfile({
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        company: formData.company,
        website: formData.website,
        bio: formData.bio,
        avatar_url: avatar
      });
      
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700/50">
          {/* Header section */}
          <div className="relative bg-indigo-800 h-48 sm:h-64">
            <div className="absolute top-0 right-0 m-4">
              <button
                onClick={handleLogout}
                className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
          
          {/* Avatar */}
          <div className="relative -mt-20 sm:-mt-24 px-6">
            <div className="relative">
              <img 
                src={avatar} 
                alt="Profile" 
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-gray-800 bg-gray-700 object-cover"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 cursor-pointer p-2 rounded-full">
                  <FaCamera className="text-white" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                  />
                </label>
              )}
            </div>
          </div>
          
          {/* User info form */}
          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {formData.fullName || user?.email || 'Your Profile'}
              </h1>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                >
                  <FaTimes size={14} />
                  <span>Cancel</span>
                </button>
              )}
            </div>
            
            {message && (
              <div className="mb-6 text-sm text-green-400 bg-green-900/30 p-3 rounded-lg border border-green-700">
                {message}
              </div>
            )}
            
            {error && (
              <div className="mb-6 text-sm text-red-400 bg-red-900/30 p-3 rounded-lg border border-red-700">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${
                        !isEditing ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={true} // Email can't be changed
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/70 border border-gray-600 rounded-lg opacity-70 cursor-not-allowed"
                      placeholder="Your email"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                </div>
                
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${
                        !isEditing ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-300">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${
                        !isEditing ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      placeholder="Your address"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-300">
                    Company
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBuilding className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${
                        !isEditing ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      placeholder="Your company"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-300">
                    Website
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaGlobe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${
                        !isEditing ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      placeholder="Your website URL"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-300">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="4"
                  className={`w-full px-4 py-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${
                    !isEditing ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  placeholder="Tell us about yourself"
                ></textarea>
              </div>
              
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-all duration-200 shadow-lg flex items-center space-x-2
                             ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-indigo-600/30'}`}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
