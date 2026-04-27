// Add these imports
import messageRoutes from './routes/messages';
import contactRoutes from './routes/contacts';
import broadcastRoutes from './routes/broadcast';
import automationRoutes from './routes/automation';
import analyticsRoutes from './routes/analytics';

// Add these routes after auth routes
app.use('/api/messages', messageRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/analytics', analyticsRoutes);
