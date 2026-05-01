import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 204, headers: corsHeaders })
  }

  const url = new URL(req.url)
  const endpoint = url.pathname.split('/').pop() || ''
  
  console.log(`[Contacts Handler] ${req.method} /${endpoint}`)

  // GET all contacts
  if (endpoint === 'contacts' && req.method === 'GET') {
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
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

  // CREATE contact
  if (endpoint === 'create' && req.method === 'POST') {
    try {
      const { phoneNumber, name, email, tags } = await req.json()

      const { data: contact, error } = await supabase
        .from('contacts')
        .insert({
          phone_number: phoneNumber,
          name: name || null,
          email: email || null,
          tags: tags || []
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify(contact), { 
        status: 201, 
        headers: corsHeaders 
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: corsHeaders 
      })
    }
  }

  // PING endpoint for testing
  if (endpoint === 'ping' && req.method === 'GET') {
    return new Response(JSON.stringify({ 
      message: 'Contacts handler is working!',
      timestamp: new Date().toISOString()
    }), { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), { 
    status: 404, 
    headers: corsHeaders 
  })
})
