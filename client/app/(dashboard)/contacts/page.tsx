'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Tag, Phone, Mail, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
  return phone;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewContact, setShowNewContact] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phoneNumber: '', email: '', tags: '' });
  const [importData, setImportData] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importSuccess, setImportSuccess] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadContacts();
  }, []);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
const [selectAll, setSelectAll] = useState(false);
const [showBulkActions, setShowBulkActions] = useState(false);
const [bulkTag, setBulkTag] = useState('');

// Add bulk action handlers
const toggleSelectAll = () => {
  if (selectAll) {
    setSelectedContacts([]);
  } else {
    setSelectedContacts(filteredContacts.map((c: any) => c.id));
  }
  setSelectAll(!selectAll);
};

const toggleContact = (id: string) => {
  setSelectedContacts(prev => 
    prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
  );
};

const handleBulkDelete = async () => {
  if (!confirm(`Delete ${selectedContacts.length} contacts?`)) return;
  for (const id of selectedContacts) {
    await api.contacts.delete(id);
  }
  setSelectedContacts([]);
  setSelectAll(false);
  loadContacts();
};

const handleBulkTag = async () => {
  // Add tag to selected contacts
  for (const id of selectedContacts) {
 const contact = contacts.find(c => c.id === id);
    const currentTags = contact?.tags || [];
    if (!currentTags.includes(bulkTag)) {
      await api.contacts.create({ ...contact, tags: [...currentTags, bulkTag] });
    }
  }
  setBulkTag('');
  setShowBulkActions(false);
  loadContacts();
};

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await api.contacts.getAll();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    try {
      await api.contacts.create({
        name: newContact.name,
        phoneNumber: newContact.phoneNumber,
        email: newContact.email,
        tags: newContact.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      });
      setShowNewContact(false);
      setNewContact({ name: '', phoneNumber: '', email: '', tags: '' });
      loadContacts();
    } catch (error) {
      console.error('Failed to create contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.contacts.delete(id);
        loadContacts();
      } catch (error) {
        console.error('Failed to delete contact');
      }
    }
  };

  // CSV Parsing
  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const results: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        
        // Map common CSV column names
        const contact = {
          name: row.name || row['full name'] || row.fullname || row.contact_name || '',
          phoneNumber: row.phone || row.phonenumber || row['phone number'] || row.mobile || row.contact || '',
          email: row.email || row['email address'] || row.e_mail || '',
          tags: row.tags || row.tag || row.group || row.category || '',
        };
        
        if (contact.name && contact.phoneNumber) {
          results.push(contact);
        }
      }
    }

    return results;
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsedData = parseCSV(text);
      
      if (parsedData.length === 0) {
        setImportError('No valid contacts found. Please check your CSV format.');
        return;
      }
      
      setImportData(parsedData);
    };
    reader.onerror = () => {
      setImportError('Failed to read file. Please try again.');
    };
    reader.readAsText(file);
  };

  // Import Contacts to Database
  const handleImportContacts = async () => {
    if (importData.length === 0) {
      setImportError('No contacts to import.');
      return;
    }

    setImportLoading(true);
    setImportError('');
    let successCount = 0;
    let failCount = 0;

    for (const contact of importData) {
      try {
        const tags = contact.tags 
          ? contact.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : [];
        
        await api.contacts.create({
          name: contact.name,
          phoneNumber: contact.phoneNumber,
          email: contact.email || '',
          tags,
        });
        successCount++;
      } catch (err) {
        failCount++;
        console.error(`Failed to import contact: ${contact.name}`);
      }
    }

    setImportLoading(false);
    setImportSuccess(`Successfully imported ${successCount} contacts. ${failCount > 0 ? `Failed: ${failCount}` : ''}`);
    setImportData([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    loadContacts();
  };

  // Download Sample CSV
  const downloadSampleCSV = () => {
    const csvContent = 'name,phoneNumber,email,tags\nJohn Doe,+1234567890,john@example.com,VIP\nJane Smith,+1987654321,jane@example.com,Customer\nMike Wilson,+1122334455,mike@example.com,Lead';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_contacts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export Contacts
  const handleExportContacts = () => {
    const csvContent = 'name,phoneNumber,email,tags\n' + 
      contacts.map(c => `${c.name},${c.phoneNumber},${c.email || ''},${(c.tags || []).join(';')}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredContacts = contacts.filter((contact: any) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phoneNumber.includes(searchTerm) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-green"></div>
      </div>
    );
  }
// Add these state variables at the top

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your contacts ({contacts.length} total)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Download className="h-5 w-5" />} onClick={handleExportContacts}>
            Export
          </Button>
          <Button variant="outline" icon={<Upload className="h-5 w-5" />} onClick={() => setShowImport(true)}>
            Import CSV
          </Button>
          <Button icon={<Plus className="h-5 w-5" />} onClick={() => setShowNewContact(true)}>
            Add Contact
          </Button>
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Import Contacts from CSV</h2>
            <button onClick={() => { setShowImport(false); setImportData([]); setImportError(''); setImportSuccess(''); }} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300">âœ•</button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <strong>CSV Format:</strong> Your file should have columns: <code>name</code>, <code>phoneNumber</code>, <code>email</code> (optional), <code>tags</code> (optional, comma-separated)
              <button onClick={downloadSampleCSV} className="block mt-2 text-blue-600 underline hover:text-blue-800">
                Download sample CSV
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Select a CSV file to import</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block mx-auto text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-whatsapp-green/10 file:text-whatsapp-green hover:file:bg-whatsapp-green/20"
              />
            </div>

            {importError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {importError}
              </div>
            )}

            {importSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {importSuccess}
              </div>
            )}

            {importData.length > 0 && (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>{importData.length} contacts</strong> ready to import
                </div>
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Phone</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.slice(0, 5).map((contact, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{contact.name}</td>
                          <td className="p-2">{contact.phoneNumber}</td>
                          <td className="p-2">{contact.email}</td>
                          <td className="p-2">{contact.tags}</td>
                        </tr>
                      ))}
                      {importData.length > 5 && (
                        <tr>
                          <td colSpan={4} className="p-2 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            ... and {importData.length - 5} more
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleImportContacts} loading={importLoading}>
                    Import {importData.length} Contacts
                  </Button>
                  <Button variant="ghost" onClick={() => { setImportData([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* New Contact Modal */}
      {showNewContact && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Contact</h2>
          <div className="space-y-4">
            <Input
              label="Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            />
            <Input
              label="Phone Number"
              value={newContact.phoneNumber}
              onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            />
            <Input
              label="Tags (comma-separated)"
              value={newContact.tags}
              onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
            />
            <div className="flex space-x-2">
              <Button onClick={handleCreateContact}>Save Contact</Button>
              <Button variant="ghost" onClick={() => setShowNewContact(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-whatsapp-green focus:ring-2 focus:ring-whatsapp-green/20"
        />
      </div>

      {/* Contacts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact: any) => (
          <Card key={contact.id} className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-whatsapp-green/10 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-whatsapp-green">
                  {contact.name?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  <Phone className="h-3 w-3 mr-1" />
                  {formatPhoneNumber(contact.phoneNumber)}
                </div>
              </div>
            </div>
            
            {contact.email && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-3">
                <Mail className="h-3 w-3 mr-1" />
                {contact.email}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {contact.tags?.map((tag: string) => (
                <span key={tag} className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => handleDeleteContact(contact.id)}
              className="text-red-500 text-sm hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 inline mr-1" />
              Delete
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
