import React from 'react';
import { FaBell } from 'react-icons/fa';
import AccountCard from '../AccountCard';

export default function NotificationsTab() {
  return (
    <div className="tab-content fade-in">
      <AccountCard title="Notification Preferences" icon={<FaBell />}>
        <div className="space-y-4">
          <div className="notification-setting bg-gray-700 bg-opacity-40 rounded-xl p-4 flex items-center justify-between">
            <div className="notification-info">
              <h3 className="notification-title text-lg font-medium text-white">Email Notifications</h3>
              <p className="notification-description text-sm text-gray-400">
                Receive important updates about your account
              </p>
            </div>
            <label className="toggle-switch relative inline-block w-12 h-6">
              <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0" />
              <span className="toggle-slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-600 rounded-full transition-colors duration-300 before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform before:duration-300 before:checked:transform before:checked:translate-x-6 before:checked:bg-indigo-500"></span>
            </label>
          </div>
          
          <div className="notification-setting bg-gray-700 bg-opacity-40 rounded-xl p-4 flex items-center justify-between">
            <div className="notification-info">
              <h3 className="notification-title text-lg font-medium text-white">Marketing Communications</h3>
              <p className="notification-description text-sm text-gray-400">
                Receive promotional offers and new features updates
              </p>
            </div>
            <label className="toggle-switch relative inline-block w-12 h-6">
              <input type="checkbox" className="opacity-0 w-0 h-0" />
              <span className="toggle-slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-600 rounded-full transition-colors duration-300 before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform before:duration-300 before:checked:transform before:checked:translate-x-6 before:checked:bg-indigo-500"></span>
            </label>
          </div>
          
          <div className="notification-setting bg-gray-700 bg-opacity-40 rounded-xl p-4 flex items-center justify-between">
            <div className="notification-info">
              <h3 className="notification-title text-lg font-medium text-white">Security Alerts</h3>
              <p className="notification-description text-sm text-gray-400">
                Get notified about important security-related activities
              </p>
            </div>
            <label className="toggle-switch relative inline-block w-12 h-6">
              <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0" />
              <span className="toggle-slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-600 rounded-full transition-colors duration-300 before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform before:duration-300 before:checked:transform before:checked:translate-x-6 before:checked:bg-indigo-500"></span>
            </label>
          </div>
        </div>
      </AccountCard>
    </div>
  );
}
