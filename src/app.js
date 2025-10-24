import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import ClaudeService from './services/claudeService.js';
import SupabaseService from './services/supabaseService.js';
import MemoryService from './services/memoryService.js';
import TeamCoordinationService from './services/teamCoordinationService.js';
import ChatController from './controllers/chatController.js';
import ProjectController from './controllers/projectController.js';
import createRoutes from './routes/apiRoutes.js';

// ES module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'CLAUDE_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`ERROR: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize services
const claudeService = new ClaudeService(process.env.CLAUDE_API_KEY);
const supabaseService = new SupabaseService(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const memoryService = new MemoryService(supabaseService);
const teamCoordinationService = new TeamCoordinationService(supabaseService);

// Initialize controllers
const chatController = new ChatController(claudeService, memoryService);
const projectController = new ProjectController(supabaseService);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS === '*' 
    ? '*' 
    : process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', createRoutes(chatController, projectController, teamCoordinationService));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve dashboard.html
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║         TVRF AI Command Center - ONLINE              ║
╚═══════════════════════════════════════════════════════╝

Server running on port: ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Claude Model: claude-3-opus-20240229

Dashboard: http://localhost:${PORT}/dashboard
API Health: http://localhost:${PORT}/api/health

Press CTRL+C to stop the server
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
