import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// JWT Secret for token creation
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-super-secret-key-min-32-chars'

// Helper functions
function base64urlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function createJWT(payload: any): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
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
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(signatureInput))
  const encodedSignature = base64urlEncode(String.fromCharCode(...new Uint8Array(signature)))
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
}

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
    const isValid = await crypto.subtle.verify('HMAC', cryptoKey, signatureBytes, encoder.encode(signatureInput))
    
    if (!isValid) return null
    
    const payload = JSON.parse(atob(encodedPayload))
    if (payload.exp && payload.exp < Date.now() / 1000) return null
    
    return payload
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

// CORS headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const pathname = url.pathname
  const method = req.method
  const endpoint = pathname.split('/').pop() || ''

  console.log(`📥 ${method} ${endpoint}`)

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response('ok', { status: 204, headers })
  }

  // ==================== REGISTER ====================
  if (endpoint === 'register' && method === 'POST') {
    try {
      const { email, password, name, workspaceName } = await req.json()
      
      console.log('📝 Register attempt:', { email, name })

      // Validate input
      if (!email || !password || !name) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields: email, password, name' 
        }), { status: 400, headers })
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existingUser) {
        return new Response(JSON.stringify({ 
          error: 'User already exists' 
        }), { status: 400, headers })
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
        return new Response(JSON.stringify({ 
          error: 'Failed to create workspace' 
        }), { status: 500, headers })
      }

      console.log('✅ Workspace created:', workspace.id)

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
        return new Response(JSON.stringify({ 
          error: 'Failed to create user' 
        }), { status: 500, headers })
      }

      console.log('✅ User created:', user.id)

      // Create JWT token
      const token = await createJWT({
        sub: user.id,
        workspace_id: workspace.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
      })

      return new Response(JSON.stringify({ 
        success: true,
        token, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspaceId: user.workspace_id,
          createdAt: user.created_at
        }
      }), { status: 201, headers })
      
    } catch (error) {
      console.error('❌ Register error:', error)
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers 
      })
    }
  }

  // ==================== LOGIN ====================
  if (endpoint === 'login' && method === 'POST') {
    try {
      const { email, password } = await req.json()
      
      console.log('🔐 Login attempt:', { email })

      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, password, role, workspace_id, created_at')
        .eq('email', email)
        .single()

      if (error || !user) {
        console.log('❌ User not found:', email)
        return new Response(JSON.stringify({ 
          error: 'Invalid credentials' 
        }), { status: 401, headers })
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        console.log('❌ Invalid password for:', email)
        return new Response(JSON.stringify({ 
          error: 'Invalid credentials' 
        }), { status: 401, headers })
      }

      console.log('✅ Login successful:', user.id)

      // Create JWT token
      const token = await createJWT({
        sub: user.id,
        workspace_id: user.workspace_id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
      })

      return new Response(JSON.stringify({ 
        success: true,
        token, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspaceId: user.workspace_id,
          createdAt: user.created_at
        }
      }), { status: 200, headers })
      
    } catch (error) {
      console.error('❌ Login error:', error)
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers 
      })
    }
  }

  // ==================== GET CURRENT USER ====================
  if (endpoint === 'me' && method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'No token provided' }), { 
          status: 401, 
          headers 
        })
      }

      const token = authHeader.split(' ')[1]
      const payload = await verifyJWT(token)
      
      if (!payload || !payload.sub) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), { 
          status: 401, 
          headers 
        })
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, role, workspace_id, created_at')
        .eq('id', payload.sub)
        .single()

      if (error || !user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { 
          status: 404, 
          headers 
        })
      }

      return new Response(JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: user.workspace_id,
        createdAt: user.created_at
      }), { status: 200, headers })
      
    } catch (error) {
      console.error('❌ Get me error:', error)
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers 
      })
    }
  }

  // ==================== HEALTH CHECK ====================
  if (endpoint === 'health' && method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    }), { status: 200, headers })
  }

  // ==================== TEST ENDPOINT ====================
  if (endpoint === 'test' && method === 'GET') {
    // Test database connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    return new Response(JSON.stringify({ 
      message: 'Auth handler is working!',
      databaseConnected: !error,
      timestamp: new Date().toISOString()
    }), { status: 200, headers })
  }

  // Route not found
  return new Response(JSON.stringify({ 
    error: `Endpoint '/${endpoint}' not found`,
    availableEndpoints: ['register', 'login', 'me', 'health', 'test']
  }), { status: 404, headers })
})
