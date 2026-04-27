'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  TagIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  tags: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  messageCount: number;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Ahmed Raza',
      phoneNumber: '+92 300 1234567',
      email: 'ahmed@example.com',
      tags: ['customer', 'premium'],
      messageCount: 45,
    },
    {
      id: '2',
      name: 'Sarah Khan',
      phoneNumber: '+92 321 7654321',
      email: 'sarah@example.com',
      tags: ['lead'],
      messageCount: 12,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast.success('Contact deleted');
  };

  const deleteMultiple = () => {
    setContacts(contacts.filter(c => !selectedContacts.includes(c.id)));
    setSelectedContacts([]);
    toast.success(`${selectedContacts.length} contacts deleted`);
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const handleImport = () => {
    toast.success('Import feature coming soon');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your contacts and customer lists</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="h-5 w-5" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>
        
        {selectedContacts.length > 0 && (
          <button
            onClick={deleteMultiple}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <TrashIcon className="h-5 w-5" />
            Delete ({selectedContacts.length})
          </button>
        )}
      </div>

      {/* Contacts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Tags</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Messages</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredContacts.map((contact, index) => (
                <motion.tr
                  key={contact.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => {
                        if (selectedContacts.includes(contact.id)) {
                          setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                        } else {
                          setSelectedContacts([...selectedContacts, contact.id]);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{contact.name || '—'}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400">{contact.phoneNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{contact.email || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{contact.messageCount}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition">
                        <TagIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No contacts found</p>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Contact</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              toast.success('Contact added successfully');
              setShowAddModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="customer, lead, vip"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Add Contact
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
