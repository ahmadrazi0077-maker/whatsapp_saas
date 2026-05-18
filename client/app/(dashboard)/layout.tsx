'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UsageAlert } from '@/components/shared/UsageAlert';

import {
  LayoutDashboard, MessageSquare, Users, Smartphone, Radio, BarChart3,
  Settings, LogOut, Menu, X, Bell, Search, User, HelpCircle,
  ChevronDown, ChevronRight, Sun, Moon, Zap, CheckCircle, AlertTriangle,
  Calendar, FileText, Bot, Image, Webhook, Activity, CreditCard, Crown,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://whatsapp-saas-tftc.onrender.com/api';

const navigation = [
  { category: 'Main', items: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chats', href: '/chats', icon: MessageSquare },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Devices', href: '/devices', icon: Smartphone },
  ]},
  { category: 'Communication', items: [
  
    { name: 'Campaigns', href: '/campaigns', icon: Calendar },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'ChatBot', href: '/chatbot', icon: Bot },
  ]},
  { category: 'Management', items: [
    { name: 'Media', href: '/media', icon: Image },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Webhooks', href: '/webhooks', icon: Webhook },
  ]},
  { category: 'Analytics', items: [
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Logs', href: '/logs', icon: Activity },
  ]},
  { category: 'Account', items: [
    { name: 'Subscription', href: '/subscription', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Main', 'Communication', 'Management', 'Analytics', 'Account']);
  const [realNotifications, setRealNotifications] = useState<any[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchUser(); fetchNotifications(); }, []);

  // Load dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') setDarkMode(true);
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setUser(data.data);
    } catch (err) { console.error('Failed to fetch user'); }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRealNotifications((data.data || []).slice(0, 5).map((log: any, i: number) => ({
          id: log.id || i,
          type: log.status === 'error' ? 'error' : 'info',
          title: log.action || 'System Event',
          desc: log.details || '',
          time: new Date(log.createdAt).toLocaleString(),
          icon: log.status === 'error' ? AlertTriangle : CheckCircle,
          color: log.status === 'error' ? 'text-red-500' : 'text-green-500',
          bg: log.status === 'error' ? 'bg-red-50' : 'bg-green-50',
        })));
      }
    } catch (err) { /* silent */ }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const searchResults = searchQuery
    ? navigation.flatMap(cat => cat.items).filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className={`h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`h-16 flex items-center border-b border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? 'px-4 justify-center' : 'px-6 justify-between'}`}>
          <Link href="/dashboard" className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-whatsapp-green flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-xl font-bold text-gray-900 dark:text-white dark:text-white">WhatsFlow</span>}
          </Link>
          <div className="flex items-center gap-1">
            <button className="hidden lg:block p-1 rounded hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              <ChevronRight className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5 dark:text-white" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navigation.map((category) => (
            <div key={category.category}>
              {!sidebarCollapsed && (
                <button onClick={() => toggleCategory(category.category)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-300">
                  {category.category}
                  <ChevronDown className={`h-3 w-3 transition-transform ${expandedCategories.includes(category.category) ? '' : '-rotate-90'}`} />
                </button>
              )}
              {expandedCategories.includes(category.category) && (
                <div className="space-y-1 mt-1">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                      <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}
                        className={`flex items-center rounded-lg transition-colors ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'} ${isActive ? 'bg-whatsapp-green/10 text-whatsapp-green' : 'text-gray-600 dark:text-gray-300 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 hover:text-gray-900 dark:text-white dark:hover:text-white'}`}>
                        <Icon className={`h-5 w-5 flex-shrink-0 ${!sidebarCollapsed && 'mr-3'}`} />
                        {!sidebarCollapsed && <span className="font-medium text-sm flex-1">{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Plan Badge */}
        {/* {!sidebarCollapsed && (
          <div className="px-3 mb-2">
            <Link href="/upgrade">
              <div className={`rounded-lg p-2.5 text-center ${user?.plan === 'free' ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'}`}>
                <div className="flex items-center justify-center gap-1">
                  <Crown className={`h-3.5 w-3.5 ${user?.plan === 'free' ? 'text-purple-500' : 'text-green-500'}`} />
                  <span className={`text-xs font-bold ${user?.plan === 'free' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`}>
                    {user?.plan === 'free' ? 'FREE PLAN' : (user?.plan?.toUpperCase() || 'FREE')}
                  </span>
                </div>
                {user?.plan === 'free' && <p className="text-xs text-purple-500 font-medium">Upgrade â†’</p>}
              </div>
            </Link>
          </div>
        )} */}

        {/* Sign Out Button - Small */}
        {/* <div className={`border-t border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? 'p-3' : 'p-3'}`}>
          <button onClick={handleLogout}
            className={`flex items-center justify-center text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-red-500 dark:text-gray-400 dark:text-gray-500 dark:hover:text-red-400 rounded-lg transition-colors w-full ${sidebarCollapsed ? 'p-2' : 'px-3 py-2 gap-2'}`}>
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-xs font-medium">Sign Out</span>}
          </button>
        </div> */}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={`h-16 border-b flex items-center px-4 lg:px-6 flex-shrink-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200'}`}>
          <button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 mr-3" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 dark:text-white" />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input type="text" placeholder="Search..." value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)} onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
              {showSearch && searchQuery && (
                <div className={`absolute top-full mt-1 w-full rounded-lg shadow-lg border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200'}`}>
                  {searchResults.length > 0 ? searchResults.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.name} href={item.href} onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                        className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg`}>
                        <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3" />
                        <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700 dark:text-gray-200'}`}>{item.name}</span>
                      </Link>
                    );
                  }) : <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">No results</div>}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                className={`relative p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                <Bell className="h-5 w-5" />
                {realNotifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
              </button>
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200'}`}>
                  <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
                    <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Notifications</h3>
                    {realNotifications.length > 0 && <span className="text-xs bg-whatsapp-green text-white px-2 py-0.5 rounded-full">{realNotifications.length} new</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {realNotifications.length > 0 ? realNotifications.map((notif) => {
                      const Icon = notif.icon;
                      return (
                        <div key={notif.id} className={`px-4 py-3 border-b last:border-0 cursor-pointer ${darkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 dark:bg-gray-800 border-gray-100'}`}>
                          <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.bg}`}>
                              <Icon className={`h-4 w-4 ${notif.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900 dark:text-white'}`}>{notif.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">{notif.desc}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    }) : <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 text-center py-6">No notifications yet</p>}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-whatsapp-green to-green-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-8 h-8 object-cover" />
                  ) : (
                    <span className="text-white text-sm font-medium">{user?.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
              </button>
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200'}`}>
                  <div className="px-4 py-3 border-b dark:border-gray-700">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{user?.email || ''}</p>
                  </div>
                  <Link href="/settings" onClick={() => setShowUserMenu(false)}
                    className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-800'}`}>
                    <Settings className="h-4 w-4 mr-3" /> Settings
                  </Link>
                  <div className={`border-t dark:border-gray-700 py-1`}>
                    <button onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                      <LogOut className="h-4 w-4 mr-3" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-6 ${darkMode ? 'bg-gray-900' : ''}`}>
          <UsageAlert />
          {children}
        </main>

        {/* Footer */}
        <footer className={`px-6 py-3 border-t text-xs flex items-center justify-between ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400 dark:text-gray-500' : 'bg-white dark:bg-gray-800 border-gray-200 text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
          <span>Â© 2024 WhatsFlow</span>
          <span className="flex items-center gap-2"><Zap className="h-3 w-3 text-whatsapp-green" /> v1.0.0</span>
        </footer>
      </div>
    </div>
  );
}
