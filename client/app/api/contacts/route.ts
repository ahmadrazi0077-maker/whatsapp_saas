export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// Mock contacts data
const mockContacts = [
  {
    id: '1',
    phone_number: '+923001234567',
    name: 'Ahmed Raza',
    email: 'ahmed@example.com',
    tags: ['customer', 'vip'],
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    phone_number: '+923008765432',
    name: 'Sarah Khan',
    email: 'sarah@example.com',
    tags: ['lead'],
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    phone_number: '+923005555555',
    name: 'Tech Solutions',
    email: 'info@techsolutions.com',
    tags: ['business', 'partner'],
    created_at: new Date().toISOString()
  },
];

export async function GET(req: NextRequest) {
  // Return mock data
  return NextResponse.json(mockContacts)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newContact = {
      id: Date.now().toString(),
      phone_number: body.phoneNumber,
      name: body.name || '',
      email: body.email || '',
      tags: body.tags || [],
      created_at: new Date().toISOString()
    }
    
    // Add to mock array (in memory only)
    mockContacts.unshift(newContact)
    
    return NextResponse.json(newContact, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
