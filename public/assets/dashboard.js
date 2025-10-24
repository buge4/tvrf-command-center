// Dashboard JavaScript

class DashboardApp {
    constructor() {
        this.currentView = 'chat';
        this.sessionId = null;
        this.projects = [];
        this.isOnline = false; // Assume offline initially
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkSystemStatus();
        this.loadSessionFromStorage();
        
        // Check status periodically
        setInterval(() => this.checkSystemStatus(), 30000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchView(e.currentTarget.dataset.view);
            });
        });

        // Chat
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        document.getElementById('newSessionBtn').addEventListener('click', () => this.startNewSession());

        // Projects
        document.getElementById('newProjectBtn').addEventListener('click', () => this.showNewProjectModal());
        document.getElementById('cancelProjectBtn').addEventListener('click', () => this.hideNewProjectModal());
        document.getElementById('createProjectBtn').addEventListener('click', () => this.createProject());

        // History
        document.getElementById('refreshHistoryBtn').addEventListener('click', () => this.loadHistory());

        // Army Functions
        document.getElementById('createTeamSessionBtn').addEventListener('click', () => this.showNewMissionModal());
        document.getElementById('cancelMissionBtn').addEventListener('click', () => this.hideNewMissionModal());
        document.getElementById('launchMissionBtn').addEventListener('click', () => this.launchMission());
        document.getElementById('emergencyProtocolBtn').addEventListener('click', () => this.triggerEmergencyProtocol());
        document.getElementById('closeAgentCommBtn').addEventListener('click', () => this.hideAgentCommModal());
    }

    switchView(view) {
        this.currentView = view;
        
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // Update views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.toggle('active', v.id === `${view}View`);
        });

        // Load data for view
        if (view === 'projects') {
            this.loadProjects();
        } else if (view === 'history') {
            this.loadHistory();
        } else if (view === 'army') {
            this.loadArmyData();
        }
    }

    async checkSystemStatus() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            
            const statusEl = document.getElementById('systemStatus');
            const statusDot = document.querySelector('.status-dot');
            
            if (data.status === 'ok' || data.status === 'healthy') {
                statusEl.textContent = 'Connected';
                statusDot.style.background = '#10b981';
                this.isOnline = true;
                this.loadArmyData(); // Load live data
            } else {
                throw new Error('Server responded with unhealthy status');
            }
        } catch (error) {
            const statusEl = document.getElementById('systemStatus');
            const statusDot = document.querySelector('.status-dot');
            
            // Use mock data in offline mode
            this.isOnline = false;
            statusEl.textContent = 'Demo Mode';
            statusDot.style.background = '#f59e0b';
            
            // Load mock Army data for demonstration
            this.loadMockArmyData();
        }
    }

    // Chat Functions
    loadSessionFromStorage() {
        const stored = localStorage.getItem('tvrf_session_id');
        if (stored) {
            this.sessionId = stored;
            this.updateSessionDisplay();
            this.loadConversationHistory();
        }
    }

    startNewSession() {
        this.sessionId = null;
        localStorage.removeItem('tvrf_session_id');
        document.getElementById('chatMessages').innerHTML = '';
        this.updateSessionDisplay();
    }

    updateSessionDisplay() {
        const sessionEl = document.getElementById('sessionId');
        sessionEl.textContent = this.sessionId ? this.sessionId.substring(0, 8) + '...' : 'New';
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        const sendBtn = document.getElementById('sendBtn');
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';

        // Display user message
        this.addMessageToChat('user', message);
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            if (this.isOnline) {
                // Live mode - make API call
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message,
                        sessionId: this.sessionId,
                        useHistory: true
                    })
                });

                const data = await response.json();

                this.removeTypingIndicator();

                if (data.success) {
                    // Update session ID
                    if (!this.sessionId && data.sessionId) {
                        this.sessionId = data.sessionId;
                        localStorage.setItem('tvrf_session_id', this.sessionId);
                        this.updateSessionDisplay();
                    }

                    // Display assistant response
                    this.addMessageToChat('assistant', data.message);
                } else {
                    this.addMessageToChat('assistant', 'Error: ' + data.error);
                }
            } else {
                // Demo mode - provide mock responses
                setTimeout(() => {
                    this.removeTypingIndicator();
                    const demoResponse = this.generateDemoResponse(message);
                    this.addMessageToChat('assistant', demoResponse);
                }, 1500 + Math.random() * 2000); // Random delay to simulate thinking
            }
        } catch (error) {
            this.removeTypingIndicator();
            
            // If we're offline or API fails, use demo mode
            if (!this.isOnline) {
                const demoResponse = this.generateDemoResponse(message);
                this.addMessageToChat('assistant', demoResponse);
            } else {
                this.addMessageToChat('assistant', 'Connection error. Please try again.');
            }
            console.error('Send message error:', error);
        }

        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
    }

    generateDemoResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Greeting responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! Welcome to the TVRF Command Center. I'm the AI Commander, ready to assist you with your strategic operations. Currently running in Demo Mode - deploy to Railway for full functionality!";
        }
        
        // Status queries
        if (lowerMessage.includes('status') || lowerMessage.includes('how are you')) {
            return "All systems are operational! Currently running in Demo Mode with full UI functionality. The AI Army is standing by with 5 active agents: System Analyst, Development Agent, Monitoring Agent, Strategy Agent, and Security Agent.";
        }
        
        // Help requests
        if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
            return "I can help you with strategic command operations, team coordination, and mission management. In Demo Mode, you can explore the full interface including: Chat, Projects, History, and the AI Army visualization with agent communication. Deploy to Railway for full AI capabilities!";
        }
        
        // Army-related queries
        if (lowerMessage.includes('army') || lowerMessage.includes('agent') || lowerMessage.includes('team')) {
            return "The TVRF AI Army consists of 5 specialized agents working in perfect coordination. You can see them in the Army tab - each has different capabilities and expertise. Click 'Communicate' to interact directly with any agent!";
        }
        
        // Mission queries
        if (lowerMessage.includes('mission') || lowerMessage.includes('task')) {
            return "Mission control is fully operational! You can create new missions, monitor active operations, and coordinate between agents. The system shows real-time progress and agent consensus levels.";
        }
        
        // Demo mode queries
        if (lowerMessage.includes('demo') || lowerMessage.includes('offline') || lowerMessage.includes('mock')) {
            return "Yes, this is Demo Mode! All the UI features are working perfectly - you can explore the full interface, view agent status, create projects, and see the analytics dashboard. Deploy to Railway for full API functionality with your own AI keys!";
        }
        
        // Deploy/Railway queries
        if (lowerMessage.includes('deploy') || lowerMessage.includes('railway') || lowerMessage.includes('production')) {
            return "Ready for Railway deployment! All configuration files are set up in the GitHub repository. Just add your API keys in Railway's environment variables and deploy. The Express server will handle all the backend functionality.";
        }
        
        // Default responses
        const defaultResponses = [
            "Acknowledged, Commander. I'm processing your request through the TVRF Command Center. This is Demo Mode - all features are functional for testing!",
            "Roger that! Your command has been received and processed. Currently operating in Demo Mode with full interface access.",
            "Command processed successfully. All TVRF systems are operational. Ready for your next directive!",
            "Understood, Commander. The AI Army is standing by for your strategic decisions. Demo Mode is active with all features enabled.",
            "Message received and logged. This is TVRF Command Center Demo Mode - perfect for exploring all capabilities before Railway deployment!"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    addMessageToChat(role, content) {
        const messagesContainer = document.getElementById('chatMessages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const label = document.createElement('div');
        label.className = 'message-label';
        label.textContent = role === 'user' ? 'You' : 'AI Commander';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(label);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator-wrapper';
        typingDiv.id = 'typingIndicator';
        
        const label = document.createElement('div');
        label.className = 'message-label';
        label.textContent = 'AI Commander';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
        
        contentDiv.appendChild(typingIndicator);
        typingDiv.appendChild(label);
        typingDiv.appendChild(contentDiv);
        messagesContainer.appendChild(typingDiv);
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async loadConversationHistory() {
        if (!this.sessionId) return;

        try {
            if (this.isOnline) {
                // Live mode - load from API
                const response = await fetch(`/api/chat/history/${this.sessionId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    document.getElementById('chatMessages').innerHTML = '';
                    data.data.forEach(conv => {
                        this.addMessageToChat('user', conv.message);
                        this.addMessageToChat('assistant', conv.response);
                    });
                }
            } else {
                // Demo mode - load from localStorage or show welcome message
                this.loadDemoConversation();
            }
        } catch (error) {
            console.error('Load history error:', error);
            // Fallback to demo mode
            this.loadDemoConversation();
        }
    }

    loadDemoConversation() {
        // Show a welcome message in demo mode
        document.getElementById('chatMessages').innerHTML = `
            <div class="message assistant">
                <div class="message-label">AI Commander</div>
                <div class="message-content">Welcome to TVRF Command Center Demo! I'm the AI Commander, and all systems are operational. You can chat with me, explore the Projects, History, and Army sections. Deploy to Railway for full AI capabilities!</div>
            </div>
        `;
    }

    // Project Functions
    async loadProjects() {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();

            if (data.success && data.data) {
                this.projects = data.data;
                this.displayProjects();
            }
        } catch (error) {
            console.error('Load projects error:', error);
        }
    }

    displayProjects() {
        const container = document.getElementById('projectsList');
        
        if (this.projects.length === 0) {
            container.innerHTML = '<div class="loading">No projects yet. Create your first project!</div>';
            return;
        }

        container.innerHTML = this.projects.map(project => `
            <div class="project-card">
                <h3>${this.escapeHtml(project.name)}</h3>
                <p>${this.escapeHtml(project.description || 'No description')}</p>
                <div>
                    <span class="project-status ${project.status}">${project.status}</span>
                    <small style="color: #718096; margin-left: 1rem;">
                        Created: ${new Date(project.created_at).toLocaleDateString()}
                    </small>
                </div>
            </div>
        `).join('');
    }

    showNewProjectModal() {
        document.getElementById('newProjectModal').classList.add('active');
    }

    hideNewProjectModal() {
        document.getElementById('newProjectModal').classList.remove('active');
        document.getElementById('projectName').value = '';
        document.getElementById('projectDescription').value = '';
    }

    async createProject() {
        const name = document.getElementById('projectName').value.trim();
        const description = document.getElementById('projectDescription').value.trim();

        if (!name) {
            alert('Project name is required');
            return;
        }

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description })
            });

            const data = await response.json();

            if (data.success) {
                this.hideNewProjectModal();
                this.loadProjects();
            } else {
                alert('Error creating project: ' + data.error);
            }
        } catch (error) {
            console.error('Create project error:', error);
            alert('Connection error. Please try again.');
        }
    }

    // History Functions
    async loadHistory() {
        const container = document.getElementById('historyList');
        container.innerHTML = '<div class="loading">Loading...</div>';

        try {
            const response = await fetch('/api/chat/all?limit=50');
            const data = await response.json();

            if (data.success && data.data) {
                if (data.data.length === 0) {
                    container.innerHTML = '<div class="loading">No conversation history yet</div>';
                    return;
                }

                container.innerHTML = data.data.map(conv => `
                    <div class="history-item">
                        <div class="history-timestamp">${new Date(conv.timestamp).toLocaleString()}</div>
                        <div class="message-label">User</div>
                        <div style="margin-bottom: 1rem; color: #4a5568;">${this.escapeHtml(conv.message)}</div>
                        <div class="message-label">AI Commander</div>
                        <div style="color: #2d3748;">${this.escapeHtml(conv.response)}</div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="loading">Error loading history</div>';
            }
        } catch (error) {
            console.error('Load history error:', error);
            container.innerHTML = '<div class="loading">Connection error</div>';
        }
    }

    // Army Functions
    async loadArmyData() {
        if (this.isOnline) {
            this.loadAgentStatus();
            this.loadActiveMissions();
            this.loadTeamAnalytics();
        } else {
            this.loadMockArmyData();
        }
    }

    loadMockArmyData() {
        // Mock Army data for demo/offline mode
        this.agents = [
            {
                id: 'system-analyst',
                name: 'System Analyst',
                type: 'SystemAnalyst',
                status: 'online',
                confidence: 92,
                active: true,
                tasksCompleted: 47,
                lastActivity: new Date().toISOString(),
                workload: 75
            },
            {
                id: 'development',
                name: 'Development Agent',
                type: 'Development',
                status: 'online',
                confidence: 88,
                active: true,
                tasksCompleted: 32,
                lastActivity: new Date().toISOString(),
                workload: 60
            },
            {
                id: 'monitoring',
                name: 'Monitoring Agent',
                type: 'Monitoring',
                status: 'online',
                confidence: 95,
                active: true,
                tasksCompleted: 89,
                lastActivity: new Date().toISOString(),
                workload: 45
            },
            {
                id: 'strategy',
                name: 'Strategy Agent',
                type: 'Strategy',
                status: 'online',
                confidence: 90,
                active: true,
                tasksCompleted: 28,
                lastActivity: new Date().toISOString(),
                workload: 55
            },
            {
                id: 'security',
                name: 'Security Agent',
                type: 'Security',
                status: 'online',
                confidence: 98,
                active: true,
                tasksCompleted: 67,
                lastActivity: new Date().toISOString(),
                workload: 30
            }
        ];

        this.displayAgents();
        this.updateMockAnalytics();
    }

    updateMockAnalytics() {
        const analyticsContainer = document.getElementById('teamAnalytics');
        if (analyticsContainer) {
            analyticsContainer.innerHTML = `
                <div class="analytics-item">
                    <div class="analytics-label">Total Agents</div>
                    <div class="analytics-value">5</div>
                </div>
                <div class="analytics-item">
                    <div class="analytics-label">Active Missions</div>
                    <div class="analytics-value">2</div>
                </div>
                <div class="analytics-item">
                    <div class="analytics-label">Success Rate</div>
                    <div class="analytics-value">94%</div>
                </div>
                <div class="analytics-item">
                    <div class="analytics-label">Avg Response</div>
                    <div class="analytics-value">0.8s</div>
                </div>
            `;
        }
    }

    async loadAgentStatus() {
        const container = document.getElementById('agentsGrid');
        
        // Define the AI agents
        const agents = [
            {
                name: 'System Analyst',
                type: 'SYSTEM_ANALYST',
                role: 'Data Analysis & Insights',
                weight: '25%',
                status: 'active',
                missions: Math.floor(Math.random() * 10) + 5,
                consensus: Math.floor(Math.random() * 30) + 70
            },
            {
                name: 'Development Agent',
                type: 'DEVELOPMENT',
                role: 'Code & Implementation',
                weight: '25%',
                status: 'active',
                missions: Math.floor(Math.random() * 15) + 8,
                consensus: Math.floor(Math.random() * 25) + 75
            },
            {
                name: 'Monitoring Agent',
                type: 'MONITORING',
                role: 'System Health & Alerts',
                weight: '20%',
                status: 'idle',
                missions: Math.floor(Math.random() * 8) + 3,
                consensus: Math.floor(Math.random() * 20) + 80
            },
            {
                name: 'Strategy Agent',
                type: 'STRATEGY',
                role: 'Strategic Planning',
                weight: '20%',
                status: 'active',
                missions: Math.floor(Math.random() * 12) + 6,
                consensus: Math.floor(Math.random() * 35) + 65
            },
            {
                name: 'Security Agent',
                type: 'SECURITY',
                role: 'Security Assessment',
                weight: '10%',
                status: 'active',
                missions: Math.floor(Math.random() * 6) + 2,
                consensus: Math.floor(Math.random() * 15) + 85
            }
        ];

        container.innerHTML = agents.map(agent => `
            <div class="agent-card ${agent.status}" data-agent="${agent.type}">
                <div class="agent-header">
                    <div class="agent-name">${agent.name}</div>
                    <div class="agent-status ${agent.status}">${agent.status}</div>
                </div>
                <div class="agent-role">${agent.role}</div>
                
                <div class="agent-stats">
                    <div class="agent-stat">
                        <div class="agent-stat-value">${agent.missions}</div>
                        <div class="agent-stat-label">Missions</div>
                    </div>
                    <div class="agent-stat">
                        <div class="agent-stat-value">${agent.consensus}%</div>
                        <div class="agent-stat-label">Consensus</div>
                    </div>
                </div>
                
                <div class="agent-weight">
                    <div class="agent-weight-label">Influence Weight</div>
                    <div class="agent-weight-bar">
                        <div class="agent-weight-fill" style="width: ${agent.weight}"></div>
                    </div>
                    <div style="text-align: right; font-size: 0.75rem; color: #718096; margin-top: 0.25rem;">${agent.weight}</div>
                </div>
                
                <div class="agent-actions">
                    <button class="btn-communicate" onclick="dashboardApp.communicateWithAgent('${agent.type}', '${agent.name}')">
                        Communicate
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadActiveMissions() {
        const container = document.getElementById('activeMissions');
        container.innerHTML = '<div class="loading">Loading missions...</div>';

        try {
            // For demo purposes, show sample missions
            const sampleMissions = [
                {
                    name: 'Database Optimization',
                    type: 'Development',
                    participants: ['Development Agent', 'System Analyst'],
                    status: 'active',
                    progress: 65
                },
                {
                    name: 'Security Audit',
                    type: 'Security',
                    participants: ['Security Agent', 'Monitoring Agent'],
                    status: 'active',
                    progress: 30
                },
                {
                    name: 'Performance Analysis',
                    type: 'Analysis',
                    participants: ['System Analyst', 'Strategy Agent'],
                    status: 'active',
                    progress: 90
                }
            ];

            container.innerHTML = sampleMissions.map(mission => `
                <div class="mission-card">
                    <div class="mission-header">
                        <div class="mission-name">${mission.name}</div>
                        <div class="mission-type">${mission.type}</div>
                    </div>
                    <div class="mission-participants">
                        <strong>Agents:</strong> ${mission.participants.join(', ')}
                    </div>
                    <div class="mission-status">
                        <div style="flex: 1; background: #e2e8f0; height: 8px; border-radius: 4px; margin-right: 1rem;">
                            <div style="width: ${mission.progress}%; height: 100%; background: #48bb78; border-radius: 4px; transition: width 0.3s;"></div>
                        </div>
                        <span style="font-size: 0.875rem; color: #718096;">${mission.progress}%</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Load missions error:', error);
            container.innerHTML = '<div class="loading">Error loading missions</div>';
        }
    }

    async loadTeamAnalytics() {
        const container = document.getElementById('teamAnalytics');
        
        try {
            // Sample analytics data
            const analytics = [
                { value: '12', label: 'Active Missions' },
                { value: '87%', label: 'Consensus Rate' },
                { value: '2.3s', label: 'Avg Response' },
                { value: '5', label: 'Online Agents' }
            ];

            container.innerHTML = analytics.map(stat => `
                <div class="analytics-card">
                    <div class="analytics-value">${stat.value}</div>
                    <div class="analytics-label">${stat.label}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Load analytics error:', error);
            container.innerHTML = '<div class="loading">Error loading analytics</div>';
        }
    }

    showNewMissionModal() {
        document.getElementById('newMissionModal').classList.add('active');
    }

    hideNewMissionModal() {
        document.getElementById('newMissionModal').classList.remove('active');
        document.getElementById('missionName').value = '';
        document.getElementById('missionBrief').value = '';
    }

    async launchMission() {
        const name = document.getElementById('missionName').value.trim();
        const type = document.getElementById('missionType').value;
        const brief = document.getElementById('missionBrief').value.trim();

        if (!name) {
            alert('Mission name is required');
            return;
        }

        try {
            const response = await fetch('/api/team/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionName: name,
                    sessionType: type,
                    coordinatorAgent: 'AICommander'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.hideNewMissionModal();
                this.loadActiveMissions();
                alert(`Mission "${name}" launched successfully!`);
            } else {
                alert('Error launching mission: ' + data.error);
            }
        } catch (error) {
            console.error('Launch mission error:', error);
            alert('Connection error. Please try again.');
        }
    }

    async triggerEmergencyProtocol() {
        const confirmed = confirm('This will activate emergency protocol across all agents. Continue?');
        if (!confirmed) return;

        try {
            const response = await fetch('/api/team/emergency', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    alertType: 'SYSTEM_ALERT',
                    alertData: {
                        severity: 'CRITICAL',
                        message: 'Emergency protocol activated by commander',
                        timestamp: new Date().toISOString()
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Emergency protocol activated! All agents are now on high alert.');
                this.loadAgentStatus();
            } else {
                alert('Error activating emergency protocol: ' + data.error);
            }
        } catch (error) {
            console.error('Emergency protocol error:', error);
            alert('Connection error. Please try again.');
        }
    }

    communicateWithAgent(agentType, agentName) {
        const content = `
            <div style="margin-bottom: 1rem;">
                <h3>Direct Communication with ${agentName}</h3>
                <p style="color: #718096;">Send a message directly to this agent</p>
            </div>
            <textarea id="agentMessage" placeholder="Enter your message to ${agentName}..." rows="4" style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 1rem;"></textarea>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="dashboardApp.sendAgentMessage('${agentType}')" class="btn-primary" style="flex: 1;">Send Message</button>
                <button onclick="dashboardApp.requestAgentReport('${agentType}')" class="btn-secondary" style="flex: 1;">Request Status Report</button>
            </div>
            <div id="agentCommLog" style="margin-top: 1rem; max-height: 200px; overflow-y: auto;"></div>
        `;
        
        document.getElementById('agentCommContent').innerHTML = content;
        document.getElementById('agentCommModal').classList.add('active');
    }

    async sendAgentMessage(agentType) {
        const message = document.getElementById('agentMessage').value.trim();
        if (!message) return;

        // Add message to log
        const log = document.getElementById('agentCommLog');
        log.innerHTML += `
            <div class="agent-comm-item">
                <div class="agent-comm-header">
                    <div class="agent-comm-sender">You → ${agentType}</div>
                    <div class="agent-comm-timestamp">${new Date().toLocaleTimeString()}</div>
                </div>
                <div class="agent-comm-message">${this.escapeHtml(message)}</div>
            </div>
        `;

        // Clear input
        document.getElementById('agentMessage').value = '';
        
        // Simulate agent response
        setTimeout(() => {
            const responses = [
                "Message received and acknowledged. Standing by for further instructions.",
                "Analyzing request. Will provide detailed response shortly.",
                "Agent online and ready. Executing assigned tasks.",
                "Status update: All systems operational. Ready for new directives.",
                "Roger. Processing your command with highest priority."
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            log.innerHTML += `
                <div class="agent-comm-item">
                    <div class="agent-comm-header">
                        <div class="agent-comm-sender">${agentType} → You</div>
                        <div class="agent-comm-timestamp">${new Date().toLocaleTimeString()}</div>
                    </div>
                    <div class="agent-comm-message">${randomResponse}</div>
                </div>
            `;
            log.scrollTop = log.scrollHeight;
        }, 1000 + Math.random() * 2000);
    }

    async requestAgentReport(agentType) {
        const log = document.getElementById('agentCommLog');
        log.innerHTML += `
            <div class="agent-comm-item">
                <div class="agent-comm-header">
                    <div class="agent-comm-sender">System</div>
                    <div class="agent-comm-timestamp">${new Date().toLocaleTimeString()}</div>
                </div>
                <div class="agent-comm-message">Requesting status report from ${agentType}...</div>
            </div>
        `;

        setTimeout(() => {
            const reports = {
                'SYSTEM_ANALYST': "Current analysis: Processing 3 data streams. Performance metrics optimal. Resource utilization: 68%. Ready for next analytical task.",
                'DEVELOPMENT': "Development status: 2 active projects, 1 pending review. Code quality: 94%. Testing completion: 87%. Deploy pipeline ready.",
                'MONITORING': "System health: All parameters normal. 0 critical alerts. Response time: 234ms average. Monitoring 24/7 operations.",
                'STRATEGY': "Strategic assessment: Market trends analyzed. 3 opportunities identified. Risk factors minimal. Strategic recommendations updated.",
                'SECURITY': "Security status: All systems secure. Vulnerability scan completed. Threat level: Low. No anomalies detected. Security protocols active."
            };
            
            const report = reports[agentType] || "Status report: All systems operational and ready.";
            
            log.innerHTML += `
                <div class="agent-comm-item">
                    <div class="agent-comm-header">
                        <div class="agent-comm-sender">${agentType} → You</div>
                        <div class="agent-comm-timestamp">${new Date().toLocaleTimeString()}</div>
                    </div>
                    <div class="agent-comm-message">${report}</div>
                </div>
            `;
            log.scrollTop = log.scrollHeight;
        }, 1500);
    }

    hideAgentCommModal() {
        document.getElementById('agentCommModal').classList.remove('active');
    }

    // Utility
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});
