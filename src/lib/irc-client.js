import IRC from 'irc-framework';

/**
 * Phantom IRC Client - Wrapper around irc-framework
 * Provides connection management, channel operations, and message handling
 */
class PhantomIRCClient {
  constructor() {
    this.client = null;
    this.connected = false;
    this.channels = [];
    this.messages = {};
    this.users = {};
    this.callbacks = {
      onConnect: null,
      onMessage: null,
      onJoin: null,
      onPart: null,
      onError: null,
      onUserList: null
    };
  }

  /**
   * Connect to IRC network
   * @param {Object} config - Connection configuration
   * @param {string} config.host - IRC server (e.g., 'irc.libera.chat')
   * @param {number} config.port - Port (default: 6667)
   * @param {string} config.nick - Nickname
   * @param {string} config.username - Username
   * @param {string} config.realname - Real name
   */
  connect(config) {
    this.client = new IRC.Client();

    // Setup event handlers
    this.client.on('registered', () => {
      this.connected = true;
      if (this.callbacks.onConnect) {
        this.callbacks.onConnect();
      }
    });

    this.client.on('message', (event) => {
      const message = {
        from: event.nick,
        to: event.target,
        message: event.message,
        time: new Date(),
        type: event.type // 'privmsg', 'notice', 'action'
      };

      // Store message
      if (!this.messages[event.target]) {
        this.messages[event.target] = [];
      }
      this.messages[event.target].push(message);

      if (this.callbacks.onMessage) {
        this.callbacks.onMessage(message);
      }
    });

    this.client.on('join', (event) => {
      if (event.nick === this.client.user.nick) {
        // We joined a channel
        if (!this.channels.includes(event.channel)) {
          this.channels.push(event.channel);
        }
      }

      if (this.callbacks.onJoin) {
        this.callbacks.onJoin({
          channel: event.channel,
          nick: event.nick
        });
      }
    });

    this.client.on('part', (event) => {
      if (event.nick === this.client.user.nick) {
        // We left a channel
        this.channels = this.channels.filter(ch => ch !== event.channel);
      }

      if (this.callbacks.onPart) {
        this.callbacks.onPart({
          channel: event.channel,
          nick: event.nick
        });
      }
    });

    this.client.on('userlist', (event) => {
      this.users[event.channel] = event.users.map(u => u.nick);

      if (this.callbacks.onUserList) {
        this.callbacks.onUserList({
          channel: event.channel,
          users: this.users[event.channel]
        });
      }
    });

    this.client.on('error', (event) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(event.error);
      }
    });

    // Connect to server
    this.client.connect({
      host: config.host || 'irc.libera.chat',
      port: config.port || 6667,
      nick: config.nick || 'PhantomUser',
      username: config.username || 'phantom',
      gecos: config.realname || 'Phantom IRC User'
    });
  }

  /**
   * Join a channel
   * @param {string} channel - Channel name (e.g., '#rust')
   */
  joinChannel(channel) {
    if (!this.connected || !this.client) {
      throw new Error('Not connected to IRC server');
    }
    this.client.join(channel);
  }

  /**
   * Leave a channel
   * @param {string} channel - Channel name
   */
  partChannel(channel) {
    if (!this.connected || !this.client) {
      throw new Error('Not connected to IRC server');
    }
    this.client.part(channel);
  }

  /**
   * Send message to channel or user
   * @param {string} target - Channel or nick
   * @param {string} message - Message text
   */
  sendMessage(target, message) {
    if (!this.connected || !this.client) {
      throw new Error('Not connected to IRC server');
    }
    this.client.say(target, message);

    // Store our own message
    if (!this.messages[target]) {
      this.messages[target] = [];
    }
    this.messages[target].push({
      from: this.client.user.nick,
      to: target,
      message: message,
      time: new Date(),
      type: 'own'
    });
  }

  /**
   * Get messages for a channel
   * @param {string} channel - Channel name
   * @param {number} limit - Max messages to return (default: 100)
   * @returns {Array} Array of message objects
   */
  getMessages(channel, limit = 100) {
    const messages = this.messages[channel] || [];
    return messages.slice(-limit);
  }

  /**
   * Get list of joined channels
   * @returns {Array} Array of channel names
   */
  getChannels() {
    return this.channels;
  }

  /**
   * Get users in a channel
   * @param {string} channel - Channel name
   * @returns {Array} Array of user nicks
   */
  getUsers(channel) {
    return this.users[channel] || [];
  }

  /**
   * Disconnect from IRC
   */
  disconnect() {
    if (this.client) {
      this.client.quit('Phantom IRC - Leaving');
      this.connected = false;
    }
  }

  /**
   * Register event callbacks
   * @param {string} event - Event name ('onConnect', 'onMessage', etc.)
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
  }
}

export default PhantomIRCClient;
