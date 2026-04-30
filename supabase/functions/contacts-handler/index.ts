import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 204, 
      headers: corsHeaders 
    })
  }

  const url = new URL(req.url)
  const endpoint = url.pathname.split('/').pop() || ''

  // Simple response for testing
  if (endpoint === 'ping') {
    return new Response(JSON.stringify({ message: 'pong' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }

  // Get all contacts (simplified)
  if (endpoint === 'contacts' && req.method === 'GET') {
    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }

  // Create contact (simplified)
  if (endpoint === 'create' && req.method === 'POST') {
    try {
      const body = await req.json()
      return new Response(JSON.stringify({ 
        id: Date.now().toString(),
        ...body,
        created_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      })
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to create' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 404
  })
})
