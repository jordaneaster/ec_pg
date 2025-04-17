import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import SignupCard from '../components/auth/SignupCard';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password should be at least 6 characters.');
        return;
    }

    setLoading(true);

    try {
      // Register the user with authentication service
      const { error: signUpError, data } = await signUp(email, password); 
      
      if (signUpError) {
        throw signUpError;
      }

      // Create user record in the database
      if (data.user) {
        try {
          // Create a new user in the database with the user's auth ID
          const response = await fetch('/api/users', {
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

          if (!response.ok) {
            // Get detailed error info
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to create user record in database', {
              status: response.status,
              statusText: response.statusText,
              errorData
            });
          } else {
            console.log('User record created successfully in database');
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Continue with signup process even if DB creation fails
        }
      }

      // Handle different signup scenarios
      if (data.user && (!data.session || data.user.identities?.length === 0)) {
        // User needs email verification - redirect to verification page with email
        setMessage('Signup successful! Please check your email to confirm your account.');
        // Wait briefly to show the message before redirecting
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else if (data.session) {
        setMessage('Signup successful! Redirecting...');
        router.push('/account');
      } else {
        setMessage('Signup successful! Please check your email if confirmation is needed.');
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
      
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || 'Failed to sign up. The email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupCard
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      error={error}
      message={message}
      loading={loading}
      handleSignup={handleSignup}
    />
  );
}
