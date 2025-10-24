# TVRF Command Center - AI Army Dashboard

A live dashboard for communicating with Claude and visualizing your AI army of 5 specialized agents.

## 🌐 Live Demo

**Current Deployment:** https://51md2zpfxrjy.space.minimax.io

## 🚀 Features

- **Chat Interface**: Communicate directly with Claude AI
- **AI Army Visualization**: Monitor and control your 5-agent team
  - System Analyst (25%)
  - Development Agent (25%)
  - Monitoring Agent (20%)
  - Strategy Agent (20%)
  - Security Agent (10%)
- **Team Coordination**: Real-time agent status and communication
- **Mission Control**: Launch missions and emergency protocols
- **Performance Analytics**: Track team performance metrics

## 🛠️ Railway Deployment

### Prerequisites
- Railway account (sign up at [railway.app](https://railway.app))
- GitHub repository with this project

### Quick Deploy

1. **Connect GitHub**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository: `buge4/tvrf-command-center`

2. **Configure Environment Variables**
   - In Railway dashboard, go to your project
   - Click on "Variables" tab
   - Add these environment variables:

   ```
   CLAUDE_API_KEY=sk-ant-your-claude-key-here
   OPENAI_API_KEY=sk-proj-your-openai-key-here
   PORT=3000
   ```

   **Note**: You only need either `CLAUDE_API_KEY` OR `OPENAI_API_KEY`, not both.

3. **Deploy**
   - Railway will automatically detect the Node.js app
   - It will install dependencies and start the server
   - Your app will be available at `https://your-project-name.railway.app`

### Manual Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/buge4/tvrf-command-center.git
   cd tvrf-command-center
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file
   echo "CLAUDE_API_KEY=your-key-here" > .env
   echo "PORT=3000" >> .env
   ```

4. **Local Development**
   ```bash
   npm start
   # Visit http://localhost:3000
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLAUDE_API_KEY` | No* | Anthropic Claude API key for chat functionality |
| `OPENAI_API_KEY` | No* | OpenAI API key as alternative to Claude |
| `PORT` | No | Server port (default: 3000) |

*At least one API key is required for full chat functionality. Without API keys, the dashboard will show a placeholder message.

### API Endpoints

- `GET /` - Dashboard interface
- `GET /health` - Health check
- `POST /api/claude/message` - Send message to Claude
- `GET /api/team/sessions` - Get team coordination sessions
- `GET /api/team/analytics` - Get team analytics

## 📁 Project Structure

```
tvrf-command-center/
├── public/                 # Static web files
│   ├── index.html         # Main dashboard
│   └── assets/            # CSS, JS, images
├── server.js              # Express server
├── package.json           # Dependencies
├── railway.json           # Railway configuration
└── README.md              # This file
```

## 🔒 Security

- API keys are stored securely in Railway's environment variables
- CORS is enabled for development flexibility
- No sensitive data is logged to console

## 📊 Monitoring

### Health Checks
- Visit `/health` endpoint to check service status
- Returns JSON with timestamp and status

### Logs
- View deployment logs in Railway dashboard
- Monitor real-time logs during development

## 🚀 Scaling

Railway automatically handles:
- Load balancing
- SSL certificates
- Custom domains
- Automatic deployments on git push

## 🐛 Troubleshooting

### Common Issues

1. **"API keys not configured" message**
   - Ensure `CLAUDE_API_KEY` or `OPENAI_API_KEY` is set in Railway variables
   - Redeploy after adding variables

2. **Build failures**
   - Check that all dependencies are listed in `package.json`
   - Verify Node.js version compatibility

3. **Port issues**
   - Railway automatically sets `PORT` environment variable
   - Server.js already handles this correctly

### Getting Help

1. Check Railway logs in the dashboard
2. Verify environment variables are set correctly
3. Test locally with `npm start` first

## 📈 Future Enhancements

- Database integration for chat history
- Real-time notifications
- Advanced agent communication protocols
- Custom domain support
- Team performance analytics dashboard

## 📄 License

MIT License - feel free to use and modify for your projects.

---

**Live Dashboard**: https://51md2zpfxrjy.space.minimax.io  
**Repository**: https://github.com/buge4/tvrf-command-center