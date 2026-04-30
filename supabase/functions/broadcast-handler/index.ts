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

  // ==================== GET CAMPAIGNS ====================
  if (endpoint === 'campaigns' && method === 'GET') {
    try {
      const { data: campaigns, error } = await supabase
        .from('broadcast_campaigns')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return new Response(JSON.stringify(campaigns), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== CREATE CAMPAIGN ====================
  if (endpoint === 'create' && method === 'POST') {
    try {
      const { name, message, scheduledFor, contactIds } = await req.json()

      if (!message) {
        return new Response(JSON.stringify({ error: 'Message required' }), { status: 400, headers })
      }

      const campaignData: any = {
        name: name || `Broadcast ${new Date().toLocaleDateString()}`,
        message,
        status: scheduledFor ? 'SCHEDULED' : 'DRAFT',
        total_recipients: contactIds?.length || 0,
        workspace_id: workspaceId
      }

      if (scheduledFor) {
        campaignData.scheduled_for = new Date(scheduledFor).toISOString()
      }

      const { data: campaign, error } = await supabase
        .from('broadcast_campaigns')
        .insert(campaignData)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify(campaign), { status: 201, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== UPDATE CAMPAIGN STATUS ====================
  if (endpoint === 'status' && method === 'PUT') {
    try {
      const { campaignId, status } = await req.json()

      const { data: campaign, error } = await supabase
        .from('broadcast_campaigns')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', campaignId)
        .eq('workspace_id', workspaceId)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify(campaign), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== DELETE CAMPAIGN ====================
  if (endpoint === 'delete' && method === 'DELETE') {
    try {
      const { campaignId } = await req.json()

      const { error } = await supabase
        .from('broadcast_campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('workspace_id', workspaceId)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  if (endpoint === 'test' && method === 'GET') {
    return new Response(JSON.stringify({ 
      message: 'Broadcast handler is working!',
      endpoints: ['campaigns', 'create', 'status', 'delete']
    }), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers })
})
