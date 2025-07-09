import React, { useState } from 'react';
import { BarChart3, Users, ShoppingBag, TrendingUp, Settings, Database, AlertTriangle, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = [
    { label: 'Total Users', value: '2,847', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { label: 'Active APIs', value: '156', change: '+5%', icon: Database, color: 'bg-green-500' },
    { label: 'Products Tracked', value: '1.2M', change: '+18%', icon: ShoppingBag, color: 'bg-purple-500' },
    { label: 'Revenue', value: '$45.2K', change: '+23%', icon: TrendingUp, color: 'bg-yellow-500' },
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', joined: '2024-01-15', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', joined: '2024-01-14', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', joined: '2024-01-13', status: 'Inactive' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', joined: '2024-01-12', status: 'Active' },
  ];

  const apiIntegrations = [
    { id: 1, name: 'Amazon Product API', status: 'Active', requests: '45.2K', uptime: '99.9%' },
    { id: 2, name: 'eBay Shopping API', status: 'Active', requests: '32.1K', uptime: '99.7%' },
    { id: 3, name: 'Walmart API', status: 'Warning', requests: '28.5K', uptime: '98.2%' },
    { id: 4, name: 'Best Buy API', status: 'Active', requests: '19.8K', uptime: '99.8%' },
    { id: 5, name: 'Target API', status: 'Error', requests: '0', uptime: '0%' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'apis', label: 'API Management', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users, APIs, and system settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="flex space-x-8">
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-green-400 text-sm mt-1">{stat.change}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Chart placeholder - User growth over time</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">API Usage</h3>
                <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Chart placeholder - API requests over time</p>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">System Health</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">99.9%</div>
                  <p className="text-gray-400 text-sm">Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">45ms</div>
                  <p className="text-gray-400 text-sm">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">156K</div>
                  <p className="text-gray-400 text-sm">Requests/Hour</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Management</h2>
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                              <span className="text-sm font-medium">{user.name.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.joined}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-400 hover:text-blue-300">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-yellow-400 hover:text-yellow-300">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-400 hover:text-red-300">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* APIs Tab */}
        {activeTab === 'apis' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">API Management</h2>
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add API</span>
              </button>
            </div>

            <div className="grid gap-6">
              {apiIntegrations.map((api) => (
                <div key={api.id} className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        api.status === 'Active' ? 'bg-green-500' :
                        api.status === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <h3 className="font-semibold">{api.name}</h3>
                        <p className="text-sm text-gray-400">
                          {api.requests} requests • {api.uptime} uptime
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        api.status === 'Active' ? 'bg-green-900 text-green-300' :
                        api.status === 'Warning' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                      }`}>
                        {api.status}
                      </span>
                      <button className="text-gray-400 hover:text-white">
                        <Settings className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">System Settings</h2>
            
            <div className="grid gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Maintenance Mode</h4>
                      <p className="text-sm text-gray-400">Enable maintenance mode for system updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto Backup</h4>
                      <p className="text-sm text-gray-400">Automatically backup database daily</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <button className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-left">
                    Reset All User Sessions
                  </button>
                  <button className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors text-left">
                    Regenerate API Keys
                  </button>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-left">
                    Export Security Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;