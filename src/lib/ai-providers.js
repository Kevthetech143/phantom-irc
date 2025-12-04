/**
 * Multi-Provider AI Abstraction Layer
 * Supports: Anthropic (Claude), OpenAI (GPT), and more
 *
 * Build: v5-multi-provider
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

/**
 * Detect AI provider from API key format
 * @param {string} apiKey - The API key to analyze
 * @returns {string|null} Provider name or null if unknown
 */
export function detectProvider(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return null;

  // Anthropic keys start with sk-ant-
  if (apiKey.startsWith('sk-ant-')) return 'anthropic';

  // OpenAI keys start with sk-proj- (project) or sk- (legacy)
  if (apiKey.startsWith('sk-proj-') ||
      (apiKey.startsWith('sk-') && !apiKey.startsWith('sk-ant-'))) {
    return 'openai';
  }

  return null;
}

/**
 * Get provider display info
 * @param {string} provider - Provider name
 * @returns {Object} Display info { name, icon, color }
 */
export function getProviderInfo(provider) {
  const providers = {
    anthropic: {
      name: 'Claude (Anthropic)',
      icon: '🧠',
      color: '#D97706',
      models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229']
    },
    openai: {
      name: 'GPT (OpenAI)',
      icon: '🤖',
      color: '#10B981',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
    }
  };
  return providers[provider] || { name: 'Unknown', icon: '❓', color: '#6B7280', models: [] };
}

/**
 * Base Provider Interface
 * All providers must implement these methods
 */
class BaseProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Send a chat message and get a response
   * @param {string} prompt - The prompt to send
   * @param {Object} options - { maxTokens, temperature }
   * @returns {Promise<string>} The response text
   */
  async chat(prompt, options = {}) {
    throw new Error('chat() must be implemented by provider');
  }

  /**
   * Get the provider name
   * @returns {string}
   */
  getName() {
    throw new Error('getName() must be implemented by provider');
  }
}

/**
 * Anthropic (Claude) Provider
 */
class AnthropicProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    this.defaultModel = 'claude-3-haiku-20240307';
  }

  async chat(prompt, options = {}) {
    const { maxTokens = 300, model } = options;

    const response = await this.client.messages.create({
      model: model || this.defaultModel,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].text.trim();
  }

  getName() {
    return 'anthropic';
  }
}

/**
 * OpenAI (GPT) Provider
 */
class OpenAIProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    this.defaultModel = 'gpt-3.5-turbo';
  }

  async chat(prompt, options = {}) {
    const { maxTokens = 300, model } = options;

    const response = await this.client.chat.completions.create({
      model: model || this.defaultModel,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.choices[0].message.content.trim();
  }

  getName() {
    return 'openai';
  }
}

/**
 * Factory function to create the appropriate provider
 * @param {string} apiKey - The API key
 * @returns {BaseProvider|null} Provider instance or null
 */
export function createProvider(apiKey) {
  const providerType = detectProvider(apiKey);

  switch (providerType) {
    case 'anthropic':
      return new AnthropicProvider(apiKey);
    case 'openai':
      return new OpenAIProvider(apiKey);
    default:
      return null;
  }
}

export { BaseProvider, AnthropicProvider, OpenAIProvider };
