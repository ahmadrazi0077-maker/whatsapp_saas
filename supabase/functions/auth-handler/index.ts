import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-super-secret-key-min-32-chars'

// Encode JWT payload to base64url
function base64urlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// Create JWT using Web Crypto API
async function createJWT(payload: any): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(payload))
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`
  
  const encoder = new TextEncoder()
  const keyData = encoder.encode(JWT_SECRET)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(signatureInput)
  )
  
  const encodedSignature = base64urlEncode(String.fromCharCode(...new Uint8Array(signature)))
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
}

// Verify JWT
async function verifyJWT(token: string): Promise<any | null> {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.')
    
    const signatureInput = `${encodedHeader}.${encodedPayload}`
    
    const encoder = new TextEncoder()
    const keyData = encoder.encode(JWT_SECRET)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    
    const signatureBytes = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBytes,
      encoder.encode(signatureInput)
    )
    
    if (!isValid) return null
    
    const payload = JSON.parse(atob(encodedPayload))
    if (payload.exp && payload.exp < Date.now() / 1000) return null
    
    return payload
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const path = url.pathname

  // Health check
  if (path === '/health' && req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // ==================== REGISTER ====================
  if (path === '/register' && req.method === 'POST') {
    try {
      const { email, password, name, workspaceName } = await req.json()
      console.log('Register attempt:', { email, name })

      if (!email || !password || !name) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
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
          { status: 400, headers: { 'Content-Type': 'application/json' } }
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
        console.error('Workspace error:', workspaceError)
        return new Response(
          JSON.stringify({ error: 'Failed to create workspace' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
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
        console.error('User error:', userError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Create JWT
      const jwt = await createJWT({
        sub: user.id,
        workspace_id: workspace.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
      })

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
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Registration error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
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
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const jwt = await createJWT({
        sub: user.id,
        workspace_id: user.workspace_id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
      })

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
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Login error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // ==================== GET ME ====================
  if (path === '/me' && req.method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'No token provided' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const token = authHeader.split(' ')[1]
      const payload = await verifyJWT(token)
      
      if (!payload || !payload.sub) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired token' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
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
          { status: 404, headers: { 'Content-Type': 'application/json' } }
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
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Get me error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  )
})
