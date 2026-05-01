import express from 'express';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth endpoints (simplified)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // Simple mock response for now
  res.json({
    token: 'mock-token-' + Date.now(),
    user: { id: '1', email, name: email?.split('@')[0], role: 'USER' }
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  res.json({
    token: 'mock-token-' + Date.now(),
    user: { id: '1', email, name, role: 'USER' }
  });
});

// Contacts endpoints
app.get('/api/contacts', (req, res) => {
  res.json([
    { id: '1', name: 'Sample Contact', phone_number: '+923001234567', email: 'sample@example.com' }
  ]);
});

app.post('/api/contacts', (req, res) => {
  res.json({ id: Date.now().toString(), ...req.body, created_at: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
