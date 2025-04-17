import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { FaSpinner } from 'react-icons/fa';

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.id) {
        // Only redirect if we have a valid user ID
        router.push(`/account/${user.id}`);
      }
    }
  }, [user, authLoading, router]);

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
