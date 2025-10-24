# TVRF AI Command Center

A production-ready AI command center integrating Claude API for TVRF system management, with conversation memory, project tracking, and multi-step execution capabilities.

## Features

- **🤖 Multi-Agent AI Team**: Sophisticated 5-agent system with specialized roles
  - 🔍 System Analyst Agent - Technical analysis and monitoring
  - 🔧 Development Agent - Code generation and implementation
  - 📊 Monitoring Agent - Real-time monitoring and alerting
  - 🎯 Strategy Agent - Business logic and feature planning
  - 🔒 Security Agent - Security analysis and compliance

- **🧠 Advanced Team Coordination**: 
  - Weighted consensus protocols with role-based decision making
  - Real-time agent communication and collaboration
  - Conflict resolution and mediation systems
  - Performance tracking and continuous learning

- **⚖️ Intelligent Decision Making**:
  - Critical decisions require 80% agent consensus (4/5 agents)
  - Major decisions require 60% agent consensus (3/5 agents)
  - Automated conflict resolution and consensus building
  - Real-time voting and opinion aggregation

- **🎯 TVRF System Expertise**: Built-in knowledge of TVRF blockchain systems, random number generation, and lottery platforms

- **💬 Conversation Memory**: Persistent conversation history and context across sessions

- **📋 Project Management**: Advanced project tracking with team-based task coordination

- **📊 Team Analytics**: Performance metrics, consensus efficiency, and collaboration insights

- **🔄 Session Management**: Continuous context across conversations and multi-step executions

- **🏥 Real-time Dashboard**: Interactive web interface for system control and team monitoring

- **🔒 Production-Ready**: Security headers, rate limiting, input validation, error handling

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TVRF Command Center                         │
│              Multi-Agent AI Team System                       │
├─────────────────────────────────────────────────────────────────┤
│  🤖 AI Commander (Claude Opus) - Primary Team Coordinator     │
│     ├── 🔍 System Analyst Agent                               │
│     ├── 🔧 Development Agent                                  │
│     ├── 📊 Monitoring Agent                                   │
│     ├── 🎯 Strategy Agent                                     │
│     └── 🔒 Security Agent                                     │
├─────────────────────────────────────────────────────────────────┤
│  🗄️ Supabase Database (Persistent Storage)                    │
│     ├── 💬 Conversation Memory                               │
│     ├── 📋 Project State                                     │
│     ├── 🔄 Session Data                                      │
│     └── 👥 Team Coordination Logs                            │
├─────────────────────────────────────────────────────────────────┤
│  🔗 Team Coordination Layer                                   │
│     ├── 🧠 Shared Memory Service                             │
│     ├── 📡 Agent Communication Protocol                      │
│     ├── ⚖️ Consensus Engine                                  │
│     └── 🎭 Role-based Task Delegation                        │
└─────────────────────────────────────────────────────────────────┘

Team Coordination Features:
✅ Multi-agent consensus protocols with voting mechanisms
✅ Real-time collaboration through shared memory
✅ Role-based task delegation and execution
✅ Cross-service communication and synchronization
✅ Continuous learning from team interactions
✅ Automated conflict resolution and consensus building
```

## Technology Stack

- **Backend**: Node.js, Express
- **AI**: Anthropic Claude API (claude-3-opus-20240229)
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Security**: Helmet, CORS, Rate Limiting

## Multi-Agent Team Coordination

### 🤖 AI Team Structure

The TVRF Command Center employs a sophisticated multi-agent architecture where specialized AI agents collaborate to achieve complex objectives:

#### **Primary AI Commander**
- **Role**: Central coordinator and decision-maker
- **Responsibilities**: Task delegation, team coordination, final decision authority
- **Capabilities**: Strategic planning, resource allocation, conflict resolution

#### **Specialized Agent Roles**

1. **🔍 System Analyst Agent**
   - **Focus**: Technical analysis, system monitoring, performance optimization
   - **Expertise**: Blockchain analysis, entropy validation, pattern detection
   - **Output**: Detailed reports, technical recommendations, system diagnostics

2. **🔧 Development Agent**
   - **Focus**: Code generation, implementation, debugging
   - **Expertise**: Full-stack development, deployment, CI/CD
   - **Output**: Production-ready code, deployment scripts, documentation

3. **📊 Monitoring Agent**
   - **Focus**: Real-time monitoring, alerting, data analysis
   - **Expertise**: Metrics collection, anomaly detection, reporting
   - **Output**: Dashboards, alerts, performance reports

4. **🎯 Strategy Agent**
   - **Focus**: Business logic, user experience, feature planning
   - **Expertise**: UX/UI design, feature prioritization, roadmap planning
   - **Output**: Strategic recommendations, feature specifications, user stories

5. **🔒 Security Agent**
   - **Focus**: Security analysis, threat assessment, compliance
   - **Expertise**: Security auditing, vulnerability assessment, risk analysis
   - **Output**: Security reports, compliance checks, risk assessments

### 🧠 Coordination Mechanisms

#### **Consensus Protocols**

1. **Simple Majority Voting**
   ```javascript
   // 3/5 agent consensus for standard decisions
   async getConsensus(decision, agents = []) {
     const votes = await Promise.all(
       agents.map(agent => agent.getOpinion(decision))
     );
     const tally = votes.filter(vote => vote.support).length;
     return tally >= Math.ceil(agents.length * 0.6);
   }
   ```

2. **Weighted Voting System**
   ```javascript
   // Different weights based on agent expertise
   const agentWeights = {
     'SystemAnalyst': 0.25,
     'Development': 0.25,
     'Monitoring': 0.20,
     'Strategy': 0.20,
     'Security': 0.10
   };
   ```

### 📊 Team Workflow Examples

#### **TVRF System Development Workflow**

```
User Request: "Deploy the TVRF lottery platform"

┌─→ 🎯 Strategy Agent: Requirement Analysis
│   ├── Analyze business requirements
│   ├── Define technical specifications
│   └── Create implementation roadmap
│
├─→ 🔍 System Analyst: Technical Design
│   ├── Design system architecture
│   ├── Plan database schema
│   └── Define API structure
│
├─→ 🔧 Development Agent: Implementation
│   ├── Generate core functionality
│   ├── Implement blockchain integration
│   └── Create smart contracts
│
├─→ 📊 Monitoring Agent: Testing & Monitoring
│   ├── Set up test scenarios
│   ├── Configure monitoring systems
│   └── Define success metrics
│
└─→ 🔒 Security Agent: Security Review
    ├── Security audit
    ├── Vulnerability assessment
    └── Compliance verification
```

### ⚖️ Best Practices for Agent Consensus

#### **1. Consensus Building Framework**

**Decision Categories:**
- **🔴 Critical** (4/5 agent approval): Security, financial, legal decisions
- **🟡 Major** (3/5 agent approval): Feature development, architecture changes
- **🟢 Minor** (2/5 agent approval): UI changes, minor fixes, documentation

**Consensus Thresholds:**
```javascript
const CONSENSUS_THRESHOLDS = {
  CRITICAL: 0.8,  // 4/5 agents
  MAJOR: 0.6,     // 3/5 agents
  MINOR: 0.4      // 2/5 agents
};

async function requireConsensus(decision, category) {
  const requiredVotes = Math.ceil(
    AGENTS.length * CONSENSUS_THRESHOLDS[category]
  );
  const votes = await getAgentVotes(decision);
  return votes.length >= requiredVotes;
}
```

#### **2. Communication Protocols**

**Message Format:**
```javascript
// Standardized agent communication
{
  agentId: "SystemAnalyst_001",
  sessionId: "tvrf-dev-session-123",
  timestamp: "2024-01-15T10:30:00Z",
  messageType: "RECOMMENDATION", // RECOMMENDATION, QUESTION, ALERT, APPROVAL
  priority: "HIGH", // LOW, MEDIUM, HIGH, CRITICAL
  content: {
    topic: "TVRF Blockchain Integration",
    recommendation: "Implement batch processing",
    reasoning: "Reduces transaction costs by 40%",
    confidence: 0.85,
    dependencies: ["Database schema update", "API rate limits"]
  },
  requiresResponse: false,
  responseDeadline: null
}
```

This multi-agent architecture enables the TVRF Command Center to handle complex, multi-faceted challenges through intelligent collaboration, ensuring robust, well-considered decisions through consensus-driven team coordination.

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Supabase account
- Claude API key (Anthropic)

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/buge4/tvrf-command-center.git
cd tvrf-command-center
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Run the SQL schema in your Supabase dashboard:

```bash
# Open Supabase SQL Editor and run:
database/schema.sql
```

This creates:
- `conversations` table - stores chat history
- `projects` table - tracks AI projects
- `project_sessions` table - stores project execution data

**New Multi-Agent Coordination Tables:**
- `team_sessions` table - coordinates multi-agent sessions
- `agent_contributions` table - tracks individual agent outputs
- `team_consensus` table - records decision consensus
- `team_communications` table - manages agent messaging
- `agent_performance` table - tracks team performance metrics

### 4. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

**⚠️ IMPORTANT: You must configure your own API keys before running the application**

Edit `.env` and replace the placeholder values with your actual credentials:

```env
# Claude API (Required - get from https://console.anthropic.com/)
CLAUDE_API_KEY=sk-ant-your_actual_claude_api_key_here

# Supabase (Required - get from https://supabase.com/dashboard)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_supabase_service_role_key_here

# Security (Required - use a strong random string)
SESSION_SECRET=your_random_secret_here
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

**Getting API Keys:**

1. **Claude API Key**: Sign up at [console.anthropic.com](https://console.anthropic.com/) and create an API key
2. **Supabase**: Create a project at [supabase.com](https://supabase.com/dashboard) and get your URL and keys from Settings > API
3. **SESSION_SECRET**: Generate a strong random string (e.g., using `openssl rand -base64 32`)
4. **ALLOWED_ORIGINS**: Set to your domain(s) for CORS protection

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## Usage

### Web Interface

1. Open browser to `http://localhost:3000`
2. Click "Enter Command Center"
3. Start chatting with the AI Commander

### API Endpoints

#### Chat Endpoints

- `POST /api/chat` - Send message to Claude AI
  ```json
  {
    "message": "Your command here",
    "sessionId": "optional-session-id",
    "useHistory": true
  }
  ```

- `POST /api/chat/stream` - Stream response from Claude
- `GET /api/chat/history/:sessionId` - Get conversation history
- `GET /api/chat/all` - Get all conversations

#### Project Endpoints

- `POST /api/projects` - Create new project
  ```json
  {
    "name": "Project Name",
    "description": "Project description"
  }
  ```

- `GET /api/projects` - List all projects
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Project Session Endpoints

- `POST /api/projects/sessions` - Save project session
- `GET /api/projects/:projectId/sessions` - Get project sessions

#### Team Coordination Endpoints

- `POST /api/team/sessions` - Create new team coordination session
  ```json
  {
    "sessionName": "TVRF Platform Development",
    "sessionType": "development",
    "coordinatorAgent": "AICommander"
  }
  ```

- `GET /api/team/sessions/:sessionId` - Get team session details
- `POST /api/team/sessions/:sessionId/contributions` - Add agent contribution
  ```json
  {
    "agentId": "SystemAnalyst_001",
    "agentType": "SystemAnalyst",
    "contributionType": "recommendation",
    "content": {
      "analysis": "Technical architecture assessment",
      "recommendations": ["Implement microservices", "Add caching layer"]
    },
    "confidenceScore": 0.85
  }
  ```

- `POST /api/team/sessions/:sessionId/consensus` - Build team consensus
  ```json
  {
    "decisionTopic": "TVRF Deployment Strategy",
    "decisionCategory": "MAJOR",
    "agentRecommendations": [
      {
        "agentType": "SystemAnalyst",
        "recommendation": "APPROVE",
        "reasoning": "Architecture is solid"
      },
      {
        "agentType": "Security",
        "recommendation": "APPROVE",
        "reasoning": "Security measures are adequate"
      }
    ]
  }
  ```

- `POST /api/team/sessions/:sessionId/messages` - Send agent message
  ```json
  {
    "senderAgent": "AICommander",
    "receiverAgent": "SystemAnalyst",
    "messageType": "DIRECT",
    "content": {
      "subject": "Performance Review Request",
      "body": "Please review the latest deployment metrics"
    },
    "priority": "MEDIUM",
    "requiresResponse": false
  }
  ```

- `POST /api/team/sessions/:sessionId/complete` - Complete team session
  ```json
  {
    "results": {
      "status": "completed",
      "decisions": ["Deployment approved", "Monitoring configured"],
      "next_steps": ["Deploy to production", "Set up alerts"]
    }
  }
  ```

- `POST /api/team/emergency` - Create emergency response session
  ```json
  {
    "alertType": "SystemAnomaly",
    "alertData": {
      "severity": "HIGH",
      "affected_systems": ["TVRF-Lottery", "Blockchain-Monitor"],
      "description": "Unusual entropy patterns detected"
    }
  }
  ```

- `GET /api/team/analytics` - Get team performance analytics
  Query params: `?timeRange=7d` (supports 7d, 30d)

#### Health Check

- `GET /api/health` - System status

## Project Structure

```
tvrf-command-center/
├── src/
│   ├── controllers/
│   │   ├── chatController.js      # Chat logic
│   │   └── projectController.js   # Project management
│   ├── services/
│   │   ├── claudeService.js       # Claude API integration
│   │   ├── supabaseService.js     # Database operations
│   │   ├── memoryService.js       # Conversation memory
│   │   └── teamCoordinationService.js # Multi-agent coordination
│   ├── routes/
│   │   └── apiRoutes.js           # API route definitions
│   └── app.js                     # Express application
├── public/
│   ├── index.html                 # Landing page
│   ├── dashboard.html             # Main dashboard
│   └── assets/
│       ├── dashboard.css          # Styles
│       └── dashboard.js           # Frontend logic
├── database/
│   └── schema.sql                 # Database schema
├── package.json
├── .env.example
└── README.md
```

## Deployment

### Railway Deployment

1. Create new project on Railway
2. Connect GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

### Environment Variables for Railway

Set these in Railway dashboard:
- `CLAUDE_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://your-domain.com`

## Modularity & Extensibility

### Adding New AI Services

The architecture supports easy integration of additional AI services:

1. Create new service in `src/services/`:
```javascript
// src/services/gptService.js
class GPTService {
  constructor(apiKey) {
    // Initialize GPT client
  }
  
  async sendMessage(message) {
    // GPT implementation
  }
}
```

2. Add to controllers:
```javascript
// src/controllers/aiController.js
this.claudeService = claudeService;
this.gptService = gptService;
```

3. Update routes as needed

### Service Architecture

Each service is independent and replaceable:
- **claudeService.js**: Claude API wrapper
- **supabaseService.js**: Database abstraction
- **memoryService.js**: Context management

## TVRF System Context

The AI Commander is configured with knowledge of:

- **TVRF AI System**: 5-level random extraction, transaction card generation, O(1) lookup
- **Random Monitor**: Real-time blockchain analysis, chi-square testing, entropy validation
- **Lottery Platform**: TON blockchain integration, smart contracts, automated draws
- **Development Tools**: Cursor, Supabase, Vercel/Railway, GitHub

## Security Features

- **Helmet**: Security headers
- **CORS**: Configurable origin restrictions
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Request sanitization
- **Environment Variables**: Sensitive data protection
- **Error Handling**: Safe error messages in production

## Troubleshooting

### Database Connection Issues

1. Verify Supabase credentials in `.env`
2. Check Supabase project is active
3. Ensure RLS policies are set correctly

### Claude API Errors

1. Verify API key is valid
2. Check API quota/limits
3. Review error logs for specific issues

### Port Already in Use

Change PORT in `.env` or:
```bash
PORT=3001 npm start
```

## Development

### Testing API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Send chat message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, AI Commander!"}'
```

### Monitoring Logs

```bash
npm start
# Watch console output for requests and errors
```

## License

MIT

## Author

MiniMax Agent

## Documentation

### Multi-Agent Team Coordination
- **Comprehensive Guide**: See `docs/TEAM_COORDINATION.md` for detailed documentation
- **Visual Diagrams**: Check `docs/` folder for architecture diagrams
- **Examples**: Explore `examples/team-coordination-example.js` for practical usage

### Key Documentation Files
- `docs/TEAM_COORDINATION.md` - Complete multi-agent coordination guide
- `docs/multi-agent-flow.png` - Team coordination workflow diagram
- `docs/database-schema.png` - Database relationships diagram
- `docs/agent-roles.png` - Agent roles and interactions diagram
- `examples/team-coordination-example.js` - Comprehensive usage examples

## Contributing

Contributions are welcome! Please follow standard Git workflow:

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

**Team Coordination Features**: When contributing to team coordination:
- Follow the established consensus protocols
- Include agent role specifications
- Document any changes to consensus mechanisms
- Update relevant examples and documentation

## Support

For issues and questions:
- GitHub Issues: https://github.com/buge4/tvrf-command-center/issues
- Multi-Agent Coordination: Refer to `docs/TEAM_COORDINATION.md`
- API Documentation: See API Endpoints section above

## Roadmap

- [ ] WebSocket support for real-time streaming
- [ ] User authentication system
- [ ] Multi-user session management
- [ ] Advanced project workflows
- [ ] Integration with additional AI models
- [ ] Analytics dashboard
- [ ] Export conversation history
- [ ] Mobile-responsive improvements
