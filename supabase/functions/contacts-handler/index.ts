import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

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

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const method = req.method
  const endpoint = url.pathname.split('/').pop() || ''

  if (method === 'OPTIONS') {
    return new Response('ok', { status: 204, headers })
  }

  const userId = await verifyAuth(req.headers.get('Authorization'))
  if (!userId && endpoint !== 'test') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
  }

  const workspaceId = await getUserWorkspace(userId!)

  // ==================== GET ALL CONTACTS ====================
  if (endpoint === 'contacts' && method === 'GET') {
    try {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return new Response(JSON.stringify(contacts), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== GET SINGLE CONTACT ====================
  if (endpoint.match(/^[0-9a-f-]+$/) && method === 'GET') {
    try {
      const contactId = endpoint
      const { data: contact, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .eq('workspace_id', workspaceId)
        .single()

      if (error) throw error
      if (!contact) {
        return new Response(JSON.stringify({ error: 'Contact not found' }), { status: 404, headers })
      }

      return new Response(JSON.stringify(contact), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== CREATE CONTACT ====================
  if (endpoint === 'create' && method === 'POST') {
    try {
      const { phoneNumber, name, email, tags } = await req.json()

      if (!phoneNumber) {
        return new Response(JSON.stringify({ error: 'Phone number required' }), { status: 400, headers })
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

      return new Response(JSON.stringify(contact), { status: 201, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== UPDATE CONTACT ====================
  if (endpoint === 'update' && method === 'PUT') {
    try {
      const { id, name, email, tags } = await req.json()

      const { data: contact, error } = await supabase
        .from('contacts')
        .update({ name, email, tags, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('workspace_id', workspaceId)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify(contact), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== DELETE CONTACT ====================
  if (endpoint === 'delete' && method === 'DELETE') {
    try {
      const { id } = await req.json()

      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .eq('workspace_id', workspaceId)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== IMPORT CONTACTS ====================
  if (endpoint === 'import' && method === 'POST') {
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
        .insert(contactsToInsert)
        .select()

      if (error) throw error

      return new Response(JSON.stringify({ 
        success: true, 
        count: imported.length,
        contacts: imported 
      }), { status: 201, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  if (endpoint === 'test' && method === 'GET') {
    return new Response(JSON.stringify({ 
      message: 'Contacts handler is working!',
      endpoints: ['contacts', 'create', 'update', 'delete', 'import']
    }), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers })
})
