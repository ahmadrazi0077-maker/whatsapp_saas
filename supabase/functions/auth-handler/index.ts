import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to create response
function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const pathname = url.pathname
  
  // Remove the function name from path
  // The URL comes as /functions/v1/auth-handler/register
  // We need to extract just /register
  const cleanPath = pathname.replace('/functions/v1/auth-handler', '')
  
  console.log('Full path:', pathname)
  console.log('Clean path:', cleanPath)
  console.log('Method:', req.method)

  // Health check
  if (cleanPath === '/health' && req.method === 'GET') {
    return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200)
  }

  // Test endpoint
  if (cleanPath === '/test' && req.method === 'GET') {
    return jsonResponse({ message: 'Auth handler is working!', path: cleanPath }, 200)
  }

  // Register endpoint
  if (cleanPath === '/register' && req.method === 'POST') {
    try {
      const body = await req.json()
      const { email, password, name, workspaceName } = body
      
      console.log('Register attempt:', { email, name })
      
      // Simple response for testing
      return jsonResponse({ 
        success: true, 
        message: 'User registered successfully',
        user: { id: Date.now().toString(), email, name },
        workspace: workspaceName || `${name}'s Workspace`
      }, 201)
      
    } catch (error) {
      console.error('Register error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Login endpoint
  if (cleanPath === '/login' && req.method === 'POST') {
    try {
      const { email, password } = await req.json()
      
      console.log('Login attempt:', { email })
      
      return jsonResponse({ 
        success: true, 
        token: 'mock-jwt-token',
        user: { id: Date.now().toString(), email, name: email.split('@')[0] }
      }, 200)
      
    } catch (error) {
      console.error('Login error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Get user endpoint
  if (cleanPath === '/me' && req.method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      console.log('Auth header present:', !!authHeader)
      
      return jsonResponse({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        workspaceId: 'workspace_123'
      }, 200)
      
    } catch (error) {
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // If no route matches
  return jsonResponse({ 
    error: `Route ${cleanPath} not found`,
    availableRoutes: ['/health', '/test', '/register', '/login', '/me'],
    method: req.method
  }, 404)
})import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to create response
function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const pathname = url.pathname
  
  // Remove the function name from path
  // The URL comes as /functions/v1/auth-handler/register
  // We need to extract just /register
  const cleanPath = pathname.replace('/functions/v1/auth-handler', '')
  
  console.log('Full path:', pathname)
  console.log('Clean path:', cleanPath)
  console.log('Method:', req.method)

  // Health check
  if (cleanPath === '/health' && req.method === 'GET') {
    return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200)
  }

  // Test endpoint
  if (cleanPath === '/test' && req.method === 'GET') {
    return jsonResponse({ message: 'Auth handler is working!', path: cleanPath }, 200)
  }

  // Register endpoint
  if (cleanPath === '/register' && req.method === 'POST') {
    try {
      const body = await req.json()
      const { email, password, name, workspaceName } = body
      
      console.log('Register attempt:', { email, name })
      
      // Simple response for testing
      return jsonResponse({ 
        success: true, 
        message: 'User registered successfully',
        user: { id: Date.now().toString(), email, name },
        workspace: workspaceName || `${name}'s Workspace`
      }, 201)
      
    } catch (error) {
      console.error('Register error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Login endpoint
  if (cleanPath === '/login' && req.method === 'POST') {
    try {
      const { email, password } = await req.json()
      
      console.log('Login attempt:', { email })
      
      return jsonResponse({ 
        success: true, 
        token: 'mock-jwt-token',
        user: { id: Date.now().toString(), email, name: email.split('@')[0] }
      }, 200)
      
    } catch (error) {
      console.error('Login error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Get user endpoint
  if (cleanPath === '/me' && req.method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      console.log('Auth header present:', !!authHeader)
      
      return jsonResponse({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        workspaceId: 'workspace_123'
      }, 200)
      
    } catch (error) {
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // If no route matches
  return jsonResponse({ 
    error: `Route ${cleanPath} not found`,
    availableRoutes: ['/health', '/test', '/register', '/login', '/me'],
    method: req.method
  }, 404)
})import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to create response
function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const pathname = url.pathname
  
  // Remove the function name from path
  // The URL comes as /functions/v1/auth-handler/register
  // We need to extract just /register
  const cleanPath = pathname.replace('/functions/v1/auth-handler', '')
  
  console.log('Full path:', pathname)
  console.log('Clean path:', cleanPath)
  console.log('Method:', req.method)

  // Health check
  if (cleanPath === '/health' && req.method === 'GET') {
    return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200)
  }

  // Test endpoint
  if (cleanPath === '/test' && req.method === 'GET') {
    return jsonResponse({ message: 'Auth handler is working!', path: cleanPath }, 200)
  }

  // Register endpoint
  if (cleanPath === '/register' && req.method === 'POST') {
    try {
      const body = await req.json()
      const { email, password, name, workspaceName } = body
      
      console.log('Register attempt:', { email, name })
      
      // Simple response for testing
      return jsonResponse({ 
        success: true, 
        message: 'User registered successfully',
        user: { id: Date.now().toString(), email, name },
        workspace: workspaceName || `${name}'s Workspace`
      }, 201)
      
    } catch (error) {
      console.error('Register error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Login endpoint
  if (cleanPath === '/login' && req.method === 'POST') {
    try {
      const { email, password } = await req.json()
      
      console.log('Login attempt:', { email })
      
      return jsonResponse({ 
        success: true, 
        token: 'mock-jwt-token',
        user: { id: Date.now().toString(), email, name: email.split('@')[0] }
      }, 200)
      
    } catch (error) {
      console.error('Login error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Get user endpoint
  if (cleanPath === '/me' && req.method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      console.log('Auth header present:', !!authHeader)
      
      return jsonResponse({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        workspaceId: 'workspace_123'
      }, 200)
      
    } catch (error) {
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // If no route matches
  return jsonResponse({ 
    error: `Route ${cleanPath} not found`,
    availableRoutes: ['/health', '/test', '/register', '/login', '/me'],
    method: req.method
  }, 404)
})import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to create response
function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const pathname = url.pathname
  
  // Remove the function name from path
  // The URL comes as /functions/v1/auth-handler/register
  // We need to extract just /register
  const cleanPath = pathname.replace('/functions/v1/auth-handler', '')
  
  console.log('Full path:', pathname)
  console.log('Clean path:', cleanPath)
  console.log('Method:', req.method)

  // Health check
  if (cleanPath === '/health' && req.method === 'GET') {
    return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200)
  }

  // Test endpoint
  if (cleanPath === '/test' && req.method === 'GET') {
    return jsonResponse({ message: 'Auth handler is working!', path: cleanPath }, 200)
  }

  // Register endpoint
  if (cleanPath === '/register' && req.method === 'POST') {
    try {
      const body = await req.json()
      const { email, password, name, workspaceName } = body
      
      console.log('Register attempt:', { email, name })
      
      // Simple response for testing
      return jsonResponse({ 
        success: true, 
        message: 'User registered successfully',
        user: { id: Date.now().toString(), email, name },
        workspace: workspaceName || `${name}'s Workspace`
      }, 201)
      
    } catch (error) {
      console.error('Register error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Login endpoint
  if (cleanPath === '/login' && req.method === 'POST') {
    try {
      const { email, password } = await req.json()
      
      console.log('Login attempt:', { email })
      
      return jsonResponse({ 
        success: true, 
        token: 'mock-jwt-token',
        user: { id: Date.now().toString(), email, name: email.split('@')[0] }
      }, 200)
      
    } catch (error) {
      console.error('Login error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Get user endpoint
  if (cleanPath === '/me' && req.method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      console.log('Auth header present:', !!authHeader)
      
      return jsonResponse({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        workspaceId: 'workspace_123'
      }, 200)
      
    } catch (error) {
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // If no route matches
  return jsonResponse({ 
    error: `Route ${cleanPath} not found`,
    availableRoutes: ['/health', '/test', '/register', '/login', '/me'],
    method: req.method
  }, 404)
})import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to create response
function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const pathname = url.pathname
  
  // Remove the function name from path
  // The URL comes as /functions/v1/auth-handler/register
  // We need to extract just /register
  const cleanPath = pathname.replace('/functions/v1/auth-handler', '')
  
  console.log('Full path:', pathname)
  console.log('Clean path:', cleanPath)
  console.log('Method:', req.method)

  // Health check
  if (cleanPath === '/health' && req.method === 'GET') {
    return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200)
  }

  // Test endpoint
  if (cleanPath === '/test' && req.method === 'GET') {
    return jsonResponse({ message: 'Auth handler is working!', path: cleanPath }, 200)
  }

  // Register endpoint
  if (cleanPath === '/register' && req.method === 'POST') {
    try {
      const body = await req.json()
      const { email, password, name, workspaceName } = body
      
      console.log('Register attempt:', { email, name })
      
      // Simple response for testing
      return jsonResponse({ 
        success: true, 
        message: 'User registered successfully',
        user: { id: Date.now().toString(), email, name },
        workspace: workspaceName || `${name}'s Workspace`
      }, 201)
      
    } catch (error) {
      console.error('Register error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Login endpoint
  if (cleanPath === '/login' && req.method === 'POST') {
    try {
      const { email, password } = await req.json()
      
      console.log('Login attempt:', { email })
      
      return jsonResponse({ 
        success: true, 
        token: 'mock-jwt-token',
        user: { id: Date.now().toString(), email, name: email.split('@')[0] }
      }, 200)
      
    } catch (error) {
      console.error('Login error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Get user endpoint
  if (cleanPath === '/me' && req.method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      console.log('Auth header present:', !!authHeader)
      
      return jsonResponse({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        workspaceId: 'workspace_123'
      }, 200)
      
    } catch (error) {
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // If no route matches
  return jsonResponse({ 
    error: `Route ${cleanPath} not found`,
    availableRoutes: ['/health', '/test', '/register', '/login', '/me'],
    method: req.method
  }, 404)
})import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to create response
function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const pathname = url.pathname
  
  // Remove the function name from path
  // The URL comes as /functions/v1/auth-handler/register
  // We need to extract just /register
  const cleanPath = pathname.replace('/functions/v1/auth-handler', '')
  
  console.log('Full path:', pathname)
  console.log('Clean path:', cleanPath)
  console.log('Method:', req.method)

  // Health check
  if (cleanPath === '/health' && req.method === 'GET') {
    return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200)
  }

  // Test endpoint
  if (cleanPath === '/test' && req.method === 'GET') {
    return jsonResponse({ message: 'Auth handler is working!', path: cleanPath }, 200)
  }

  // Register endpoint
  if (cleanPath === '/register' && req.method === 'POST') {
    try {
      const body = await req.json()
      const { email, password, name, workspaceName } = body
      
      console.log('Register attempt:', { email, name })
      
      // Simple response for testing
      return jsonResponse({ 
        success: true, 
        message: 'User registered successfully',
        user: { id: Date.now().toString(), email, name },
        workspace: workspaceName || `${name}'s Workspace`
      }, 201)
      
    } catch (error) {
      console.error('Register error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Login endpoint
  if (cleanPath === '/login' && req.method === 'POST') {
    try {
      const { email, password } = await req.json()
      
      console.log('Login attempt:', { email })
      
      return jsonResponse({ 
        success: true, 
        token: 'mock-jwt-token',
        user: { id: Date.now().toString(), email, name: email.split('@')[0] }
      }, 200)
      
    } catch (error) {
      console.error('Login error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Get user endpoint
  if (cleanPath === '/me' && req.method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      console.log('Auth header present:', !!authHeader)
      
      return jsonResponse({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        workspaceId: 'workspace_123'
      }, 200)
      
    } catch (error) {
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // If no route matches
  return jsonResponse({ 
    error: `Route ${cleanPath} not found`,
    availableRoutes: ['/health', '/test', '/register', '/login', '/me'],
    method: req.method
  }, 404)
})import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to create response
function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const pathname = url.pathname
  
  // Remove the function name from path
  // The URL comes as /functions/v1/auth-handler/register
  // We need to extract just /register
  const cleanPath = pathname.replace('/functions/v1/auth-handler', '')
  
  console.log('Full path:', pathname)
  console.log('Clean path:', cleanPath)
  console.log('Method:', req.method)

  // Health check
  if (cleanPath === '/health' && req.method === 'GET') {
    return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200)
  }

  // Test endpoint
  if (cleanPath === '/test' && req.method === 'GET') {
    return jsonResponse({ message: 'Auth handler is working!', path: cleanPath }, 200)
  }

  // Register endpoint
  if (cleanPath === '/register' && req.method === 'POST') {
    try {
      const body = await req.json()
      const { email, password, name, workspaceName } = body
      
      console.log('Register attempt:', { email, name })
      
      // Simple response for testing
      return jsonResponse({ 
        success: true, 
        message: 'User registered successfully',
        user: { id: Date.now().toString(), email, name },
        workspace: workspaceName || `${name}'s Workspace`
      }, 201)
      
    } catch (error) {
      console.error('Register error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Login endpoint
  if (cleanPath === '/login' && req.method === 'POST') {
    try {
      const { email, password } = await req.json()
      
      console.log('Login attempt:', { email })
      
      return jsonResponse({ 
        success: true, 
        token: 'mock-jwt-token',
        user: { id: Date.now().toString(), email, name: email.split('@')[0] }
      }, 200)
      
    } catch (error) {
      console.error('Login error:', error)
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // Get user endpoint
  if (cleanPath === '/me' && req.method === 'GET') {
    try {
      const authHeader = req.headers.get('Authorization')
      console.log('Auth header present:', !!authHeader)
      
      return jsonResponse({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        workspaceId: 'workspace_123'
      }, 200)
      
    } catch (error) {
      return jsonResponse({ error: error.message }, 500)
    }
  }

  // If no route matches
  return jsonResponse({ 
    error: `Route ${cleanPath} not found`,
    availableRoutes: ['/health', '/test', '/register', '/login', '/me'],
    method: req.method
  }, 404)
})
