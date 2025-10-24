import { v4 as uuidv4 } from 'uuid';

class ChatController {
  constructor(claudeService, memoryService) {
    this.claudeService = claudeService;
    this.memoryService = memoryService;
  }

  async handleChatMessage(req, res) {
    try {
      const { message, sessionId, useHistory = true } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      // Use provided session ID or generate new one
      const currentSessionId = sessionId || uuidv4();

      // Get conversation history if requested
      let conversationHistory = [];
      if (useHistory && sessionId) {
        conversationHistory = await this.memoryService.getFormattedHistory(currentSessionId);
      }

      // Send message to Claude
      const response = await this.claudeService.sendMessage(message, conversationHistory);

      if (!response.success) {
        return res.status(500).json({
          success: false,
          error: response.error
        });
      }

      // Save to memory
      await this.memoryService.addToMemory(
        currentSessionId,
        message,
        response.content
      );

      return res.json({
        success: true,
        sessionId: currentSessionId,
        message: response.content,
        usage: response.usage
      });
    } catch (error) {
      console.error('Chat message error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getConversationHistory(req, res) {
    try {
      const { sessionId } = req.params;
      const { limit = 50 } = req.query;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      const result = await this.memoryService.supabaseService.getConversationHistory(
        sessionId,
        parseInt(limit)
      );

      return res.json(result);
    } catch (error) {
      console.error('Get conversation history error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getAllConversations(req, res) {
    try {
      const { limit = 100 } = req.query;

      const result = await this.memoryService.supabaseService.getAllConversations(
        parseInt(limit)
      );

      return res.json(result);
    } catch (error) {
      console.error('Get all conversations error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async streamChatMessage(req, res) {
    try {
      const { message, sessionId, useHistory = true } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      const currentSessionId = sessionId || uuidv4();

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let conversationHistory = [];
      if (useHistory && sessionId) {
        conversationHistory = await this.memoryService.getFormattedHistory(currentSessionId);
      }

      let fullResponse = '';

      const response = await this.claudeService.streamMessage(
        message,
        conversationHistory,
        (chunk) => {
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      );

      if (response.success) {
        // Save to memory
        await this.memoryService.addToMemory(
          currentSessionId,
          message,
          fullResponse
        );

        res.write(`data: ${JSON.stringify({ 
          done: true, 
          sessionId: currentSessionId 
        })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ 
          error: response.error 
        })}\n\n`);
      }

      res.end();
    } catch (error) {
      console.error('Stream chat error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}

export default ChatController;
