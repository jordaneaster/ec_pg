import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import LoginCard from '../components/auth/LoginCard';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithPassword, setUserProfile } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError, data } = await signInWithPassword(email, password);
      if (signInError) {
        throw signInError;
      }

      // Fetch user profile from database
      if (data.user) {
        try {
          const response = await fetch(`/api/users/${data.user.id}`);
          
          if (!response.ok) {
            console.warn('User profile not found in database, creating one...');
            // Create user record if it doesn't exist
            const createResponse = await fetch('/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                auth_id: data.user.id,
                email: email,
                created_at: new Date().toISOString()
              }),
            });
            
            if (createResponse.ok) {
              const newUserProfile = await createResponse.json();
              if (setUserProfile) setUserProfile(newUserProfile);
            }
          } else {
            const userProfile = await response.json();
            if (setUserProfile) setUserProfile(userProfile);
          }
        } catch (dbError) {
          console.error('Error fetching user profile:', dbError);
          // Continue with login even if profile fetch fails
        }
      }

      router.push('/account');
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginCard
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
      loading={loading}
      handleLogin={handleLogin}
    />
  );
}
