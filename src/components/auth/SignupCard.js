import React from 'react';
import Link from 'next/link';
import { FaUserPlus, FaEnvelope, FaLock, FaShieldAlt, FaSpinner } from 'react-icons/fa';
import AuthCard from './AuthCard';

const SignupCard = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  message,
  loading,
  handleSignup
}) => {
  return (
    <AuthCard
      title="Create Account"
      subtitle="Join our community today"
      icon={FaUserPlus}
      iconColor="var(--color-neon-pink)"
      iconGlow="var(--glow-pink)"
    >
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
    </AuthCard>
  );
};

export default SignupCard;
