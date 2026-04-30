import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 204, headers: corsHeaders })
  }

  const userId = await verifyAuth(req.headers.get('Authorization'))
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  const workspaceId = await getUserWorkspace(userId!)
  const url = new URL(req.url)
  const endpoint = url.pathname.split('/').pop() || ''

  // ========== GET CONVERSATIONS ==========
  if (endpoint === 'conversations' && req.method === 'GET') {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        last_message,
        last_message_at,
        status,
        unread_count,
        contact:contacts(id, name, phone_number)
      `)
      .eq('workspace_id', workspaceId)
      .order('last_message_at', { ascending: false })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify(conversations), { status: 200, headers: corsHeaders })
  }

  // ========== GET MESSAGES ==========
  if (endpoint === 'messages' && req.method === 'GET') {
    const conversationId = url.searchParams.get('conversationId')
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify(messages), { status: 200, headers: corsHeaders })
  }

  // ========== SEND MESSAGE ==========
  if (endpoint === 'send' && req.method === 'POST') {
    try {
      const { conversationId, message, contactId } = await req.json()

      let convId = conversationId

      if (!convId && contactId) {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            contact_id: contactId,
            workspace_id: workspaceId,
            status: 'ACTIVE',
            last_message: message,
            last_message_at: new Date().toISOString()
          })
          .select()
          .single()

        if (convError) throw convError
        convId = newConv.id
      }

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          body: message,
          from_me: true,
          status: 'sent'
        })
        .select()
        .single()

      if (error) throw error

      await supabase
        .from('conversations')
        .update({
          last_message: message,
          last_message_at: new Date().toISOString()
        })
        .eq('id', convId)

      return new Response(JSON.stringify(newMessage), { status: 201, headers: corsHeaders })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
  }

  // ========== MARK AS READ ==========
  if (endpoint === 'read' && req.method === 'PUT') {
    try {
      const { conversationId } = await req.json()

      await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('conversation_id', conversationId)
        .eq('from_me', false)

      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId)

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers: corsHeaders })
})
