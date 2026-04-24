'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AutoReplyRule {
  id?: string;
  name: string;
  keyword: string;
  response: string;
  matchType: 'CONTAINS' | 'EXACT' | 'STARTS_WITH' | 'ENDS_WITH';
  deviceId: string;
  isActive: boolean;
  delaySeconds: number;
}

export default function RuleBuilder() {
  const { t } = useTranslation(['automation']);
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<AutoReplyRule>({
    name: '',
    keyword: '',
    response: '',
    matchType: 'CONTAINS',
    deviceId: '',
    isActive: true,
    delaySeconds: 0,
  });

  useState(() => {
    fetchRules();
    fetchDevices();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/automation/rules');
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/whatsapp/devices');
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingRule 
        ? `/api/automation/rules/${editingRule.id}`
        : '/api/automation/rules';
      
      const method = editingRule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast.success(editingRule ? 'Rule updated' : 'Rule created');
        setShowForm(false);
        setEditingRule(null);
        setFormData({
          name: '',
          keyword: '',
          response: '',
          matchType: 'CONTAINS',
          deviceId: '',
          isActive: true,
          delaySeconds: 0,
        });
        fetchRules();
      } else {
        throw new Error('Failed to save rule');
      }
    } catch (error) {
      toast.error('Failed to save rule');
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      await fetch(`/api/automation/rules/${id}`, { method: 'DELETE' });
      toast.success('Rule deleted');
      fetchRules();
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  const toggleRuleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/automation/rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchRules();
    } catch (error) {
      toast.error('Failed to update rule status');
    }
  };

  const getMatchTypeText = (type: string) => {
    switch (type) {
      case 'CONTAINS': return 'Contains';
      case 'EXACT': return 'Exact match';
      case 'STARTS_WITH': return 'Starts with';
      case 'ENDS_WITH': return 'Ends with';
      default: return type;
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading rules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Auto-Reply Rules</h2>
          <p className="text-gray-600 text-sm mt-1">
            Create rules to automatically respond to messages
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-gray-500">No auto-reply rules yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-blue-600 hover:underline"
            >
              Create your first rule
            </button>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="bg-white border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getMatchTypeText(rule.matchType)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Keyword:</span>
                      <p className="font-medium">"{rule.keyword}"</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Response:</span>
                      <p className="text-gray-700">{rule.response}</p>
                    </div>
                    {rule.delaySeconds > 0 && (
                      <div>
                        <span className="text-gray-500">Delay:</span>
                        <p>{rule.delaySeconds} seconds</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Device:</span>
                      <p>{devices.find(d => d.id === rule.deviceId)?.phoneNumber || 'All devices'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleRuleStatus(rule.id!, rule.isActive)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      rule.isActive 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {rule.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingRule(rule);
                      setFormData(rule);
                      setShowForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">
                {editingRule ? 'Edit Rule' : 'Create New Rule'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Price Inquiry Response"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Trigger Keyword *</label>
                <input
                  type="text"
                  required
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., price, hello, support"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Match Type</label>
                <select
                  value={formData.matchType}
                  onChange={(e) => setFormData({ ...formData, matchType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CONTAINS">Contains keyword</option>
                  <option value="EXACT">Exact match</option>
                  <option value="STARTS_WITH">Starts with keyword</option>
                  <option value="ENDS_WITH">Ends with keyword</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Response Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.response}
                  onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your automated response here..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Device (Optional)</label>
                <select
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Devices</option>
                  {devices.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.phoneNumber} - {device.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Delay (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.delaySeconds}
                  onChange={(e) => setFormData({ ...formData, delaySeconds: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Wait before sending response (0 = instant)
                </p>
              </div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm">Enable this rule immediately</span>
              </label>
              
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRule(null);
                  }}
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