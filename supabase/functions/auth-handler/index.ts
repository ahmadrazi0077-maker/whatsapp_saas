import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts'
import { create } from 'https://deno.land/x/djwt/mod.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const encoder = new TextEncoder()
const key = await crypto.subtle.importKey(
  'raw',
  encoder.encode(Deno.env.get('JWT_SECRET') || 'secret'),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify']
)

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const path = url.pathname

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  // REGISTER
  if (path === '/register' && req.method === 'POST') {
    try {
      const { email, password, name, workspaceName } = await req.json()

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'User already exists' }),
          { status: 400, headers }
        )
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password)

      // Create workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: workspaceName || `${name}'s Workspace`,
          slug: workspaceName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `${Date.now()}`
        })
        .select()
        .single()

      if (workspaceError) throw workspaceError

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
        .select('id, email, name, role, workspace_id')
        .single()

      if (userError) throw userError

      // Generate JWT
      const jwt = await create({ alg: 'HS256', typ: 'JWT' }, {
        sub: user.id,
        workspace_id: workspace.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
      }, key)

      return new Response(
        JSON.stringify({ token: jwt, user }),
        { status: 201, headers }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers }
      )
    }
  }

  // LOGIN
  if (path === '/login' && req.method === 'POST') {
    try {
      const { email, password } = await req.json()

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, password, role, workspace_id')
        .eq('email', email)
        .single()

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers }
        )
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers }
        )
      }

      const { password: _, ...userWithoutPassword } = user

      const jwt = await create({ alg: 'HS256', typ: 'JWT' }, {
        sub: user.id,
        workspace_id: user.workspace_id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
      }, key)

      return new Response(
        JSON.stringify({ token: jwt, user: userWithoutPassword }),
        { status: 200, headers }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers }
      )
    }
  }

  // GET ME (Protected)
  if (path === '/me' && req.method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers }
        )
      }

      const token = authHeader.split(' ')[1]
      // Verify token and get user...
      
      return new Response(
        JSON.stringify({ id: 'user-id', email: 'test@example.com' }),
        { status: 200, headers }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers }
      )
    }
  }

  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers }
  )
})
