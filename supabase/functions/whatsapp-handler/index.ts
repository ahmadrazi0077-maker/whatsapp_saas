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

  // ==================== GET DEVICES ====================
  if (endpoint === 'devices' && method === 'GET') {
    try {
      const { data: devices, error } = await supabase
        .from('devices')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return new Response(JSON.stringify(devices), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== CONNECT DEVICE ====================
  if (endpoint === 'connect' && method === 'POST') {
    try {
      const { name } = await req.json()

      const { data: device, error } = await supabase
        .from('devices')
        .insert({
          name: name || `Device ${Date.now()}`,
          status: 'CONNECTING',
          workspace_id: workspaceId
        })
        .select()
        .single()

      if (error) throw error

      // In production, you would:
      // 1. Generate a QR code for WhatsApp Web connection
      // 2. Store the session data
      // 3. Monitor connection status

      return new Response(JSON.stringify({ 
        success: true,
        device,
        message: 'Device connection initiated. Scan QR code with WhatsApp.'
      }), { status: 201, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== UPDATE DEVICE STATUS ====================
  if (endpoint === 'status' && method === 'PUT') {
    try {
      const { deviceId, status, phoneNumber } = await req.json()

      const { data: device, error } = await supabase
        .from('devices')
        .update({ 
          status, 
          phone_number: phoneNumber,
          updated_at: new Date().toISOString() 
        })
        .eq('id', deviceId)
        .eq('workspace_id', workspaceId)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify(device), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // ==================== DISCONNECT DEVICE ====================
  if (endpoint === 'disconnect' && method === 'POST') {
    try {
      const { deviceId } = await req.json()

      const { error } = await supabase
        .from('devices')
        .update({ status: 'DISCONNECTED', updated_at: new Date().toISOString() })
        .eq('id', deviceId)
        .eq('workspace_id', workspaceId)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  if (endpoint === 'test' && method === 'GET') {
    return new Response(JSON.stringify({ 
      message: 'WhatsApp handler is working!',
      endpoints: ['devices', 'connect', 'status', 'disconnect']
    }), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers })
})
