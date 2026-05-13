'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' });

  useEffect(() => { loadTemplates(); }, []);

  const getToken = () => localStorage.getItem('token');

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_URL}/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setTemplates(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      setError('Please fill in all fields');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = getToken();
      await fetch(`${API_URL}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTemplate),
      });
      setNewTemplate({ name: '', content: '' });
      setShowNew(false);
      setSuccess('Template created!');
      setTimeout(() => setSuccess(''), 3000);
      loadTemplates();
    } catch (err) { setError('Failed to create template'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      const token = getToken();
      await fetch(`${API_URL}/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Template deleted');
      setTimeout(() => setSuccess(''), 3000);
      loadTemplates();
    } catch (err) { setError('Failed to delete'); }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="h-12 w-12 text-whatsapp-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Message Templates</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{templates.length} templates created</p>
        </div>
        <Button icon={<Plus className="h-5 w-5" />} onClick={() => setShowNew(true)}>New Template</Button>
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">{success}</div>}
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      {showNew && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Create Template</h2>
          <div className="space-y-4">
            <Input label="Template Name" value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} placeholder="e.g., Welcome Message" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Message Content</label>
              <textarea rows={4} value={newTemplate.content} onChange={e => setNewTemplate({...newTemplate, content: e.target.value})}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="Use {{name}}, {{amount}}, {{date}} as dynamic variables" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} loading={saving}>Save Template</Button>
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {templates.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-lg mb-4">No templates yet</p>
          <Button onClick={() => setShowNew(true)} icon={<Plus className="h-5 w-5" />}>Create Your First Template</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map(template => (
            <Card key={template.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{template.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Created {new Date(template.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleCopy(template.content)} className="p-2 hover:bg-gray-100 dark:bg-gray-700 rounded-lg" title="Copy content">
                    <Copy className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(template.id)} className="p-2 hover:bg-red-50 rounded-lg" title="Delete template">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-mono whitespace-pre-wrap">{template.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
