import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaUser, FaSignOutAlt, FaShoppingBag, FaTicketAlt, FaQrcode,
  FaSpinner, FaUserEdit, FaCog, FaBell, FaShieldAlt,
  FaEnvelope, FaCalendarAlt, FaPhone, FaHistory, FaEnvelopeOpen, FaArrowRight, FaMapMarkerAlt,
  FaThumbsUp, FaComment, FaShare, FaEdit, FaCamera, FaTimes, FaUpload, FaCheck
} from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../lib/supabaseClient';

import AccountContainer from '../../components/account/AccountContainer';
import SecurityTab from '../../components/account/tabs/SecurityTab';
import SettingsTab from '../../components/account/tabs/SettingsTab';
import NotificationsTab from '../../components/account/tabs/NotificationsTab';

const ProfilePictureModal = ({ isOpen, onClose, userData, username, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB');
      return;
    }
    
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploadProgress(1);
      await onUpload(selectedFile, setUploadProgress);
      onClose();
    } catch (error) {
      console.error('Error during upload:', error);
      alert('Failed to upload image. Please try again.');
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto bg-black/80 z-[9999] flex items-center justify-center p-4" 
         onClick={onClose} style={{backdropFilter: 'blur(5px)'}}>
      <div className="bg-gray-800 rounded-xl w-full max-w-md shadow-2xl border border-gray-700" 
           onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Update Profile Picture</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 hover:bg-gray-700 rounded-full"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Current</p>
                <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden relative">
                  {userData?.profile_image_url ? (
                    <Image
                      src={userData.profile_image_url}
                      alt="Current profile"
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-white flex items-center justify-center h-full">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-gray-500">
                <FaArrowRight className="w-5 h-5" />
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">New</p>
                <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden relative">
                  {previewUrl ? (
                    <img 
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <FaCamera className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary inline-flex items-center gap-2 mt-2"
              type="button"
            >
              <FaUpload className="w-4 h-4" />
              <span>{selectedFile ? 'Choose Different Image' : 'Select Image'}</span>
            </button>
            
            {selectedFile && (
              <p className="text-xs text-gray-500 mt-2">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
          
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadProgress > 0}
              className={`btn-primary ${(!selectedFile || uploadProgress > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="button"
            >
              {uploadProgress > 0 ? (
                <>Uploading... {uploadProgress}%</>
              ) : (
                <>Save New Picture</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UserAccountPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [isEditingPicture, setIsEditingPicture] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user && id) {
      if (user.id !== id) {
        router.push('/account');
        return;
      }
      fetchUserData();
      fetchUserOrders();
      fetchUserReservations();
      fetchUserPosts();
    }
  }, [user, authLoading, id, router]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserData(data);
        setLoading(false);
      } else {
        if (!user || !user.email || !user.id) {
          setLoading(false);
          return;
        }

        if (user.id !== id) {
          setLoading(false);
          return;
        }

        const newUserProfile = {
          auth_id: user.id,
          email: user.email,
          display_name: user.email.split('@')[0] || `User_${user.id.substring(0, 6)}`,
          created_at: new Date().toISOString(),
        };

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert([newUserProfile])
          .select()
          .single();

        if (createError) throw createError;

        if (createdUser) {
          setUserData(createdUser);
        } else {
          throw new Error('Failed to retrieve created user profile data after insert.');
        }
        setLoading(false);
      }
    } catch (error) {
      setUserData(null);
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('auth_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchUserReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          events (id, title, event_date, location)
        `)
        .eq('auth_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const fetchUserPosts = async () => {
    console.log("Fetching user posts (placeholder)...");
    setUserPosts([
      { id: 1, content: "Just enjoyed a great event booked through this platform! Highly recommend.", created_at: new Date(Date.now() - 3600000 * 2).toISOString(), likes: 15, comments: 3 },
      { id: 2, content: "Looking forward to the upcoming concert next week! Got my tickets.", created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), likes: 8, comments: 1 },
      { id: 3, content: "My latest order arrived today, super fast shipping!", created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), likes: 22, comments: 5 },
    ]);
  };

  const updateUserProfile = async (updatedData) => {
    try {
      if (!userData || !userData.auth_id) {
        return { success: false, error: 'User data not available for update.' };
      }
      const currentAuthId = userData.auth_id;

      if (currentAuthId !== id) {
        return { success: false, error: 'User ID mismatch detected.' };
      }

      const response = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_id: currentAuthId,
          ...updatedData
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `API request failed with status ${response.status}`);
      }

      setUserData(result);
      return { success: true };

    } catch (error) {
      const errorMessage = error.message.includes('User not found')
        ? 'Failed to update: User profile could not be found in the database.'
        : error.message;
      return { success: false, error: errorMessage };
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileImageUpload = async (file, progressCallback) => {
    if (!file || !user) throw new Error("Missing file or user");
    
    const fileExt = file.name.split('.').pop();
    const fileName = `profile.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('user-content/profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        onUploadProgress: (progress) => {
          progressCallback(Math.round((progress.loaded / progress.total) * 100));
        }
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('user-content')
      .getPublicUrl(`profile-images/${filePath}`);
    
    const updateResult = await updateUserProfile({
      profile_image_url: publicUrl
    });
    
    if (!updateResult.success) throw new Error(updateResult.error);
    
    return publicUrl;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'profile':
        return <TabContainer><ProfileTab user={userData} updateProfile={updateUserProfile} posts={userPosts} /></TabContainer>;
      case 'security':
        return <TabContainer><SecurityTab /></TabContainer>;
      case 'settings':
        return <TabContainer><SettingsTab user={userData} updateProfile={updateUserProfile} /></TabContainer>;
      case 'notifications':
        return <TabContainer><NotificationsTab user={userData} updateProfile={updateUserProfile} /></TabContainer>;
      case 'orders':
        return <OrdersTab orders={orders} />;
      case 'reservations':
        return <ReservationsTab reservations={reservations} />;
      case 'inbox':
        return <InboxTab />;
      default:
        return <TabContainer><ProfileTab user={userData} updateProfile={updateUserProfile} posts={userPosts} /></TabContainer>;
    }
  };

  const username = userData?.display_name || user?.email?.split('@')[0] || 'User';
  const joinedDate = new Date(userData?.created_at || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
        <div className="text-center">
          <div className="spinner-container mb-4 mx-auto">
            <div className="absolute w-16 h-16 border-4 border-indigo-500/30 rounded-full"></div>
            <div className="absolute w-16 h-16 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
            <FaUser className="text-indigo-400 text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-lg font-medium text-gray-300 animate-pulse">Loading Your Account...</p>
        </div>
      </div>
    );
  }

  return (
    <AccountContainer className="profile-container">
      <ProfilePictureModal
        isOpen={isEditingPicture}
        onClose={() => setIsEditingPicture(false)}
        userData={userData}
        username={username}
        onUpload={handleProfileImageUpload}
      />

      <div className="profile-header flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 md:gap-8">
        <div className="profile-avatar-wrapper flex-shrink-0 group">
          <div className="profile-avatar"> 
            {userData?.profile_image_url ? (
              <Image
                key={userData.profile_image_url}
                src={userData.profile_image_url}
                alt={username}
                fill
                priority
                sizes="(max-width: 640px) 64px, 80px"
              />
            ) : (
              <span className="text-2xl sm:text-3xl font-semibold text-white select-none flex items-center justify-center h-full">{username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingPicture(true);
            }} 
            className="absolute -bottom-1 -right-1 bg-gray-900/80 hover:bg-indigo-600 p-1.5 rounded-full text-gray-300 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <FaCamera className="w-3 h-3" />
            <span className="sr-only">Edit Profile Picture</span>
          </button>
        </div>

        <div className="profile-info flex-1 mt-2 sm:mt-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            {username}
          </h1>
          <div className="space-y-2 text-gray-400 mb-5">
            <p className="flex justify-center sm:justify-start items-center gap-2.5 text-sm">
              <FaEnvelope className="text-gray-500" />
              <span>{userData?.email || user?.email || 'No email available'}</span>
            </p>
            {userData?.phone_number && (
              <p className="flex justify-center sm:justify-start items-center gap-2.5 text-sm">
                <FaPhone className="text-gray-500" />
                <span>{userData.phone_number}</span>
              </p>
            )}
            <p className="text-gray-500 text-xs flex justify-center sm:justify-start items-center gap-2.5">
              <FaCalendarAlt className="text-gray-600" />
              <span>Member since {joinedDate}</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            <button
              onClick={() => handleTabChange('settings')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <FaCog />
              <span>Account Settings</span>
            </button>
            <button
              onClick={handleSignOut}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <FaSignOutAlt />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="block sm:hidden mb-6">
        <select
          className="profile-tab-select w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          value={activeTab}
          onChange={(e) => handleTabChange(e.target.value)}
        >
          <option value="profile">Profile Overview</option>
          <option value="orders">My Orders</option>
          <option value="reservations">My Reservations</option>
          <option value="inbox">Inbox</option>
          <option value="security">Security</option>
          <option value="settings">Settings</option>
          <option value="notifications">Notifications</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 lg:gap-8">
        <div className="hidden sm:block w-full sm:w-64 flex-shrink-0">
          <div className="sidebar-nav sticky top-6 p-2 bg-gray-800/60 backdrop-blur-sm shadow-md">
            {[
              { id: 'profile', label: 'Profile Overview', icon: FaUser },
              { id: 'orders', label: 'My Orders', icon: FaShoppingBag },
              { id: 'reservations', label: 'My Reservations', icon: FaTicketAlt },
              { id: 'inbox', label: 'Inbox', icon: FaEnvelopeOpen },
              { id: 'security', label: 'Security', icon: FaShieldAlt },
              { id: 'settings', label: 'Settings', icon: FaCog },
              { id: 'notifications', label: 'Notifications', icon: FaBell },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`nav-item flex items-center w-full px-4 py-3 rounded-md text-sm font-medium group ${
                  activeTab === item.id ? 'nav-item-active text-indigo-200' : 'text-gray-400 hover:text-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${activeTab === item.id ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="profile-panel flex-1 min-w-0 bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden">
          {renderActiveTab()}
        </div>
      </div>
    </AccountContainer>
  );
}

const TabContainer = ({ children, title }) => (
  <>
    {title && (
      <h2 className="text-xl font-semibold text-white p-5 md:p-6 border-b border-gray-700/50 bg-gray-900/20">
        {title}
      </h2>
    )}
    <div className="p-5 md:p-6">
      {children}
    </div>
  </>
);

const EmptyState = ({ icon: Icon, title, message, actionLink, actionText }) => (
  <div className="text-center py-12 px-6">
    <Icon className="text-6xl text-gray-600 mx-auto mb-6" />
    <h3 className="text-xl font-semibold text-gray-200 mb-2">{title}</h3>
    <p className="text-gray-400 mb-6 max-w-sm mx-auto">{message}</p>
    {actionLink && actionText && (
      <Link href={actionLink} className="btn-primary inline-flex items-center gap-2">
        {actionText}
        <FaArrowRight className="w-3 h-3" />
      </Link>
    )}
  </div>
);

function ProfileTab({ user, updateProfile, posts }) {
  const [newPostContent, setNewPostContent] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioContent, setBioContent] = useState(user?.bio || '');

  const handleBioUpdate = async () => {
    if (isEditingBio) {
      const result = await updateProfile({ bio: bioContent });
      if (result.success) {
        setIsEditingBio(false);
      } else {
        alert('Failed to update bio. Please try again.');
      }
    } else {
      setIsEditingBio(true);
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    console.log("Submitting post:", newPostContent);
    setNewPostContent('');
    alert("Post submitted (placeholder)!");
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="profile-card">
        <div className="flex justify-between items-center mb-2">
          <h3 className="card-header">About {user?.display_name || 'User'}</h3>
          <button
            onClick={handleBioUpdate}
            className="btn-rounded-icon"
          >
            {isEditingBio ? <FaCheck /> : <FaEdit />}
          </button>
        </div>
        {isEditingBio ? (
          <textarea
            value={bioContent}
            onChange={(e) => setBioContent(e.target.value)}
            placeholder="Tell others about yourself..."
            className="create-post-textarea mb-2"
            rows="3"
          />
        ) : (
          <p className="card-content text-gray-400">
            {user?.bio || `Member since ${new Date(user?.created_at || Date.now()).toLocaleDateString()}. No bio provided yet.`}
          </p>
        )}
      </div>

      <form onSubmit={handlePostSubmit} className="create-post-box">
         <div className="flex items-start gap-3">
            <div className="avatar-small bg-gray-600 flex items-center justify-center">
                 {user?.profile_image_url ? (
                    <Image src={user.profile_image_url} alt="Your avatar" fill className="object-cover" />
                 ) : (
                    <span className="text-lg font-semibold text-white">{user?.display_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                 )}
            </div>
            <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={`What's on your mind, ${user?.display_name || 'User'}?`}
                className="create-post-textarea"
                rows="3"
            />
         </div>
         <div className="flex justify-end mt-3">
            <button type="submit" className="btn-primary text-sm" disabled={!newPostContent.trim()}>
                Post
            </button>
         </div>
      </form>

      <div className="post-feed space-y-5">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Posts</h3>
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="flex items-center gap-3">
                   <div className="avatar-small bg-gray-600 flex items-center justify-center">
                      {user?.profile_image_url ? (
                         <Image src={user.profile_image_url} alt={user.display_name || 'User'} fill className="object-cover" />
                      ) : (
                         <span className="text-lg font-semibold text-white">{user?.display_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                      )}
                   </div>
                   <div>
                      <p className="font-semibold text-gray-100">{user?.display_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{timeAgo(post.created_at)}</p>
                   </div>
                </div>
              </div>
              <p className="post-content">
                {post.content}
              </p>
              <div className="post-actions">
                <button className="post-action-btn">
                  <FaThumbsUp className="w-4 h-4 mr-1.5" /> {post.likes} Likes
                </button>
                <button className="post-action-btn">
                  <FaComment className="w-4 h-4 mr-1.5" /> {post.comments} Comments
                </button>
                <button className="post-action-btn">
                  <FaShare className="w-4 h-4 mr-1.5" /> Share
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-6">No posts yet.</p>
        )}
      </div>
    </div>
  );
}

function OrdersTab({ orders }) {
  if (orders.length === 0) {
    return (
      <TabContainer>
        <EmptyState
          icon={FaShoppingBag}
          title="No Orders Yet"
          message="Looks like you haven't placed any orders. Explore our shop to find something you like!"
          actionLink="/shop"
          actionText="Browse Shop"
        />
      </TabContainer>
    );
  }

  return (
    <TabContainer title="My Orders">
      <div className="card-grid">
        {orders.map((order) => (
          <div key={order.id} className="profile-card">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-2 mb-3">
              <div className="flex-1">
                <div className="card-label mb-1">Order #{order.id.substring(0, 8)}</div>
                <div className="font-medium text-gray-200 text-sm">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold capitalize self-start md:self-center whitespace-nowrap
                ${order.status === 'completed' ? 'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/30' :
                  order.status === 'processing' ? 'bg-blue-500/20 text-blue-300 ring-1 ring-inset ring-blue-500/30' :
                  'bg-yellow-500/20 text-yellow-300 ring-1 ring-inset ring-yellow-500/30'}`}>
                {order.status}
              </div>
            </div>

            <div className="card-content space-y-2 border-t border-gray-700/60 pt-3">
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 flex-1 mr-2">
                      <span className="font-medium">{item.quantity}x</span> {item.product_name}
                    </span>
                    <span className="text-gray-400 font-mono whitespace-nowrap">${parseFloat(item.price).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No items found for this order.</p>
              )}
            </div>

            <div className="card-footer flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="text-gray-300 text-sm">
                Total: <span className="text-white font-semibold text-base font-mono">${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
              <Link href={`/account/orders/${order.id}`} className="btn-secondary text-xs inline-flex items-center gap-1.5">
                View Details
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </TabContainer>
  );
}

function ReservationsTab({ reservations }) {
  if (reservations.length === 0) {
    return (
      <TabContainer>
        <EmptyState
          icon={FaTicketAlt}
          title="No Reservations Yet"
          message="You haven't reserved tickets for any events. Check out upcoming events!"
          actionLink="/events"
          actionText="Browse Events"
        />
      </TabContainer>
    );
  }

  return (
    <TabContainer title="My Reservations">
      <div className="card-grid">
        {reservations.map((reservation) => {
          const isPast = reservation.events?.event_date && new Date(reservation.events.event_date) < new Date();
          const isExpired = reservation.expiration_time && new Date(reservation.expiration_time) < new Date();
          const eventDate = reservation.events?.event_date
            ? new Date(reservation.events.event_date).toLocaleString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
              })
            : 'Date not available';

          let statusText = reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1);
          let statusColor = 'bg-blue-500/20 text-blue-300 ring-1 ring-inset ring-blue-500/30';

          if (isExpired) {
            statusText = 'Expired';
            statusColor = 'bg-gray-600/30 text-gray-400 ring-1 ring-inset ring-gray-600/40';
          } else if (isPast) {
            statusText = 'Past Event';
            statusColor = 'bg-purple-500/20 text-purple-300 ring-1 ring-inset ring-purple-500/30';
          } else if (reservation.status === 'confirmed') {
            statusText = 'Confirmed';
            statusColor = 'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/30';
          }

          return (
            <div key={reservation.id} className="profile-card">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="card-header truncate">{reservation.events?.title || 'Event'}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 mb-0.5">
                    <FaCalendarAlt className="w-3 h-3 text-gray-500 flex-shrink-0" /> {eventDate}
                  </p>
                  <p className="text-sm text-gray-400 truncate flex items-center gap-1.5">
                    <FaMapMarkerAlt className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    {reservation.events?.location || 'Location not available'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap self-start md:self-center ${statusColor}`}>
                  {statusText}
                </div>
              </div>

              <div className="card-content flex flex-wrap justify-between items-center text-sm gap-3 border-t border-gray-700/60 pt-3">
                <span className="text-gray-300">
                  <span className="font-medium">{reservation.num_tickets}</span> {parseInt(reservation.num_tickets) === 1 ? 'Ticket' : 'Tickets'}
                  {reservation.ticket_type && ` (${reservation.ticket_type})`}
                </span>
                {reservation.qr_code_url && !isExpired && (
                  <Link href={reservation.qr_code_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition duration-150 font-medium text-xs bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1 rounded-md">
                    <FaQrcode />
                    <span>View QR Code</span>
                  </Link>
                )}
              </div>

              <div className="card-footer flex flex-col md:flex-row justify-between items-center gap-3">
                <div className="text-gray-500 text-xs">
                  Reserved on {new Date(reservation.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <Link href={`/account/reservations/${reservation.id}`} className="btn-secondary text-xs inline-flex items-center gap-1.5">
                  View Details
                  <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </TabContainer>
  );
}

function InboxTab() {
  return (
    <TabContainer>
      <EmptyState
        icon={FaEnvelopeOpen}
        title="Inbox Coming Soon"
        message="We're working on adding messaging features to connect with others and receive important updates right here."
      />
    </TabContainer>
  );
}
