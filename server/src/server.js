import http from 'http';
import app from './app.js';
import { config } from './config/environment.js';
import { initSocket } from './services/socketService.js';

const PORT = config.port || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 GhanaTrust Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`📍 http://localhost:${PORT}`);
});