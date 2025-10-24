const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve API routes (mock responses for development)
app.get('/api/team/sessions', (req, res) => {
  res.json({
    sessions: [
      {
        id: 'session-1',
        timestamp: new Date().toISOString(),
        agents: ['system-analyst', 'development', 'monitoring'],
        status: 'active'
      }
    ]
  });
});

app.get('/api/team/analytics', (req, res) => {
  res.json({
    totalAgents: 5,
    activeMissions: 1,
    successRate: 87,
    averageResponseTime: '1.2s'
  });
});

// API proxy for Claude communication (when keys are available)
app.post('/api/claude/message', async (req, res) => {
  // This will be handled by environment variables when API keys are set
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!claudeApiKey && !openaiApiKey) {
    res.json({
      response: "API keys not configured yet. Please add CLAUDE_API_KEY or OPENAI_API_KEY to your Railway environment variables.",
      sessionId: `session-${Date.now()}`
    });
    return;
  }
  
  // TODO: Implement actual API calls when keys are available
  res.json({
    response: "API integration coming soon...",
    sessionId: `session-${Date.now()}`
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TVRF Command Center running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});