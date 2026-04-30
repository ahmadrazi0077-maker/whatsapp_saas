export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://xsxtbztyqjmlwfnibtdm.supabase.co'
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const authHeader = req.headers.get('authorization') || ''
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const text = await file.text()
    const rows = text.split('\n')
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

    const response = await fetch(`${EDGE_FUNCTIONS_URL}/contacts-handler/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ contacts }),
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
