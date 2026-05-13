'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Play, Pause, ArrowRight, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

<<<<<<< HEAD
const API_URL = '${process.env.NEXT_PUBLIC_API_URL}';
=======
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
>>>>>>> 984d5a8205ee3e6ea073c4bbafde4a7ee7130099

export default function ChatbotPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newRule, setNewRule] = useState({ keyword: '', reply: '', matchType: 'contains' });

  useEffect(() => { loadRules(); }, []);

  const getToken = () => localStorage.getItem('token');

  const loadRules = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_URL}/chatbot/rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRules(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newRule.keyword || !newRule.reply) {
      setError('Please fill keyword and reply');
      return;
    }
    setSaving(true);
    try {
      const token = getToken();
      await fetch(`${API_URL}/chatbot/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newRule),
      });
      setNewRule({ keyword: '', reply: '', matchType: 'contains' });
      setShowNew(false);
      setSuccess('Rule added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      loadRules();
    } catch (err) { setError('Failed to create rule'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      const token = getToken();
      await fetch(`${API_URL}/chatbot/rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !currentActive }),
      });
      loadRules();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    try {
      const token = getToken();
      await fetch(`${API_URL}/chatbot/rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Rule deleted');
      setTimeout(() => setSuccess(''), 3000);
      loadRules();
    } catch (err) { setError('Failed to delete'); }
  };

  const activeRules = rules.filter(r => r.active).length;
  const pausedRules = rules.filter(r => !r.active).length;

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ChatBot Rules</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Auto-reply to incoming messages based on keywords</p>
        </div>
        <Button icon={<Plus className="h-5 w-5" />} onClick={() => setShowNew(true)}>Add Rule</Button>
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">{success}</div>}
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{rules.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Rules</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{activeRules}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Active</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">{pausedRules}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Paused</div>
        </Card>
      </div>

      {showNew && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">New Auto-Reply Rule</h2>
          <div className="space-y-4">
            <Input label="Keyword/Trigger Word" value={newRule.keyword} onChange={e => setNewRule({...newRule, keyword: e.target.value})} placeholder="e.g., price, help, hello" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Match Type</label>
              <select value={newRule.matchType} onChange={e => setNewRule({...newRule, matchType: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg">
                <option value="contains">Contains</option>
                <option value="exact">Exact Match</option>
                <option value="startsWith">Starts With</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Auto Reply Message</label>
              <textarea rows={3} value={newRule.reply} onChange={e => setNewRule({...newRule, reply: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" placeholder="Type the auto-reply message..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} loading={saving}>Save Rule</Button>
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {rules.length === 0 ? (
        <Card className="p-12 text-center">
          <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-lg mb-4">No auto-reply rules yet</p>
          <Button onClick={() => setShowNew(true)} icon={<Plus className="h-5 w-5" />}>Create First Rule</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <Card key={rule.id} className={`p-6 transition-all ${!rule.active ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggle(rule.id, rule.active)} className={`p-2 rounded-lg transition-colors ${rule.active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:bg-gray-700'}`} title={rule.active ? 'Pause rule' : 'Activate rule'}>
                    {rule.active ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white text-lg">"{rule.keyword}"</span>
                    <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize">{rule.matchType}</span>
                    {!rule.active && <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">Paused</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(rule.id)} className="p-2 hover:bg-red-50 rounded-lg" title="Delete rule">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <ArrowRight className="h-4 w-4 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <p className="whitespace-pre-wrap">{rule.reply}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
