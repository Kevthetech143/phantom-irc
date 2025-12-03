import Anthropic from '@anthropic-ai/sdk';

/**
 * Phantom AI Service - Claude API integration
 * Provides spam filtering and message summarization
 */
class PhantomAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = apiKey ? new Anthropic({ apiKey, dangerouslyAllowBrowser: true }) : null;
    this.enabled = !!apiKey;
  }

  /**
   * Check if a message is spam
   * @param {string} message - Message text
   * @param {string} channel - Channel context
   * @returns {Promise<Object>} { isSpam: boolean, confidence: number, reason: string }
   */
  async checkSpam(message, channel) {
    if (!this.enabled) {
      return { isSpam: false, confidence: 0, reason: 'AI disabled' };
    }

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Analyze if this IRC message is spam. Reply with ONLY "SPAM" or "LEGITIMATE" followed by confidence (0-100) and reason.

Channel: ${channel}
Message: "${message}"

Format: [SPAM/LEGITIMATE]|[0-100]|[reason]`
        }]
      });

      const result = response.content[0].text.trim();
      const [classification, confidence, reason] = result.split('|').map(s => s.trim());

      return {
        isSpam: classification.toUpperCase() === 'SPAM',
        confidence: parseInt(confidence) || 50,
        reason: reason || 'No reason provided'
      };
    } catch (error) {
      console.error('AI spam check failed:', error);
      return { isSpam: false, confidence: 0, reason: 'AI error' };
    }
  }

  /**
   * Summarize channel messages
   * @param {Array} messages - Array of message objects
   * @param {string} channel - Channel name
   * @returns {Promise<string>} Summary text
   */
  async summarizeMessages(messages, channel) {
    if (!this.enabled) {
      return 'AI summarization disabled. No API key provided.';
    }

    if (!messages || messages.length === 0) {
      return 'No messages to summarize.';
    }

    try {
      // Format messages for Claude
      const messageText = messages.map(m =>
        `[${m.time.toLocaleTimeString()}] <${m.from}> ${m.message}`
      ).join('\n');

      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Summarize this IRC conversation in ${channel}. Focus on main topics, decisions, and important links. Be concise (2-3 sentences max).

${messageText}

Summary:`
        }]
      });

      return response.content[0].text.trim();
    } catch (error) {
      console.error('AI summarization failed:', error);
      return 'Failed to generate summary. AI service error.';
    }
  }

  /**
   * Get smart notification priority
   * @param {string} message - Message text
   * @param {string} userNick - Current user's nickname
   * @returns {Promise<Object>} { priority: 'high'|'medium'|'low', reason: string }
   */
  async getNotificationPriority(message, userNick) {
    if (!this.enabled) {
      return { priority: 'medium', reason: 'AI disabled' };
    }

    try {
      const mentionsUser = message.toLowerCase().includes(userNick.toLowerCase());
      if (mentionsUser) {
        return { priority: 'high', reason: 'Direct mention' };
      }

      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: `Rate notification priority for this IRC message. Reply ONLY with: HIGH, MEDIUM, or LOW

Message: "${message}"

Priority:`
        }]
      });

      const priority = response.content[0].text.trim().toLowerCase();
      return {
        priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
        reason: 'AI analysis'
      };
    } catch (error) {
      console.error('AI notification priority failed:', error);
      return { priority: 'medium', reason: 'AI error' };
    }
  }

  /**
   * Check if AI is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }
}

export default PhantomAI;
