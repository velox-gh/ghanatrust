import app from './app.js';
import { config } from './config/environment.js';

const PORT = config.port || 5000;

app.listen(PORT, () => {
  console.log(`🚀 GhanaTrust Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`📍 http://localhost:${PORT}`);
});