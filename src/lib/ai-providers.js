/**
 * Multi-Provider AI Abstraction Layer
 * Supports: Anthropic, OpenAI, Google Gemini, Groq (Llama), Mistral
 *
 * Build: v6-all-providers
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import Mistral from '@mistralai/mistralai';

/**
 * Detect AI provider from API key format
 * @param {string} apiKey - The API key to analyze
 * @returns {string|null} Provider name or null if unknown
 */
export function detectProvider(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return null;

  // Anthropic keys start with sk-ant-
  if (apiKey.startsWith('sk-ant-')) return 'anthropic';

  // Groq keys start with gsk_
  if (apiKey.startsWith('gsk_')) return 'groq';

  // Google Gemini keys start with AIza
  if (apiKey.startsWith('AIza')) return 'gemini';

  // Mistral keys are typically 32 char hex or specific format
  // They don't have a standard prefix, so we check length and pattern
  if (/^[a-zA-Z0-9]{32}$/.test(apiKey)) return 'mistral';

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
      models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229']
    },
    openai: {
      name: 'GPT (OpenAI)',
      icon: '🤖',
      color: '#10B981',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
    },
    gemini: {
      name: 'Gemini (Google)',
      icon: '✨',
      color: '#4285F4',
      models: ['gemini-1.5-flash', 'gemini-1.5-pro']
    },
    groq: {
      name: 'Llama (Groq)',
      icon: '🦙',
      color: '#F97316',
      models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768']
    },
    mistral: {
      name: 'Mistral AI',
      icon: '🌀',
      color: '#FF7000',
      models: ['mistral-small-latest', 'mistral-medium-latest', 'mistral-large-latest']
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

  async chat(prompt, options = {}) {
    throw new Error('chat() must be implemented by provider');
  }

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
 * Google Gemini Provider
 */
class GeminiProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.client = new GoogleGenerativeAI(apiKey);
    this.defaultModel = 'gemini-1.5-flash';
  }

  async chat(prompt, options = {}) {
    const { model } = options;

    const genModel = this.client.getGenerativeModel({
      model: model || this.defaultModel
    });

    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  }

  getName() {
    return 'gemini';
  }
}

/**
 * Groq (Llama) Provider - Super fast inference
 */
class GroqProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.client = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    this.defaultModel = 'llama-3.1-8b-instant';
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
    return 'groq';
  }
}

/**
 * Mistral AI Provider
 */
class MistralProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.client = new Mistral({ apiKey });
    this.defaultModel = 'mistral-small-latest';
  }

  async chat(prompt, options = {}) {
    const { maxTokens = 300, model } = options;

    const response = await this.client.chat.complete({
      model: model || this.defaultModel,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.choices[0].message.content.trim();
  }

  getName() {
    return 'mistral';
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
    case 'gemini':
      return new GeminiProvider(apiKey);
    case 'groq':
      return new GroqProvider(apiKey);
    case 'mistral':
      return new MistralProvider(apiKey);
    default:
      return null;
  }
}

export {
  BaseProvider,
  AnthropicProvider,
  OpenAIProvider,
  GeminiProvider,
  GroqProvider,
  MistralProvider
};
