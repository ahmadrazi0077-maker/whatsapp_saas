'use client';

import { useState, useEffect } from 'react';

interface Contact {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  tags: string[];
  messageCount: number;
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contact: Omit<Contact, 'id'>) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      const newContact = await response.json();
      setContacts([...contacts, newContact]);
      return newContact;
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      setContacts(contacts.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  };

  return { contacts, loading, addContact, deleteContact, refreshContacts: fetchContacts };
}
