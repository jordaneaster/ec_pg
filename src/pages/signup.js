import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { FaUserPlus, FaEnvelope, FaLock, FaShieldAlt, FaSpinner } from 'react-icons/fa';

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
      const { error: signUpError, data } = await signUp(email, password); 
      
      if (signUpError) {
        throw signUpError;
      }

      if (data.user && data.user.identities && data.user.identities.length === 0) {
         setMessage('Signup successful! Please check your email to confirm your account.');
      } else if (data.session) {
         setMessage('Signup successful! Redirecting...');
         router.push('/account');
      } else {
         setMessage('Signup successful! Please check your email if confirmation is needed.');
      }
      
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || 'Failed to sign up. The email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="card glow-border w-[280px] sm:w-[300px] md:w-[320px] mx-auto relative overflow-visible"
           style={{
             padding: 'var(--space-md)',
             marginTop: 'var(--space-xl)',
             boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
             margin: '0 auto'
           }}>
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div style={{
            backgroundColor: 'var(--color-neon-pink)',
            width: '4rem',
            height: '4rem',
            boxShadow: 'var(--glow-pink)',
          }} className="rounded-full flex items-center justify-center">
            <FaUserPlus className="text-2xl text-white" />
          </div>
        </div>
        
        <div className="text-center pt-8 mb-6">
          <h1 className="gradient-text text-xl sm:text-2xl font-bold font-serif tracking-tight">
            Create Account
          </h1>
          <p className="text-gray-400 mt-1 text-xs">Join our community today</p>
        </div>
        
        <form onSubmit={handleSignup} className="space-y-4">
          {error && <div className="text-xs text-red-400 bg-red-900/30 p-2 rounded-lg border border-red-700 animate-pulse">{error}</div>}
          {message && <div className="text-xs text-green-400 bg-green-900/30 p-2 rounded-lg border border-green-700">{message}</div>}
          
          <div className="relative">
            <label className="block mb-1 text-xs font-medium text-gray-300" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-sm pl-9 pr-3 py-2 bg-gray-700/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block mb-1 text-xs font-medium text-gray-300" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-sm pl-9 pr-3 py-2 bg-gray-700/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="Minimum 6 characters"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Min. 6 characters</p>
          </div>

          <div className="relative">
            <label className="block mb-1 text-xs font-medium text-gray-300" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaShieldAlt className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full text-sm pl-9 pr-3 py-2 bg-gray-700/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || message.includes('successful')}
            className="btn btn-primary w-full"
            style={{marginTop: 'var(--space-sm)'}}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2 h-4 w-4" /> Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="neon-text blue">
              Sign In
            </Link>
          </p>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex flex-row space-x-3 justify-center text-center">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-200">
              Home
            </Link>
            <Link href="/help" className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-200">
              Help
            </Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-200">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
