import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaEnvelope, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import AuthCard from '../components/auth/AuthCard';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { email } = router.query;
  const [countdown, setCountdown] = useState(60);
  
  // Countdown timer for resend option (if implementing)
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <AuthCard
      title="Verify Your Email"
      subtitle="Check your inbox to complete signup"
      icon={FaEnvelope}
      iconColor="var(--color-neon-blue)"
      iconGlow="var(--glow-blue)"
    >
      <div className="text-center py-6 space-y-6">
        <div className="mx-auto w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center">
          <FaEnvelope className="h-8 w-8 text-blue-400" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white">Verification Email Sent</h3>
          
          <p className="text-sm text-gray-300">
            We've sent a verification email to:
          </p>
          
          <p className="text-md font-medium text-indigo-400 break-all">
            {email || 'your email address'}
          </p>
          
          <div className="pt-2 text-sm text-gray-400">
            <p>Please check your inbox and click the verification link to complete your registration.</p>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-start space-x-3">
            <FaExclamationTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-left text-gray-300">
              <p><span className="font-medium text-yellow-500">Important:</span> The verification link will expire after 24 hours.</p>
              <p className="mt-1">If you don't see the email, please check your spam or junk folder.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-3">
        <button
          className="btn btn-secondary w-full"
          onClick={() => router.push('/login')}
        >
          Go to Login
        </button>
        
        {/* Uncomment if you implement resend functionality
        <button
          className={`text-xs ${countdown > 0 ? 'text-gray-500' : 'text-indigo-400 hover:text-indigo-300'} transition-colors duration-200`}
          disabled={countdown > 0}
          onClick={() => {
            // Add resend verification email logic here
            setCountdown(60);
          }}
        >
          {countdown > 0 ? `Resend verification email (${countdown}s)` : 'Resend verification email'}
        </button>
        */}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Need help? <Link href="/help" className="text-indigo-400 hover:text-indigo-300">Contact Support</Link>
        </p>
      </div>
    </AuthCard>
  );
}
