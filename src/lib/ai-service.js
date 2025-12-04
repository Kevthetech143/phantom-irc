/**
 * Phantom AI Service - Multi-Provider AI Integration
 * Supports: Anthropic (Claude), OpenAI (GPT), and more
 *
 * Build: v5-multi-provider
 */

import { createProvider, detectProvider, getProviderInfo } from './ai-providers.js';

class PhantomAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.providerType = detectProvider(apiKey);
    this.provider = createProvider(apiKey);
    this.enabled = !!this.provider;
    this.providerInfo = getProviderInfo(this.providerType);
  }

  /**
   * Get provider information for UI display
   * @returns {Object} { name, icon, color, type }
   */
  getProviderInfo() {
    return {
      ...this.providerInfo,
      type: this.providerType,
      enabled: this.enabled
    };
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
      const prompt = `Analyze if this IRC message is spam. Reply with ONLY "SPAM" or "LEGITIMATE" followed by confidence (0-100) and reason.

Channel: ${channel}
Message: "${message}"

Format: [SPAM/LEGITIMATE]|[0-100]|[reason]`;

      const result = await this.provider.chat(prompt, { maxTokens: 100 });
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
      const messageText = messages.map(m =>
        `[${m.time.toLocaleTimeString()}] <${m.from}> ${m.message}`
      ).join('\n');

      const prompt = `Summarize this IRC conversation in ${channel}. Focus on main topics, decisions, and important links. Be concise (2-3 sentences max).

${messageText}

Summary:`;

      return await this.provider.chat(prompt, { maxTokens: 300 });
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

      const prompt = `Rate notification priority for this IRC message. Reply ONLY with: HIGH, MEDIUM, or LOW

Message: "${message}"

Priority:`;

      const result = await this.provider.chat(prompt, { maxTokens: 50 });
      const priority = result.toLowerCase();

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
   * Smart Catch-Up: Analyze messages and extract key topics/discussions
   * @param {Array} messages - Array of message objects
   * @param {string} channel - Channel name
   * @returns {Promise<Object>} { topics: Array, keyDecisions: Array, codeShared: number }
   */
  async smartCatchUp(messages, channel) {
    if (!this.enabled) {
      return { topics: [], keyDecisions: [], codeShared: 0, summary: 'AI disabled' };
    }

    if (!messages || messages.length === 0) {
      return { topics: [], keyDecisions: [], codeShared: 0, summary: 'No messages' };
    }

    try {
      const messageText = messages.map(m =>
        `[${m.time.toLocaleTimeString()}] <${m.from}> ${m.message}`
      ).join('\n');

      const prompt = `Analyze this IRC conversation for an AI developer who was away. Extract:
1. Main topics discussed (max 3)
2. Key decisions or conclusions (max 3)
3. Number of code snippets shared

Format your response as:
TOPICS: topic1 | topic2 | topic3
DECISIONS: decision1 | decision2 | decision3
CODE_SNIPPETS: <number>
SUMMARY: <2 sentence overview>

${messageText}`;

      const result = await this.provider.chat(prompt, { maxTokens: 500 });
      const topics = result.match(/TOPICS: (.*)/)?.[1]?.split('|').map(s => s.trim()).filter(Boolean) || [];
      const decisions = result.match(/DECISIONS: (.*)/)?.[1]?.split('|').map(s => s.trim()).filter(Boolean) || [];
      const codeShared = parseInt(result.match(/CODE_SNIPPETS: (\d+)/)?.[1] || '0');
      const summary = result.match(/SUMMARY: (.*)/)?.[1]?.trim() || 'No summary available';

      return { topics, keyDecisions: decisions, codeShared, summary };
    } catch (error) {
      console.error('Smart catch-up failed:', error);
      return { topics: [], keyDecisions: [], codeShared: 0, summary: 'AI error' };
    }
  }

  /**
   * Extract and analyze code snippets from messages
   * @param {Array} messages - Array of message objects
   * @returns {Promise<Array>} Array of { code, language, author, context, timestamp }
   */
  async extractCodeSnippets(messages) {
    if (!this.enabled) {
      return [];
    }

    const snippets = [];

    for (const msg of messages) {
      const codeBlockMatches = [...msg.message.matchAll(/```(\w+)?\n([\s\S]+?)```/g)];

      for (const match of codeBlockMatches) {
        const language = match[1] || 'unknown';
        const code = match[2].trim();

        try {
          const prompt = `Analyze this code snippet. Reply with ONLY:
LANGUAGE: <language>
PURPOSE: <one sentence what it does>
CATEGORY: <type like "bug-fix", "example", "utility", "config">

Code:
${code}`;

          const analysis = await this.provider.chat(prompt, { maxTokens: 150 });
          const detectedLang = analysis.match(/LANGUAGE: (.*)/)?.[1]?.trim() || language;
          const purpose = analysis.match(/PURPOSE: (.*)/)?.[1]?.trim() || 'Code snippet';
          const category = analysis.match(/CATEGORY: (.*)/)?.[1]?.trim() || 'general';

          snippets.push({
            code,
            language: detectedLang,
            author: msg.from,
            context: purpose,
            category,
            timestamp: msg.time,
            channel: msg.to || 'unknown'
          });
        } catch (error) {
          console.error('Code analysis failed:', error);
          snippets.push({
            code,
            language,
            author: msg.from,
            context: 'Code snippet',
            category: 'general',
            timestamp: msg.time,
            channel: msg.to || 'unknown'
          });
        }
      }
    }

    return snippets;
  }

  /**
   * Answer Bot Memory: Check if this question was answered before
   * @param {string} question - The question being asked
   * @param {Array} pastAnswers - Array of { question, answer, author, timestamp }
   * @returns {Promise<Object>} { foundAnswer: boolean, answer: string, similarity: number }
   */
  async findPastAnswer(question, pastAnswers) {
    if (!this.enabled || !pastAnswers || pastAnswers.length === 0) {
      return { foundAnswer: false, answer: null, similarity: 0 };
    }

    try {
      const qaText = pastAnswers.slice(-20).map((qa, idx) =>
        `Q${idx}: ${qa.question}\nA${idx}: ${qa.answer}\n---`
      ).join('\n');

      const prompt = `Check if this new question was already answered before. Reply with:
FOUND: YES or NO
MATCH_ID: Q<number> (if YES)
SIMILARITY: 0-100 (how similar)
SUGGESTED_ANSWER: <the previous answer if FOUND=YES, otherwise "none">

New Question: "${question}"

Past Q&A:
${qaText}`;

      const result = await this.provider.chat(prompt, { maxTokens: 300 });
      const found = result.match(/FOUND: (YES|NO)/)?.[1] === 'YES';
      const matchId = result.match(/MATCH_ID: Q(\d+)/)?.[1];
      const similarity = parseInt(result.match(/SIMILARITY: (\d+)/)?.[1] || '0');
      const suggestedAnswer = result.match(/SUGGESTED_ANSWER: (.*)/s)?.[1]?.trim();

      if (found && matchId && suggestedAnswer && suggestedAnswer !== 'none') {
        const originalAnswer = pastAnswers[parseInt(matchId)];
        return {
          foundAnswer: true,
          answer: suggestedAnswer,
          similarity,
          original: originalAnswer
        };
      }

      return { foundAnswer: false, answer: null, similarity };
    } catch (error) {
      console.error('Answer bot memory failed:', error);
      return { foundAnswer: false, answer: null, similarity: 0 };
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
