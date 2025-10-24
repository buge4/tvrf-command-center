// Dashboard JavaScript

class DashboardApp {
    constructor() {
        this.currentView = 'chat';
        this.sessionId = null;
        this.projects = [];
        
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
        }
    }

    async checkSystemStatus() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            
            const statusEl = document.getElementById('systemStatus');
            const statusDot = document.querySelector('.status-dot');
            
            if (data.status === 'healthy') {
                statusEl.textContent = 'Connected';
                statusDot.style.background = '#10b981';
            } else {
                statusEl.textContent = 'Disconnected';
                statusDot.style.background = '#ef4444';
            }
        } catch (error) {
            const statusEl = document.getElementById('systemStatus');
            const statusDot = document.querySelector('.status-dot');
            statusEl.textContent = 'Offline';
            statusDot.style.background = '#ef4444';
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
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessageToChat('assistant', 'Connection error. Please try again.');
            console.error('Send message error:', error);
        }

        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
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
            const response = await fetch(`/api/chat/history/${this.sessionId}`);
            const data = await response.json();

            if (data.success && data.data) {
                document.getElementById('chatMessages').innerHTML = '';
                data.data.forEach(conv => {
                    this.addMessageToChat('user', conv.message);
                    this.addMessageToChat('assistant', conv.response);
                });
            }
        } catch (error) {
            console.error('Load history error:', error);
        }
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
