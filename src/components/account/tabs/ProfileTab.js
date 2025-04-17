import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSave } from 'react-icons/fa';
import { supabase } from '../../../lib/supabaseClient';

export default function ProfileTab({ user, updateProfile }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    display_name: user?.display_name || '',
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    bio: user?.bio || '',
  });
  const [profileImage, setProfileImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let profile_image_url = user?.profile_image_url;

      // Upload profile image if changed
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${user.auth_id || Date.now()}/profile.${fileExt}`;
        const filePath = `profile-images/${fileName}`;
        
        console.log('Uploading profile image to:', filePath);
        
        const { error: uploadError } = await supabase.storage
          .from('user-content')
          .upload(filePath, profileImage, {
            upsert: true
          });
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data } = supabase.storage
          .from('user-content')
          .getPublicUrl(filePath);
          
        profile_image_url = data.publicUrl;
        console.log('New profile image URL:', profile_image_url);
      }

      // Create a clean update object with only the fields we want to update
      const updates = {
        display_name: profileData.display_name.trim(),
        full_name: profileData.full_name.trim(),
        phone_number: profileData.phone_number.trim(),
        bio: profileData.bio.trim(),
        profile_image_url,
        updated_at: new Date().toISOString()
      };

      console.log('Sending profile update:', updates);
      
      // Try direct API fetch first for better debugging
      try {
        const response = await fetch('/api/users/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_id: user.auth_id,
            ...updates
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Profile updated successfully via API:', data);
          
          // Force UI refresh with reload 
          setSuccess(true);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          return;
        } else {
          const errorData = await response.json();
          console.error('API update failed:', errorData);
          throw new Error(errorData.error || 'Failed to update profile via API');
        }
      } catch (apiError) {
        console.error('Error with API update:', apiError);
        // Fall back to the normal update function
      }
      
      // Fall back to updateProfile from props
      const result = await updateProfile(updates);
      console.log('Profile update result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.reload(); // Force refresh to show updated data
      }, 1000);
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">My Profile</h2>
        {!editing && (
          <button 
            onClick={() => setEditing(true)} 
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 bg-opacity-30 border border-green-800 text-green-300 px-4 py-3 rounded-lg mb-4">
          Profile updated successfully!
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Profile Image
            </label>
            <div className="flex items-center">
              <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mr-4 overflow-hidden">
                {profileImage ? (
                  <img 
                    src={URL.createObjectURL(profileImage)} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : user?.profile_image_url ? (
                  <img 
                    src={user.profile_image_url} 
                    alt={user.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-gray-500 text-3xl" />
                )}
              </div>
              <label className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition">
                Choose File
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="display_name"
                value={profileData.display_name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Display Name"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={profileData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={profileData.phone_number}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Phone Number"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Tell us about yourself"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2 flex items-center">
                <FaUser className="mr-2 text-indigo-400" />
                Display Name
              </h3>
              <p className="text-white">{user?.display_name || 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2 flex items-center">
                <FaUser className="mr-2 text-indigo-400" />
                Full Name
              </h3>
              <p className="text-white">{user?.full_name || 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2 flex items-center">
                <FaEnvelope className="mr-2 text-indigo-400" />
                Email
              </h3>
              <p className="text-white">{user?.email || 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2 flex items-center">
                <FaPhone className="mr-2 text-indigo-400" />
                Phone Number
              </h3>
              <p className="text-white">{user?.phone_number || 'Not set'}</p>
            </div>
          </div>

          {user?.bio && (
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Bio</h3>
              <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                <p className="text-white">{user.bio}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
