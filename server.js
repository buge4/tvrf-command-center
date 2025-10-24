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

// API proxy for chat communication (supports both Claude and OpenAI)
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  try {
    let response;
    
    if (claudeApiKey) {
      // Use Claude API
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${claudeApiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1000,
          messages: [{ role: 'user', content: message }]
        })
      });
      
      const claudeData = await claudeResponse.json();
      response = claudeData.content?.[0]?.text || "Claude API error occurred";
      
    } else if (openaiApiKey) {
      // Use OpenAI API
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          max_tokens: 1000,
          messages: [{ role: 'user', content: message }]
        })
      });
      
      const openaiData = await openaiResponse.json();
      response = openaiData.choices?.[0]?.message?.content || "OpenAI API error occurred";
      
    } else {
      // No API keys available
      response = "API keys not configured. Please add CLAUDE_API_KEY or OPENAI_API_KEY to your Railway environment variables.";
    }
    
    res.json({
      response,
      sessionId: sessionId || `session-${Date.now()}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.json({
      response: "API error occurred. Please check your API keys and try again.",
      sessionId: sessionId || `session-${Date.now()}`,
      error: true
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasApiKeys: !!(claudeApiKey || openaiApiKey),
    configuredApis: {
      claude: !!claudeApiKey,
      openai: !!openaiApiKey
    }
  });
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