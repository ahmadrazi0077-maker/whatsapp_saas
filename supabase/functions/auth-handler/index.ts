import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts'
import { create, verify, getNumericDate } from 'https://deno.land/x/djwt@2.8/mod.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const jwtSecret = Deno.env.get('JWT_SECRET') || 'your-secret-key-min-32-chars-long!!'
const encoder = new TextEncoder()
const keyData = encoder.encode(jwtSecret)
const cryptoKey = await crypto.subtle.importKey(
  'raw',
  keyData,
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify']
)

// CORS headers - allow all origins for testing
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
}

// Helper to create JWT
async function createJWT(userId: string, workspaceId: string, email: string) {
  const payload = {
    sub: userId,
    workspace_id: workspaceId,
    email: email,
    exp: getNumericDate(60 * 60 * 24 * 7) // 7 days
  }
  return await create({ alg: 'HS256', typ: 'JWT' }, payload, cryptoKey)
}

// Helper to verify JWT
async function verifyJWT(token: string) {
  try {
    const payload = await verify(token, cryptoKey)
    return payload
  } catch (e) {
    console.error('JWT verification failed:', e)
    return null
  }
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const path = url.pathname
  
  console.log(`[Auth Handler] ${req.method} ${path}`)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 204,
      headers: corsHeaders 
    })
  }

  // ==================== HEALTH CHECK ====================
  if (path === '/health' && req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
      { headers: corsHeaders, status: 200 }
    )
  }

  // ==================== REGISTER ====================
  if (path === '/register' && req.method === 'POST') {
    try {
      const { email, password, name, workspaceName } = await req.json()
      console.log('Register attempt:', { email, name })

      // Validate
      if (!email || !password || !name) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: email, password, name' }),
          { headers: corsHeaders, status: 400 }
        )
      }

      // Check existing user
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'User already exists' }),
          { headers: corsHeaders, status: 400 }
        )
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password)

      // Create workspace
      const workspaceSlug = workspaceName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `workspace-${Date.now()}`
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: workspaceName || `${name}'s Workspace`,
          slug: workspaceSlug
        })
        .select()
        .single()

      if (workspaceError) {
        console.error('Workspace creation error:', workspaceError)
        return new Response(
          JSON.stringify({ error: 'Failed to create workspace' }),
          { headers: corsHeaders, status: 500 }
        )
      }

      // Create user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email,
          password: hashedPassword,
          name,
          workspace_id: workspace.id,
          role: 'ADMIN'
        })
        .select('id, email, name, role, workspace_id, created_at')
        .single()

      if (userError) {
        console.error('User creation error:', userError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user' }),
          { headers: corsHeaders, status: 500 }
        )
      }

      // Generate JWT
      const jwt = await createJWT(user.id, workspace.id, user.email)

      return new Response(
        JSON.stringify({ 
          token: jwt, 
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            workspaceId: user.workspace_id,
            createdAt: user.created_at
          }
        }),
        { headers: corsHeaders, status: 201 }
      )
    } catch (error) {
      console.error('Registration error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: corsHeaders, status: 500 }
      )
    }
  }

  // ==================== LOGIN ====================
  if (path === '/login' && req.method === 'POST') {
    try {
      const { email, password } = await req.json()
      console.log('Login attempt:', { email })

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, password, role, workspace_id, created_at')
        .eq('email', email)
        .single()

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { headers: corsHeaders, status: 401 }
        )
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { headers: corsHeaders, status: 401 }
        )
      }

      const jwt = await createJWT(user.id, user.workspace_id, user.email)

      return new Response(
        JSON.stringify({ 
          token: jwt, 
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            workspaceId: user.workspace_id,
            createdAt: user.created_at
          }
        }),
        { headers: corsHeaders, status: 200 }
      )
    } catch (error) {
      console.error('Login error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: corsHeaders, status: 500 }
      )
    }
  }

  // ==================== GET ME (Protected) ====================
  if (path === '/me' && req.method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      console.log('Auth header:', authHeader ? 'Present' : 'Missing')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'No token provided' }),
          { headers: corsHeaders, status: 401 }
        )
      }

      const token = authHeader.split(' ')[1]
      const payload = await verifyJWT(token)
      
      if (!payload || !payload.sub) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired token' }),
          { headers: corsHeaders, status: 401 }
        )
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, role, workspace_id, created_at')
        .eq('id', payload.sub)
        .single()

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { headers: corsHeaders, status: 404 }
        )
      }

      return new Response(
        JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspaceId: user.workspace_id,
          createdAt: user.created_at
        }),
        { headers: corsHeaders, status: 200 }
      )
    } catch (error) {
      console.error('Get me error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: corsHeaders, status: 500 }
      )
    }
  }

  return new Response(
    JSON.stringify({ error: `Not found: ${path}` }),
    { headers: corsHeaders, status: 404 }
  )
})
