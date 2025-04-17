import React from 'react';
import { FaCog, FaGlobe, FaMoon, FaSun } from 'react-icons/fa';
import AccountCard from '../AccountCard';

export default function SettingsTab() {
  return (
    <div className="tab-content fade-in">
      <AccountCard title="Account Settings" icon={<FaCog />}>
        <div className="space-y-5">
          <div className="settings-item bg-gray-700 bg-opacity-40 rounded-xl p-4 flex items-center justify-between">
            <div className="settings-item-info flex items-center">
              <div className="settings-item-icon bg-indigo-900 bg-opacity-30 p-3 rounded-full mr-4">
                <FaGlobe className="text-indigo-400" />
              </div>
              <div>
                <h3 className="settings-item-title text-lg font-medium text-white">Language</h3>
                <p className="settings-item-description text-sm text-gray-400">Choose your preferred language</p>
              </div>
            </div>
            <div className="settings-item-control">
              <select className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
          
          <div className="settings-item bg-gray-700 bg-opacity-40 rounded-xl p-4 flex items-center justify-between">
            <div className="settings-item-info flex items-center">
              <div className="settings-item-icon bg-indigo-900 bg-opacity-30 p-3 rounded-full mr-4">
                <FaGlobe className="text-indigo-400" />
              </div>
              <div>
                <h3 className="settings-item-title text-lg font-medium text-white">Timezone</h3>
                <p className="settings-item-description text-sm text-gray-400">Set your local timezone</p>
              </div>
            </div>
            <div className="settings-item-control">
              <select className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2">
                <option>Pacific Time (PT)</option>
                <option>Mountain Time (MT)</option>
                <option>Central Time (CT)</option>
                <option>Eastern Time (ET)</option>
                <option>Greenwich Mean Time (GMT)</option>
              </select>
            </div>
          </div>
          
          <div className="settings-item bg-gray-700 bg-opacity-40 rounded-xl p-4 flex items-center justify-between">
            <div className="settings-item-info flex items-center">
              <div className="settings-item-icon bg-indigo-900 bg-opacity-30 p-3 rounded-full mr-4">
                <FaMoon className="text-indigo-400" />
              </div>
              <div>
                <h3 className="settings-item-title text-lg font-medium text-white">Theme</h3>
                <p className="settings-item-description text-sm text-gray-400">Select your interface theme</p>
              </div>
            </div>
            <div className="settings-item-control settings-theme-toggle flex bg-gray-800 rounded-lg p-1">
              <button className="theme-option theme-option-active bg-indigo-700 text-white px-3 py-1 rounded-md flex items-center mr-1">
                <FaMoon className="mr-1" /> 
                <span>Dark</span>
              </button>
              <button className="theme-option text-gray-400 hover:text-white px-3 py-1 rounded-md flex items-center transition-colors">
                <FaSun className="mr-1" /> 
                <span>Light</span>
              </button>
            </div>
          </div>
        </div>
      </AccountCard>
    </div>
  );
}
