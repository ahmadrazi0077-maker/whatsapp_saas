import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts'
import { create, verify, getNumericDate } from 'https://deno.land/x/djwt@2.8/mod.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const jwtSecret = Deno.env.get('JWT_SECRET') || 'your-secret-key'
const encoder = new TextEncoder()
const keyData = encoder.encode(jwtSecret)
const cryptoKey = await crypto.subtle.importKey(
  'raw',
  keyData,
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify']
)

async function createJWT(userId: string, workspaceId: string, email: string) {
  const payload = {
    sub: userId,
    workspace_id: workspaceId,
    email: email,
    exp: getNumericDate(60 * 60 * 24 * 7)
  }
  return await create({ alg: 'HS256', typ: 'JWT' }, payload, cryptoKey)
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const path = url.pathname

  // Health check
  if (path === '/health' && req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
  }

  // Register
  if (path === '/register' && req.method === 'POST') {
    try {
      const { email, password, name, workspaceName } = await req.json()

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existingUser) {
        return new Response(JSON.stringify({ error: 'User already exists' }), { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(password)

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
        return new Response(JSON.stringify({ error: 'Failed to create workspace' }), { status: 500 })
      }

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
        return new Response(JSON.stringify({ error: 'Failed to create user' }), { status: 500 })
      }

      const jwt = await createJWT(user.id, workspace.id, user.email)

      return new Response(JSON.stringify({ 
        token: jwt, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspaceId: user.workspace_id,
          createdAt: user.created_at
        }
      }), { status: 201 })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
  }

  // Login
  if (path === '/login' && req.method === 'POST') {
    try {
      const { email, password } = await req.json()

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, password, role, workspace_id, created_at')
        .eq('email', email)
        .single()

      if (error || !user) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
      }

      const jwt = await createJWT(user.id, user.workspace_id, user.email)

      return new Response(JSON.stringify({ 
        token: jwt, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspaceId: user.workspace_id,
          createdAt: user.created_at
        }
      }), { status: 200 })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
  }

  // Get Me
  if (path === '/me' && req.method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 })
      }

      const token = authHeader.split(' ')[1]
      const payload = await verify(token, cryptoKey)
      
      if (!payload || !payload.sub) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, role, workspace_id, created_at')
        .eq('id', payload.sub)
        .single()

      if (error || !user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
      }

      return new Response(JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: user.workspace_id,
        createdAt: user.created_at
      }), { status: 200 })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
})
