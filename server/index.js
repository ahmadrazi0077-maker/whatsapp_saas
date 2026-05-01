const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    token: 'mock-token-' + Date.now(),
    user: { id: '1', email, name: email?.split('@')[0] || 'User' }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  res.json({
    token: 'mock-token-' + Date.now(),
    user: { id: '1', email, name }
  });
});

// Contacts endpoints
app.get('/api/contacts', (req, res) => {
  res.json([
    { id: '1', name: 'Sample Contact', phone_number: '+923001234567', email: 'sample@example.com' }
  ]);
});

app.post('/api/contacts', (req, res) => {
  const newContact = { id: Date.now().toString(), ...req.body, created_at: new Date().toISOString() };
  res.json(newContact);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
