import React from 'react';

export default function AccountCard({ title, icon, children, action }) {
  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-lg transition-all hover:shadow-xl">
      <div className="border-b border-gray-700 bg-gray-800 bg-opacity-50 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            {icon && <span className="mr-2 text-indigo-400">{icon}</span>}
            {title}
          </h2>
          {action && <div>{action}</div>}
        </div>
      </div>
      <div className="p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
}
