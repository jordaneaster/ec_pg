import React from 'react';
import { FaShieldAlt, FaKey, FaEnvelope } from 'react-icons/fa';
import AccountCard from '../AccountCard';

export default function SecurityTab() {
  return (
    <div className="tab-content fade-in">
      <AccountCard title="Security Settings" icon={<FaShieldAlt />}>
        <div className="space-y-4">
          <div className="security-card bg-gray-700 bg-opacity-40 rounded-xl p-4 flex items-center justify-between">
            <div className="security-card-content flex items-center">
              <div className="security-card-icon mr-4">
                <div className="icon-wrapper bg-indigo-900 bg-opacity-30 p-3 rounded-full">
                  <FaKey className="text-indigo-400" />
                </div>
              </div>
              <div className="security-card-info">
                <h3 className="security-card-title text-lg font-medium text-white">Password</h3>
                <p className="security-card-description text-sm text-gray-400">
                  Update your password regularly for better security
                </p>
              </div>
            </div>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
              Change
            </button>
          </div>
          
          <div className="security-card bg-gray-700 bg-opacity-40 rounded-xl p-4 flex items-center justify-between">
            <div className="security-card-content flex items-center">
              <div className="security-card-icon mr-4">
                <div className="icon-wrapper bg-indigo-900 bg-opacity-30 p-3 rounded-full">
                  <FaShieldAlt className="text-indigo-400" />
                </div>
              </div>
              <div className="security-card-info">
                <h3 className="security-card-title text-lg font-medium text-white">Two-Factor Authentication</h3>
                <p className="security-card-description text-sm text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
              Set Up
            </button>
          </div>
          
          <div className="security-card bg-gray-700 bg-opacity-40 rounded-xl p-4 flex items-center justify-between">
            <div className="security-card-content flex items-center">
              <div className="security-card-icon mr-4">
                <div className="icon-wrapper bg-indigo-900 bg-opacity-30 p-3 rounded-full">
                  <FaEnvelope className="text-indigo-400" />
                </div>
              </div>
              <div className="security-card-info">
                <h3 className="security-card-title text-lg font-medium text-white">Email Verification</h3>
                <p className="security-card-description text-sm text-gray-400">
                  Verify your email address to secure your account
                </p>
              </div>
            </div>
            <span className="security-status verified bg-green-900 bg-opacity-30 text-green-400 py-1 px-3 rounded-full">
              Verified
            </span>
          </div>
        </div>
      </AccountCard>
    </div>
  );
}
