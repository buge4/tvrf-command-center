import express from 'express';

function createRoutes(chatController, projectController, teamCoordinationService) {
  const router = express.Router();

  // Health check
  router.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'TVRF Command Center'
    });
  });

  // Chat routes
  router.post('/chat', (req, res) => chatController.handleChatMessage(req, res));
  router.post('/chat/stream', (req, res) => chatController.streamChatMessage(req, res));
  router.get('/chat/history/:sessionId', (req, res) => chatController.getConversationHistory(req, res));
  router.get('/chat/all', (req, res) => chatController.getAllConversations(req, res));

  // Project routes
  router.post('/projects', (req, res) => projectController.createProject(req, res));
  router.get('/projects', (req, res) => projectController.getProjects(req, res));
  router.put('/projects/:id', (req, res) => projectController.updateProject(req, res));
  router.delete('/projects/:id', (req, res) => projectController.deleteProject(req, res));

  // Project session routes
  router.post('/projects/sessions', (req, res) => projectController.saveProjectSession(req, res));
  router.get('/projects/:projectId/sessions', (req, res) => projectController.getProjectSessions(req, res));

  // Team coordination routes
  router.post('/team/sessions', async (req, res) => {
    try {
      const { sessionName, sessionType, coordinatorAgent } = req.body;
      const result = await teamCoordinationService.createTeamSession(
        sessionName, 
        sessionType, 
        coordinatorAgent
      );
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/team/sessions/:sessionId', async (req, res) => {
    try {
      const result = await teamCoordinationService.getTeamSession(req.params.sessionId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/team/sessions/:sessionId/contributions', async (req, res) => {
    try {
      const { agentId, agentType, contributionType, content, confidenceScore } = req.body;
      const result = await teamCoordinationService.addAgentContribution(
        req.params.sessionId,
        agentId,
        agentType,
        contributionType,
        content,
        confidenceScore
      );
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/team/sessions/:sessionId/consensus', async (req, res) => {
    try {
      const { decisionTopic, decisionCategory, agentRecommendations } = req.body;
      const result = await teamCoordinationService.buildConsensus(
        req.params.sessionId,
        decisionTopic,
        decisionCategory,
        agentRecommendations
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/team/sessions/:sessionId/messages', async (req, res) => {
    try {
      const { senderAgent, receiverAgent, messageType, content, priority, requiresResponse } = req.body;
      const result = await teamCoordinationService.sendAgentMessage(
        req.params.sessionId,
        senderAgent,
        receiverAgent,
        messageType,
        content,
        priority,
        requiresResponse
      );
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/team/sessions/:sessionId/complete', async (req, res) => {
    try {
      const { results } = req.body;
      const result = await teamCoordinationService.completeTeamSession(
        req.params.sessionId,
        results
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/team/emergency', async (req, res) => {
    try {
      const { alertType, alertData } = req.body;
      const result = await teamCoordinationService.createEmergencyResponse(alertType, alertData);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/team/analytics', async (req, res) => {
    try {
      const { timeRange } = req.query;
      const result = await teamCoordinationService.getTeamAnalytics(timeRange);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

export default createRoutes;
