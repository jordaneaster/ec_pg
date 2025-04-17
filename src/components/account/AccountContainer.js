import React from 'react';

export default function AccountContainer({ children }) {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Content container with subtle background */}
          <div className="bg-gray-900 bg-opacity-50 rounded-3xl p-6 shadow-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
