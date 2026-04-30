import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Simple password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hash
}

// JWT functions
function base64urlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function createJWT(payload: any): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-super-secret-key-min-32-chars'
  
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
  const signatureArray = Array.from(new Uint8Array(signature))
  const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
  const encodedSignature = signatureBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
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
  const method = req.method
  const endpoint = url.pathname.split('/').pop() || ''

  console.log(`📥 ${method} /${endpoint}`)

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response('ok', { status: 204, headers })
  }

  // ==================== REGISTER ====================
  if (endpoint === 'register' && method === 'POST') {
    try {
      const { email, password, name, workspaceName } = await req.json()
      
      console.log('📝 Register:', { email, name })

      if (!email || !password || !name) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields' 
        }), { status: 400, headers })
      }

      // Check existing user
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
      const hashedPassword = await hashPassword(password)

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
        return new Response(JSON.stringify({ 
          error: 'Failed to create workspace' 
        }), { status: 500, headers })
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
        return new Response(JSON.stringify({ 
          error: 'Failed to create user' 
        }), { status: 500, headers })
      }

      // Create JWT
      const token = await createJWT({
        sub: user.id,
        workspace_id: workspace.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
      })

      console.log('✅ User created:', user.id)

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
      return new Response(JSON.stringify({ 
        error: error.message 
      }), { status: 500, headers })
    }
  }
// Add to your existing auth-handler edge function

// Update Profile
if (path === '/update-profile' && req.method === 'PUT') {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyJWT(token)
    
    if (!payload || !payload.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers })
    }

    const { name, email, phone, company, bio } = await req.json()

    const { data: user, error } = await supabase
      .from('users')
      .update({ 
        name, 
        email, 
        phone_number: phone,
        company,
        bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.sub)
      .select('id, email, name, role, workspace_id, created_at')
      .single()

    if (error) throw error

    return new Response(JSON.stringify(user), { status: 200, headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
  }
}

// Change Password
if (path === '/change-password' && req.method === 'POST') {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyJWT(token)
    
    if (!payload || !payload.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers })
    }

    const { oldPassword, newPassword } = await req.json()

    // Get user with current password
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', payload.sub)
      .single()

    if (fetchError) throw fetchError

    // Verify old password
    const validPassword = await bcrypt.compare(oldPassword, user.password)
    if (!validPassword) {
      return new Response(JSON.stringify({ error: 'Current password is incorrect' }), { status: 401, headers })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword)

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword, updated_at: new Date().toISOString() })
      .eq('id', payload.sub)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true }), { status: 200, headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
  }
}
  // ==================== LOGIN ====================
  if (endpoint === 'login' && method === 'POST') {
    try {
      const { email, password } = await req.json()
      
      console.log('🔐 Login:', { email })

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, password, role, workspace_id, created_at')
        .eq('email', email)
        .single()

      if (error || !user) {
        return new Response(JSON.stringify({ 
          error: 'Invalid credentials' 
        }), { status: 401, headers })
      }

      const validPassword = await verifyPassword(password, user.password)
      if (!validPassword) {
        return new Response(JSON.stringify({ 
          error: 'Invalid credentials' 
        }), { status: 401, headers })
      }

      const token = await createJWT({
        sub: user.id,
        workspace_id: user.workspace_id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
      })

      console.log('✅ Login successful:', user.id)

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
      return new Response(JSON.stringify({ 
        error: error.message 
      }), { status: 500, headers })
    }
  }

  // ==================== GET CURRENT USER ====================
  if (endpoint === 'me' && method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ 
          error: 'No token provided' 
        }), { status: 401, headers })
      }

      // For now, return mock user (you can implement full JWT verification)
      return new Response(JSON.stringify({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        workspaceId: 'workspace-id'
      }), { status: 200, headers })
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message 
      }), { status: 500, headers })
    }
  }

  // ==================== HEALTH CHECK ====================
  if (endpoint === 'health' && method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString()
    }), { status: 200, headers })
  }

  // ==================== TEST ====================
  if (endpoint === 'test' && method === 'GET') {
    return new Response(JSON.stringify({ 
      message: 'Auth handler is working!',
      endpoints: ['register', 'login', 'me', 'health']
    }), { status: 200, headers })
  }

  return new Response(JSON.stringify({ 
    error: `Endpoint '/${endpoint}' not found`
  }), { status: 404, headers })
})
