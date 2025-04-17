import React from 'react';
import Link from 'next/link';

const AuthCard = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  iconColor, 
  iconGlow, 
  children, 
  footerLinks = true 
}) => {
  return (
    <div className="auth-card-container min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="auth-card card glow-border relative overflow-visible max-w-md mx-auto"
           style={{
             padding: 'var(--space-md)',
             boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
           }}>
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div style={{
            backgroundColor: iconColor || 'var(--color-neon-purple)',
            width: '4rem',
            height: '4rem',
            boxShadow: iconGlow || 'var(--glow-purple)',
          }} className="rounded-full flex items-center justify-center">
            <Icon className="text-2xl text-white" />
          </div>
        </div>
        
        <div className="text-center pt-8 mb-6">
          <h1 className="gradient-text text-xl sm:text-2xl font-bold font-serif tracking-tight">
            {title}
          </h1>
          <p className="text-gray-400 mt-1 text-xs">{subtitle}</p>
        </div>
        
        {children}
        
        {footerLinks && (
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
        )}
      </div>
    </div>
  );
};

export default AuthCard;
