import React from 'react';
import Link from 'next/link';
import { FaSignInAlt, FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa';
import AuthCard from './AuthCard';

const LoginCard = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  error, 
  loading, 
  handleLogin 
}) => {
  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to access your account"
      icon={FaSignInAlt}
      iconColor="var(--color-neon-purple)"
      iconGlow="var(--glow-purple)"
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {error && <div className="text-xs text-red-400 bg-red-900/30 p-2 rounded-lg border border-red-700 animate-pulse">{error}</div>}
        
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
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-300" htmlFor="password">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition duration-200">
              Forgot?
            </Link>
          </div>
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
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
          style={{marginTop: 'var(--space-sm)'}}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <FaSpinner className="animate-spin mr-2 h-4 w-4" /> Logging In...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          Not a member yet?{' '}
          <Link href="/signup" className="neon-text pink">
            Create Account
          </Link>
        </p>
      </div>
    </AuthCard>
  );
};

export default LoginCard;
