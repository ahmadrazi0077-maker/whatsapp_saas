import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// CORS headers - Must be on every response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
}

// Handle preflight requests immediately
const handleCors = (req: Request): Response | null => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 204, 
      headers: corsHeaders 
    })
  }
  return null
}

async function verifyAuth(authHeader: string | null): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.split(' ')[1]
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub
  } catch {
    return null
  }
}

async function getUserWorkspace(userId: string): Promise<string | null> {
  const { data: user } = await supabase
    .from('users')
    .select('workspace_id')
    .eq('id', userId)
    .single()
  return user?.workspace_id || null
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight first
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const userId = await verifyAuth(req.headers.get('Authorization'))
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401, 
      headers: corsHeaders 
    })
  }

  const workspaceId = await getUserWorkspace(userId!)
  const url = new URL(req.url)
  const endpoint = url.pathname.split('/').pop() || ''

  console.log(`[Contacts Handler] ${req.method} /${endpoint}`)

  // GET ALL CONTACTS
  if (endpoint === 'contacts' && req.method === 'GET') {
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    return new Response(JSON.stringify(contacts), { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  // CREATE CONTACT
  if (endpoint === 'create' && req.method === 'POST') {
    try {
      const { phoneNumber, name, email, tags } = await req.json()

      if (!phoneNumber) {
        return new Response(JSON.stringify({ error: 'Phone number is required' }), { 
          status: 400, 
          headers: corsHeaders 
        })
      }

      const { data: contact, error } = await supabase
        .from('contacts')
        .insert({
          phone_number: phoneNumber,
          name: name || null,
          email: email || null,
          tags: tags || [],
          workspace_id: workspaceId
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify(contact), { 
        status: 201, 
        headers: corsHeaders 
      })
    } catch (error) {
      console.error('Create contact error:', error)
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: corsHeaders 
      })
    }
  }

  // UPDATE CONTACT
  if (endpoint === 'update' && req.method === 'PUT') {
    try {
      const { id, name, email, tags } = await req.json()

      const { data: contact, error } = await supabase
        .from('contacts')
        .update({ 
          name: name || null, 
          email: email || null, 
          tags: tags || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('workspace_id', workspaceId)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify(contact), { 
        status: 200, 
        headers: corsHeaders 
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: corsHeaders 
      })
    }
  }

  // DELETE CONTACT
  if (endpoint === 'delete' && req.method === 'DELETE') {
    try {
      const { id } = await req.json()

      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .eq('workspace_id', workspaceId)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: corsHeaders 
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: corsHeaders 
      })
    }
  }

  // IMPORT CONTACTS
  if (endpoint === 'import' && req.method === 'POST') {
    try {
      const { contacts } = await req.json()

      const contactsToInsert = contacts.map((contact: any) => ({
        phone_number: contact.phoneNumber,
        name: contact.name || null,
        email: contact.email || null,
        tags: contact.tags || [],
        workspace_id: workspaceId
      }))

      const { data: imported, error } = await supabase
        .from('contacts')
        .upsert(contactsToInsert, { onConflict: 'phone_number,workspace_id' })
        .select()

      if (error) throw error

      return new Response(JSON.stringify({ 
        success: true, 
        count: imported.length,
        contacts: imported 
      }), { 
        status: 201, 
        headers: corsHeaders 
      })
    } catch (error) {
      console.error('Import error:', error)
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: corsHeaders 
      })
    }
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), { 
    status: 404, 
    headers: corsHeaders 
  })
})
