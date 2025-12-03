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
   * Smart Catch-Up: Analyze messages and extract key topics/discussions
   * Perfect for AI devs who context-switch constantly
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
      // Format messages for Claude
      const messageText = messages.map(m =>
        `[${m.time.toLocaleTimeString()}] <${m.from}> ${m.message}`
      ).join('\n');

      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Analyze this IRC conversation for an AI developer who was away. Extract:
1. Main topics discussed (max 3)
2. Key decisions or conclusions (max 3)
3. Number of code snippets shared

Format your response as:
TOPICS: topic1 | topic2 | topic3
DECISIONS: decision1 | decision2 | decision3
CODE_SNIPPETS: <number>
SUMMARY: <2 sentence overview>

${messageText}`
        }]
      });

      const result = response.content[0].text.trim();
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
   * Detects code blocks, identifies language, and extracts context
   * @param {Array} messages - Array of message objects
   * @returns {Promise<Array>} Array of { code, language, author, context, timestamp }
   */
  async extractCodeSnippets(messages) {
    if (!this.enabled) {
      return [];
    }

    const snippets = [];

    // Simple code detection (lines starting with spaces/tabs or containing common code patterns)
    const codePatterns = [
      /```(\w+)?\n([\s\S]+?)```/g,  // Markdown code blocks
      /`([^`]+)`/g,                  // Inline code
      /^[\s]{2,}[^\s]/m              // Indented code
    ];

    for (const msg of messages) {
      // Check for code blocks
      const codeBlockMatches = [...msg.message.matchAll(/```(\w+)?\n([\s\S]+?)```/g)];

      for (const match of codeBlockMatches) {
        const language = match[1] || 'unknown';
        const code = match[2].trim();

        try {
          // Ask Claude to analyze the code snippet
          const response = await this.client.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 150,
            messages: [{
              role: 'user',
              content: `Analyze this code snippet. Reply with ONLY:
LANGUAGE: <language>
PURPOSE: <one sentence what it does>
CATEGORY: <type like "bug-fix", "example", "utility", "config">

Code:
${code}`
            }]
          });

          const analysis = response.content[0].text.trim();
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
          // Add without analysis
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
   * Helps AI devs avoid repeating themselves
   * @param {string} question - The question being asked
   * @param {Array} pastAnswers - Array of { question, answer, author, timestamp }
   * @returns {Promise<Object>} { foundAnswer: boolean, answer: string, similarity: number }
   */
  async findPastAnswer(question, pastAnswers) {
    if (!this.enabled || !pastAnswers || pastAnswers.length === 0) {
      return { foundAnswer: false, answer: null, similarity: 0 };
    }

    try {
      // Format past Q&A pairs
      const qaText = pastAnswers.slice(-20).map((qa, idx) =>
        `Q${idx}: ${qa.question}\nA${idx}: ${qa.answer}\n---`
      ).join('\n');

      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Check if this new question was already answered before. Reply with:
FOUND: YES or NO
MATCH_ID: Q<number> (if YES)
SIMILARITY: 0-100 (how similar)
SUGGESTED_ANSWER: <the previous answer if FOUND=YES, otherwise "none">

New Question: "${question}"

Past Q&A:
${qaText}`
        }]
      });

      const result = response.content[0].text.trim();
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
