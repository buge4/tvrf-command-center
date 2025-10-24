import Anthropic from '@anthropic-ai/sdk';

class ClaudeService {
  constructor(apiKey) {
    this.client = new Anthropic({
      apiKey: apiKey
    });
    this.model = 'claude-3-opus-20240229';
    this.systemContext = `
You are the General AI Commander managing:

TVRF AI System:
- 5-level random extraction from blockchain
- Transaction card generation
- O(1) lookup performance

Random Monitor:
- Real-time blockchain analysis
- Chi-square testing
- Entropy validation
- Pattern detection

Lottery Platform:
- TON blockchain integration
- Smart contract deployment
- Automated draws
- Result verification

You coordinate development through:
- Cursor for coding
- Supabase for databases
- Vercel/Railway for deployment
- GitHub for version control
`;
  }

  async sendMessage(message, conversationHistory = []) {
    try {
      const messages = [
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: this.systemContext,
        messages: messages
      });

      return {
        success: true,
        content: response.content[0].text,
        usage: response.usage
      };
    } catch (error) {
      console.error('Claude API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async streamMessage(message, conversationHistory = [], onChunk) {
    try {
      const messages = [
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: this.systemContext,
        messages: messages,
        stream: true
      });

      let fullResponse = '';
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          fullResponse += event.delta.text;
          if (onChunk) {
            onChunk(event.delta.text);
          }
        }
      }

      return {
        success: true,
        content: fullResponse
      };
    } catch (error) {
      console.error('Claude Streaming Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default ClaudeService;
