import express from 'express';
import cors from 'cors';
import { router } from './routes';

const app = express();

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(cors());
// Use /api prefix
app.post('/api/auth/login', (req, res) => {
  res.send("Backend is reachable!");
});
app.use('/api', router);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Login endpoint: http://localhost:${PORT}/api/auth/login`);
});

export default app;