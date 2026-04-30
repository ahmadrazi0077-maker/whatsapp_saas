export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const text = await file.text()
    const rows = text.split('\n')
    const headers = rows[0].split(',')
    
    const contacts = []
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',')
      if (values.length >= 2 && values[0] && values[1]) {
        contacts.push({
          phoneNumber: values[0].trim(),
          name: values[1]?.trim() || '',
          email: values[2]?.trim() || '',
          tags: values[3]?.trim() ? values[3].trim().split('|') : []
        })
      }
    }

    // Save to Supabase
    const token = req.headers.get('authorization')
    const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
    const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`
    
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/contacts-handler/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || ''
      },
      body: JSON.stringify({ contacts })
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
