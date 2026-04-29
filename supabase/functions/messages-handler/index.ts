import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to verify JWT
async function verifyAuth(authHeader: string | null): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  // Simplified - in production, verify JWT properly
  const token = authHeader.split(' ')[1]
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub
  } catch {
    return null
  }
}

// CORS headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const method = req.method
  const endpoint = url.pathname.split('/').pop() || ''

  if (method === 'OPTIONS') {
    return new Response('ok', { status: 204, headers })
  }

  // Verify authentication
  const userId = await verifyAuth(req.headers.get('Authorization'))
  if (!userId && endpoint !== 'test') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
  }

  // ==================== GET CONVERSATIONS ====================
  if (endpoint === 'conversations' && method === 'GET') {
    try {
      // Get user's workspace
      const { data: user } = await supabase
        .from('users')
        .select('workspace_id')
        .eq('id', userId)
        .single()

      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers })
      }

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
        .eq('workspace_id', user.workspace_id)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify(conversations), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== GET MESSAGES ====================
  if (endpoint === 'messages' && method === 'GET') {
    try {
      const conversationId = url.searchParams.get('conversationId')
      if (!conversationId) {
        return new Response(JSON.stringify({ error: 'Conversation ID required' }), { status: 400, headers })
      }

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return new Response(JSON.stringify(messages), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== SEND MESSAGE ====================
  if (endpoint === 'send' && method === 'POST') {
    try {
      const { conversationId, message, contactId } = await req.json()

      if (!message) {
        return new Response(JSON.stringify({ error: 'Message required' }), { status: 400, headers })
      }

      let convId = conversationId

      // If no conversation, create one
      if (!convId && contactId) {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            contact_id: contactId,
            status: 'ACTIVE',
            last_message: message,
            last_message_at: new Date().toISOString()
          })
          .select()
          .single()

        if (convError) throw convError
        convId = newConv.id
      }

      // Save message
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          body: message,
          from_me: true,
          status: 'SENT'
        })
        .select()
        .single()

      if (error) throw error

      // Update conversation
      await supabase
        .from('conversations')
        .update({
          last_message: message,
          last_message_at: new Date().toISOString()
        })
        .eq('id', convId)

      return new Response(JSON.stringify(newMessage), { status: 201, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== MARK AS READ ====================
  if (endpoint === 'read' && method === 'PUT') {
    try {
      const { conversationId } = await req.json()

      const { error } = await supabase
        .from('messages')
        .update({ status: 'READ' })
        .eq('conversation_id', conversationId)
        .eq('from_me', false)

      if (error) throw error

      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId)

      return new Response(JSON.stringify({ success: true }), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== TEST ====================
  if (endpoint === 'test' && method === 'GET') {
    return new Response(JSON.stringify({ 
      message: 'Messages handler is working!',
      endpoints: ['conversations', 'messages', 'send', 'read']
    }), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers })
})
