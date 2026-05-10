'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Shield, User, Trash2, Mail, Loader2, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  useEffect(() => { loadTeam(); }, []);

  const getToken = () => localStorage.getItem('token');

  const loadTeam = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_URL}/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMembers(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleInvite = async () => {
    if (!inviteEmail) { setError('Please enter an email'); return; }
    setSaving(true);
    setError('');
    try {
      const token = getToken();
      await fetch(`${API_URL}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      setInviteEmail('');
      setShowInvite(false);
      setSuccess('Team member invited!');
      setTimeout(() => setSuccess(''), 3000);
      loadTeam();
    } catch (err) { setError('Failed to invite member'); }
    finally { setSaving(false); }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this team member?')) return;
    try {
      const token = getToken();
      await fetch(`${API_URL}/team/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Member removed');
      setTimeout(() => setSuccess(''), 3000);
      loadTeam();
    } catch (err) { setError('Failed to remove'); }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <Button icon={<Plus className="h-5 w-5" />} onClick={() => setShowInvite(true)}>Invite Member</Button>
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">{success}</div>}
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      {showInvite && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Invite Team Member</h2>
          <div className="space-y-4">
            <Input label="Email Address" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Role</label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Admins can manage devices and broadcasts. Members can view only.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInvite} loading={saving}>Send Invitation</Button>
              <Button variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {members.map(member => (
          <Card key={member.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${member.role === 'Owner' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  {member.role === 'Owner' ? <Crown className="h-6 w-6 text-purple-500" /> : <User className="h-6 w-6 text-blue-500" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {member.name || member.email?.split('@')[0]}
                    {member.role === 'Owner' && <span className="text-xs text-purple-500 ml-2">(You)</span>}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    <Mail className="h-3 w-3" /> {member.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  member.role === 'Owner' ? 'bg-purple-100 text-purple-700' :
                  member.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {member.role}
                </span>
                {member.role !== 'Owner' && (
                  <button onClick={() => handleRemove(member.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400" title="Remove member">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
