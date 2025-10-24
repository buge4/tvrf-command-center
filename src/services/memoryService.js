class MemoryService {
  constructor(supabaseService) {
    this.supabaseService = supabaseService;
    this.maxHistoryLength = 20; // Maximum conversation pairs to keep in memory
  }

  async getFormattedHistory(sessionId) {
    const result = await this.supabaseService.getConversationHistory(
      sessionId, 
      this.maxHistoryLength * 2
    );

    if (!result.success || !result.data) {
      return [];
    }

    // Format for Claude API: alternating user/assistant messages
    const formattedHistory = [];
    for (const conversation of result.data) {
      formattedHistory.push(
        { role: 'user', content: conversation.message },
        { role: 'assistant', content: conversation.response }
      );
    }

    return formattedHistory;
  }

  async addToMemory(sessionId, message, response, userId = null) {
    return await this.supabaseService.saveConversation(
      sessionId, 
      message, 
      response, 
      userId
    );
  }

  async getRecentContext(sessionId, messageCount = 5) {
    const result = await this.supabaseService.getConversationHistory(
      sessionId,
      messageCount
    );

    if (!result.success || !result.data) {
      return '';
    }

    // Create a text summary of recent conversations
    const contextLines = result.data.map(conv => 
      `User: ${conv.message}\nAssistant: ${conv.response}`
    );

    return contextLines.join('\n\n');
  }

  clearMemoryCache() {
    // For future enhancement: clear any in-memory caches
    console.log('Memory cache cleared');
  }
}

export default MemoryService;
