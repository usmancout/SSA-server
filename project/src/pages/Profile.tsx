import React, {useEffect, useState} from 'react';
import { User, Mail, Lock, Camera, Save, Bell, Shield, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from "axios";

const Profile: React.FC = () => {
  const { user, updateProfile, getProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile when component mounts
  useEffect(() => {
    getProfile();
  }, []);

  // Sync form data when user state updates
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || ''
    });
  }, [user]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
          'https://ssa-server-production.up.railway.app/api/auth/profile',
          {
            username: formData.name,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            bio: formData.bio
          },
          { headers: { Authorization: `Bearer ${token}` } }
      );

      updateProfile(formData);
      alert('Profile updated successfully!');

    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }

    setIsLoading(false);
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
          'https://ssa-server-production.up.railway.app/api/auth/avatar',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
      );

      updateProfile({ avatar: res.data.avatar });
      alert('Profile picture updated!');

    } catch (err) {
      console.error(err);
      alert('Failed to update profile picture.');
    }
  };


  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account preferences and settings</p>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                        src={user?.avatar || 'https://via.placeholder.com/150'}
                        alt={user?.name}
                        className="h-24 w-24 rounded-full object-cover"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        id="avatarUpload"
                        className="hidden"
                        onChange={handlePhotoChange}
                    />
                    <label
                        htmlFor="avatarUpload"
                        className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-2 rounded-full cursor-pointer transition-colors"
                    >
                      <Camera className="h-4 w-4 text-white"/>
                    </label>
                  </div>

                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="San Francisco, CA"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium">Price Alerts</h4>
                      <p className="text-sm text-gray-400">Get notified when prices drop on your wishlist items</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium">New Products</h4>
                      <p className="text-sm text-gray-400">Get notified about new products in your favorite categories</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium">Weekly Summary</h4>
                      <p className="text-sm text-gray-400">Receive weekly summaries of deals and recommendations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Security Settings</h3>
                
                <div className="space-y-6">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2">Change Password</h4>
                    <p className="text-sm text-gray-400 mb-4">Update your password to keep your account secure</p>
                    <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
                      <Lock className="h-4 w-4" />
                      <span>Change Password</span>
                    </button>
                  </div>

                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-400 mb-4">Add an extra layer of security to your account</p>
                    <button className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg transition-colors">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2">Active Sessions</h4>
                    <p className="text-sm text-gray-400 mb-4">Manage your active login sessions</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded">
                        <div>
                          <p className="text-sm">Current Session - Chrome on Mac</p>
                          <p className="text-xs text-gray-400">San Francisco, CA • Active now</p>
                        </div>
                        <span className="text-green-400 text-xs">Current</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Billing & Subscription</h3>
                
                <div className="p-6 bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg">
                  <h4 className="text-xl font-semibold mb-2">Free Plan</h4>
                  <p className="text-gray-300 mb-4">You're currently on the free plan with basic features</p>
                  <button className="bg-white text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Upgrade to Pro
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2">Payment Method</h4>
                    <p className="text-sm text-gray-400 mb-4">No payment method on file</p>
                    <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors text-sm">
                      Add Payment Method
                    </button>
                  </div>

                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2">Billing History</h4>
                    <p className="text-sm text-gray-400 mb-4">No billing history available</p>
                    <button className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg transition-colors text-sm">
                      View History
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;