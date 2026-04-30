'use client';

import { useState, useEffect } from 'react';
import {
  UserCircleIcon,
  BellIcon,
  KeyIcon,
  CreditCardIcon,
  UserGroupIcon,
  LanguageIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { devicesApi } from '@/lib/supabaseApi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// Tab Components
function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile?.(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <button className="absolute bottom-0 right-0 p-1 bg-white dark:bg-gray-700 rounded-full shadow-md">
            <PencilIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-400 mt-1">Member since {new Date(user?.createdAt || '').getFullYear()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              placeholder="+92 300 1234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            placeholder="Tell us about yourself..."
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && (
            <span className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="h-5 w-5" />
              Saved!
            </span>
          )}
        </div>
      </form>
    </motion.div>
  );
}

function SecuritySettings() {
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await changePassword?.(formData.currentPassword, formData.newPassword);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="password"
            required
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            required
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
          </div>
          <button
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`px-4 py-2 rounded-lg transition ${
              twoFactorEnabled
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(false);

  const plans = [
    { name: 'Free', price: '$0', messages: '1,000', devices: '1', team: '1', features: ['Basic Analytics', 'Email Support'] },
    { name: 'Pro', price: '$29', messages: '5,000', devices: '3', team: '5', features: ['Advanced Analytics', 'Priority Support', 'API Access'] },
    { name: 'Business', price: '$99', messages: '20,000', devices: '10', team: '20', features: ['Custom Analytics', '24/7 Support', 'Dedicated Account Manager'] },
  ];

  const handleUpgrade = async (planName: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPlan(planName.toLowerCase());
      toast.success(`Upgraded to ${planName} plan`);
    } catch (error) {
      toast.error('Failed to upgrade plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="text-2xl font-bold capitalize">{plan}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Billing Cycle</p>
            <p className="font-medium">Monthly</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2"
              style={{ width: plan === 'free' ? '30%' : plan === 'pro' ? '60%' : '100%' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`border rounded-lg p-4 ${
              plan === p.name.toLowerCase()
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="text-2xl font-bold mt-2">{p.price}</p>
            <p className="text-sm text-gray-500">/month</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm">📨 {p.messages} messages</p>
              <p className="text-sm">📱 {p.devices} devices</p>
              <p className="text-sm">👥 {p.team} team members</p>
            </div>
            <button
              onClick={() => handleUpgrade(p.name)}
              disabled={plan === p.name.toLowerCase() || loading}
              className={`w-full mt-4 py-2 rounded-lg transition ${
                plan === p.name.toLowerCase()
                  ? 'bg-green-100 text-green-800 cursor-default'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {plan === p.name.toLowerCase() ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSettings() {
  const [members, setMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: 'JD' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', avatar: 'JS' },
  ]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Invitation sent to ${inviteEmail}`);
      setShowInvite(false);
      setInviteEmail('');
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  const removeMember = async (id: number) => {
    if (!confirm('Remove this team member?')) return;
    setMembers(members.filter(m => m.id !== id));
    toast.success('Member removed');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Team Members</h3>
          <p className="text-sm text-gray-500">Manage who can access your workspace</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Invite Member
        </button>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {member.avatar}
              </div>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{member.role}</span>
              {member.role !== 'Admin' && (
                <button
                  onClick={() => removeMember(member.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="colleague@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Member</option>
                  <option>Viewer</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Send Invite
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageAlerts: true,
    marketingEmails: false,
    weeklyReport: true,
    mentionAlerts: true,
  });

  const handleSave = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-4">
      {[
        { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates about your account' },
        { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser notifications' },
        { key: 'messageAlerts', label: 'Message Alerts', description: 'Get notified when you receive new messages' },
        { key: 'mentionAlerts', label: 'Mention Alerts', description: 'Get notified when someone mentions you' },
        { key: 'weeklyReport', label: 'Weekly Report', description: 'Receive weekly analytics report' },
        { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive product updates and promotions' },
      ].map((setting) => (
        <label key={setting.key} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
          <div>
            <p className="font-medium">{setting.label}</p>
            <p className="text-sm text-gray-500">{setting.description}</p>
          </div>
          <input
            type="checkbox"
            checked={settings[setting.key as keyof typeof settings]}
            onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.checked })}
            className="h-5 w-5 text-blue-600 rounded"
          />
        </label>
      ))}
      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Save Preferences
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon, component: ProfileSettings },
    { id: 'security', name: 'Security', icon: KeyIcon, component: SecuritySettings },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon, component: BillingSettings },
    { id: 'team', name: 'Team', icon: UserGroupIcon, component: TeamSettings },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, component: NotificationSettings },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || ProfileSettings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
