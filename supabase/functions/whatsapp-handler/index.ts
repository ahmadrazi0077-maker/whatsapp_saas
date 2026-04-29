import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  const url = new URL(req.url)
  const path = url.pathname

  // Get devices
  if (path === '/devices' && req.method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
      }

      const token = authHeader.split(' ')[1]
      // Decode token to get workspace_id
      // For demo, using a placeholder

      const { data: devices, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify(devices), { status: 200, headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  // Connect device
  if (path === '/connect' && req.method === 'POST') {
    try {
      // Generate QR code logic here
      const { data: device, error } = await supabase
        .from('devices')
        .insert({
          name: `Device ${Date.now()}`,
          status: 'CONNECTING'
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ deviceId: device.id, status: 'CONNECTING' }),
        { status: 200, headers }
      )
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
    }
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers })
})
