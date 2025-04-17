import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaUser, FaSignOutAlt, FaShoppingBag, FaTicketAlt, FaQrcode,
  FaSpinner, FaUserEdit, FaCog, FaBell, FaShieldAlt, 
  FaEnvelope, FaCalendarAlt, FaPhone, FaHistory
} from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../lib/supabaseClient';

// Import our components
import AccountContainer from '../../components/account/AccountContainer';
import ProfileTab from '../../components/account/tabs/ProfileTab';
import SecurityTab from '../../components/account/tabs/SecurityTab';
import SettingsTab from '../../components/account/tabs/SettingsTab';
import NotificationsTab from '../../components/account/tabs/NotificationsTab';

export default function UserAccountPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user && id) {
      // Only allow users to view their own profile
      if (user.id !== id) {
        router.push('/account');
        return;
      }
      
      fetchUserData();
      fetchUserOrders();
      fetchUserReservations();
    }
  }, [user, authLoading, id, router]);

  const fetchUserData = async () => {
    try {
      if (!id) {
        console.error('No user ID available for fetching user data');
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setUserData(data);
      } else {
        // Create user profile if it doesn't exist
        const newUser = {
          auth_id: id,
          email: user.email,
          display_name: user.email ? user.email.split('@')[0] : 'User',
          created_at: new Date().toISOString(),
        };
        
        console.log('Creating new user profile:', newUser);
        
        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert([newUser])
          .select();
        
        if (createError) throw createError;
        
        if (createdUser && createdUser.length > 0) {
          console.log('New user profile created:', createdUser[0]);
          setUserData(createdUser[0]);
        } else {
          throw new Error('Failed to create user profile');
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
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
        .eq('auth_id', id)  // Changed from user_id to auth_id
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
        .eq('auth_id', id)  // Changed from user_id to auth_id
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const updateUserProfile = async (updatedData) => {
    try {
      // Check if we have a valid ID
      if (!id) {
        console.error('No user ID available for profile update');
        return { success: false, error: 'User ID not available' };
      }
      
      console.log('Updating user profile with ID:', id);
      console.log('Update data:', updatedData);
      
      // METHOD 1: Try using API endpoint first (server-side handling)
      try {
        const apiResponse = await fetch('/api/users/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_id: id,
            ...updatedData
          }),
        });
        
        if (apiResponse.ok) {
          const userData = await apiResponse.json();
          console.log('API update successful, user data:', userData);
          setUserData(userData);
          return { success: true };
        } else {
          console.error('API update failed, falling back to client method');
        }
      } catch (apiError) {
        console.error('Error with API update method:', apiError);
        // Continue to next method
      }
      
      // METHOD 2: Use direct client update as fallback
      const { error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('auth_id', id);
      
      if (error) {
        console.error('Client update method error:', error);
        
        // METHOD 3: Last resort - try with direct SQL via RPC if available
        try {
          const { error: rpcError } = await supabase.rpc('update_user_profile', {
            p_auth_id: id,
            p_user_data: updatedData
          });
          
          if (rpcError) throw rpcError;
          
          console.log('RPC update method successful');
        } catch (rpcError) {
          console.error('RPC update method error:', rpcError);
          throw error; // Throw the original error if RPC also fails
        }
      }
      
      // If we get here, at least one method succeeded or didn't error out
      console.log('Update operation completed, fetching latest user data');
      
      // Fetch latest user data regardless of which method was used
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching updated user data:', fetchError);
        // Even if fetch fails, we consider the update as success if the update itself didn't error
        return { success: true, message: 'Profile may have been updated but unable to fetch latest data' };
      }
      
      if (userData) {
        console.log('Updated user data fetched successfully:', userData);
        setUserData(userData);
        return { success: true };
      }
      
      return { success: true, message: 'Update completed but no user data returned' };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="spinner-container">
            <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto mb-4" />
          </div>
          <p className="text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Tab selection handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Render the active tab component
  const renderActiveTab = () => {
    switch(activeTab) {
      case 'profile':
        return <ProfileTab user={userData} updateProfile={updateUserProfile} />;
      case 'security':
        return <SecurityTab />;
      case 'settings':
        return <SettingsTab user={userData} updateProfile={updateUserProfile} />;
      case 'notifications':
        return <NotificationsTab user={userData} updateProfile={updateUserProfile} />;
      case 'orders':
        return <OrdersTab orders={orders} />;
      case 'reservations':
        return <ReservationsTab reservations={reservations} />;
      default:
        return <ProfileTab user={userData} updateProfile={updateUserProfile} />;
    }
  };

  const username = userData?.display_name || user?.email?.split('@')[0] || 'User';
  const joinedDate = new Date(userData?.created_at || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <AccountContainer>
      {/* Profile Card */}
      <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
          <div className="mb-4 sm:mb-0 sm:mr-6">
            <div 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg relative overflow-hidden"
            >
              {userData?.profile_image_url ? (
                <Image 
                  src={userData.profile_image_url}
                  alt={username}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">{username.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-1">
              Hello, {username}
            </h1>
            <p className="text-gray-400 flex justify-center sm:justify-start items-center">
              <FaEnvelope className="mr-2 text-gray-500" />
              {userData?.email || user?.email || 'No email available'}
            </p>
            {userData?.phone_number && (
              <p className="text-gray-400 flex justify-center sm:justify-start items-center mt-1">
                <FaPhone className="mr-2 text-gray-500" />
                {userData.phone_number}
              </p>
            )}
            <p className="text-gray-500 text-sm flex justify-center sm:justify-start items-center mt-1">
              <FaCalendarAlt className="mr-2 text-gray-600" />
              Member since {joinedDate}
            </p>
            
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
              <button 
                onClick={() => handleTabChange('profile')}
                className="border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white flex items-center space-x-1 px-4 py-2 rounded-full transition-colors"
              >
                <FaUserEdit className="text-sm" />
                <span>Edit Profile</span>
              </button>
              <button 
                onClick={handleSignOut}
                className="border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white flex items-center space-x-1 px-4 py-2 rounded-full transition-colors"
              >
                <FaSignOutAlt className="text-sm" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - Mobile Dropdown */}
      <div className="block sm:hidden mb-6">
        <select 
          className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white"
          value={activeTab}
          onChange={(e) => handleTabChange(e.target.value)}
        >
          <option value="profile">Profile</option>
          <option value="orders">My Orders</option>
          <option value="reservations">My Reservations</option>
          <option value="security">Security</option>
          <option value="settings">Settings</option>
          <option value="notifications">Notifications</option>
        </select>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar Navigation - Tablet/Desktop */}
        <div className="hidden sm:block w-full sm:w-56 flex-shrink-0">
          <div className="bg-gray-800 bg-opacity-50 rounded-2xl overflow-hidden sticky top-6 shadow-lg">
            <button
              onClick={() => handleTabChange('profile')}
              className={`flex items-center space-x-3 w-full p-4 text-left border-l-4 transition-colors ${
                activeTab === 'profile' 
                ? 'border-indigo-500 bg-gray-700 bg-opacity-50 text-white' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700 hover:bg-opacity-30'
              }`}
            >
              <FaUser className={activeTab === 'profile' ? 'text-indigo-400' : 'text-gray-500'} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => handleTabChange('orders')}
              className={`flex items-center space-x-3 w-full p-4 text-left border-l-4 transition-colors ${
                activeTab === 'orders' 
                ? 'border-indigo-500 bg-gray-700 bg-opacity-50 text-white' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700 hover:bg-opacity-30'
              }`}
            >
              <FaShoppingBag className={activeTab === 'orders' ? 'text-indigo-400' : 'text-gray-500'} />
              <span>My Orders</span>
            </button>
            <button
              onClick={() => handleTabChange('reservations')}
              className={`flex items-center space-x-3 w-full p-4 text-left border-l-4 transition-colors ${
                activeTab === 'reservations' 
                ? 'border-indigo-500 bg-gray-700 bg-opacity-50 text-white' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700 hover:bg-opacity-30'
              }`}
            >
              <FaTicketAlt className={activeTab === 'reservations' ? 'text-indigo-400' : 'text-gray-500'} />
              <span>My Reservations</span>
            </button>
            <button
              onClick={() => handleTabChange('security')}
              className={`flex items-center space-x-3 w-full p-4 text-left border-l-4 transition-colors ${
                activeTab === 'security' 
                ? 'border-indigo-500 bg-gray-700 bg-opacity-50 text-white' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700 hover:bg-opacity-30'
              }`}
            >
              <FaShieldAlt className={activeTab === 'security' ? 'text-indigo-400' : 'text-gray-500'} />
              <span>Security</span>
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`flex items-center space-x-3 w-full p-4 text-left border-l-4 transition-colors ${
                activeTab === 'settings' 
                ? 'border-indigo-500 bg-gray-700 bg-opacity-50 text-white' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700 hover:bg-opacity-30'
              }`}
            >
              <FaCog className={activeTab === 'settings' ? 'text-indigo-400' : 'text-gray-500'} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => handleTabChange('notifications')}
              className={`flex items-center space-x-3 w-full p-4 text-left border-l-4 transition-colors ${
                activeTab === 'notifications' 
                ? 'border-indigo-500 bg-gray-700 bg-opacity-50 text-white' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700 hover:bg-opacity-30'
              }`}
            >
              <FaBell className={activeTab === 'notifications' ? 'text-indigo-400' : 'text-gray-500'} />
              <span>Notifications</span>
            </button>
          </div>
        </div>
        
        {/* Tab Content Area */}
        <div className="flex-1">
          {renderActiveTab()}
        </div>
      </div>
    </AccountContainer>
  );
}

// Orders Tab Component
function OrdersTab({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 shadow-lg">
        <div className="text-center py-8">
          <FaShoppingBag className="text-4xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Orders Yet</h3>
          <p className="text-gray-400 mb-6">You haven't made any purchases yet.</p>
          <Link href="/shop" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition">
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-6">My Orders</h2>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm text-gray-400">Order #{order.id.substring(0, 8)}</div>
                <div className="font-medium text-white">{new Date(order.created_at).toLocaleDateString()}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium 
                ${order.status === 'completed' ? 'bg-green-900 text-green-300' : 
                  order.status === 'processing' ? 'bg-blue-900 text-blue-300' : 
                  'bg-yellow-900 text-yellow-300'}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
            
            <div className="space-y-2 mb-3">
              {order.order_items && order.order_items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-300">
                    {item.quantity}x {item.product_name}
                  </span>
                  <span className="text-gray-400">${parseFloat(item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
              <div className="text-gray-400">
                Total: <span className="text-white font-medium">${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
              <Link href={`/account/orders/${order.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center transition">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Reservations Tab Component
function ReservationsTab({ reservations }) {
  if (reservations.length === 0) {
    return (
      <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 shadow-lg">
        <div className="text-center py-8">
          <FaTicketAlt className="text-4xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Reservations Yet</h3>
          <p className="text-gray-400 mb-6">You haven't made any event reservations yet.</p>
          <Link href="/events" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-6">My Reservations</h2>
      
      <div className="space-y-4">
        {reservations.map((reservation) => {
          const isPast = new Date(reservation.events?.event_date) < new Date();
          const isExpired = new Date(reservation.expiration_time) < new Date();
          
          return (
            <div key={reservation.id} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-white">{reservation.events?.title || 'Event'}</div>
                  <div className="text-sm text-gray-400">
                    {reservation.events?.event_date ? 
                      new Date(reservation.events.event_date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : 'Date not available'}
                  </div>
                  <div className="text-sm text-gray-400">{reservation.events?.location || 'Location not available'}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${isExpired ? 'bg-gray-700 text-gray-300' : 
                    isPast ? 'bg-purple-900 text-purple-300' : 
                    reservation.status === 'confirmed' ? 'bg-green-900 text-green-300' : 
                    'bg-blue-900 text-blue-300'}`}>
                  {isExpired ? 'Expired' : 
                   isPast ? 'Past Event' : 
                   reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="text-gray-300">
                  {reservation.num_tickets} {parseInt(reservation.num_tickets) === 1 ? 'Ticket' : 'Tickets'} 
                  {reservation.ticket_type && ` (${reservation.ticket_type})`}
                </span>
                {reservation.qr_code_url && !isExpired && (
                  <Link href={reservation.qr_code_url} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition">
                    <FaQrcode />
                    <span>View QR Code</span>
                  </Link>
                )}
              </div>
              
              <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                <div className="text-gray-400 text-sm">
                  Reserved on {new Date(reservation.created_at).toLocaleDateString()}
                </div>
                <Link href={`/account/reservations/${reservation.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center transition">
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
