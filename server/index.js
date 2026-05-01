const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

// Important: CORS must be configured for your frontend URL
app.use(cors({
  origin: [ 'https://whatsappsaas-production-f4eb.up.railway.app',
    'https://whatsapp-saas-hazel-nine.vercel.app',
    'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('Register request body:', req.body);
  
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Store user in memory (temporary)
  const user = {
    id: Date.now().toString(),
    name,
    email,
    role: 'USER',
    workspaceId: 'workspace_1',
    createdAt: new Date().toISOString()
  };
  
  const token = Buffer.from(JSON.stringify({ userId: user.id, email })).toString('base64');
  
  res.status(201).json({ token, user });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login request body:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  
  // Simple mock login - accept any credentials for testing
  const user = {
    id: '1',
    name: email.split('@')[0],
    email,
    role: 'USER',
    workspaceId: 'workspace_1',
    createdAt: new Date().toISOString()
  };
  
  const token = Buffer.from(JSON.stringify({ userId: user.id, email })).toString('base64');
  
  res.json({ token, user });
});

// Get user endpoint
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  
  // Mock user for testing
  res.json({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    workspaceId: 'workspace_1',
    createdAt: new Date().toISOString()
  });
});

// Contacts endpoints
app.get('/api/contacts', (req, res) => {
  res.json([
    { id: '1', name: 'Sample Contact', phone_number: '+923001234567', email: 'sample@example.com', tags: ['test'], created_at: new Date().toISOString() }
  ]);
});

app.post('/api/contacts', (req, res) => {
  const newContact = { 
    id: Date.now().toString(), 
    ...req.body, 
    created_at: new Date().toISOString(),
    tags: req.body.tags || []
  };
  res.status(201).json(newContact);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS enabled for frontend`);
});
