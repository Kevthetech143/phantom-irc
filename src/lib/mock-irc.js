/**
 * Mock IRC Client for Demo Mode
 *
 * Simulates IRC connections and messages for hackathon demonstration
 * when real IRC connections aren't available (browser limitation)
 *
 * Build: 2025-12-03-v3-FIXED
 */

const BUILD_ID = "v3-20251203-fixed";

class MockIRCClient {
  constructor() {
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
    this.messageInterval = null;
    this.currentUser = 'PhantomUser';
    this._buildId = BUILD_ID; // Force bundle hash change
  }

  // Simulated channel data
  getMockChannels() {
    return [
      {
        name: '#phantom-demo',
        topic: 'Welcome to Phantom IRC Demo! This is a simulated channel showcasing AI features.',
        users: ['alice', 'bob', 'charlie', 'diana', 'eve', this.currentUser]
      },
      {
        name: '#dev-chat',
        topic: 'Development discussion and technical topics',
        users: ['dev1', 'dev2', 'techie', 'coder', this.currentUser]
      },
      {
        name: '#random',
        topic: 'Random off-topic discussions',
        users: ['user1', 'user2', 'user3', this.currentUser]
      }
    ];
  }

  // Simulated message history
  getMockMessages(channel) {
    const messageDB = {
      '#phantom-demo': [
        { user: 'alice', text: 'Hey everyone! Welcome to Phantom IRC!', timestamp: Date.now() - 3600000 },
        { user: 'bob', text: 'This is pretty cool, how does the AI spam filter work?', timestamp: Date.now() - 3500000 },
        { user: 'alice', text: 'It uses Claude to analyze messages in real-time before sending', timestamp: Date.now() - 3400000 },
        { user: 'charlie', text: 'Check out this link: https://example.com/cool-project', timestamp: Date.now() - 3300000 },
        { user: 'diana', text: 'Can someone help me with IRC commands?', timestamp: Date.now() - 3200000 },
        { user: 'eve', text: 'Sure! Type /join #channel to join a channel', timestamp: Date.now() - 3100000 },
        { user: 'bob', text: 'The AI summary feature is really handy for catching up', timestamp: Date.now() - 3000000 },
        { user: 'alice', text: 'Yeah, especially for busy channels with lots of activity', timestamp: Date.now() - 2900000 },
        { user: 'charlie', text: 'Is this open source?', timestamp: Date.now() - 2800000 },
        { user: 'diana', text: 'Built for Kiroween 2024 hackathon!', timestamp: Date.now() - 2700000 }
      ],
      '#dev-chat': [
        { user: 'dev1', text: 'Working on a new React component', timestamp: Date.now() - 7200000 },
        { user: 'dev2', text: 'Nice! Are you using hooks?', timestamp: Date.now() - 7100000 },
        { user: 'techie', text: 'Hooks are the way to go these days', timestamp: Date.now() - 7000000 },
        { user: 'coder', text: 'Anyone tried the new Vite features?', timestamp: Date.now() - 6900000 },
        { user: 'dev1', text: 'Vite is blazing fast compared to webpack', timestamp: Date.now() - 6800000 },
        { user: 'dev2', text: 'The HMR is incredible', timestamp: Date.now() - 6700000 },
        { user: 'techie', text: 'What are you all building?', timestamp: Date.now() - 6600000 },
        { user: 'coder', text: 'Working on an AI-powered IRC client', timestamp: Date.now() - 6500000 }
      ],
      '#random': [
        { user: 'user1', text: 'Good morning everyone!', timestamp: Date.now() - 10800000 },
        { user: 'user2', text: 'Morning! How\'s everyone doing?', timestamp: Date.now() - 10700000 },
        { user: 'user3', text: 'Pretty good, just having coffee', timestamp: Date.now() - 10600000 },
        { user: 'user1', text: 'Coffee is life ☕', timestamp: Date.now() - 10500000 }
      ]
    };

    return messageDB[channel] || [];
  }

  // Simulated random messages that appear over time
  getRandomMessage(channel) {
    const randomMessages = {
      '#phantom-demo': [
        { user: 'alice', text: 'The UI looks really polished!' },
        { user: 'bob', text: 'How long did it take to build this?' },
        { user: 'charlie', text: 'The dark theme is nice on the eyes' },
        { user: 'diana', text: 'Can this connect to real IRC servers?' },
        { user: 'eve', text: 'The Building Protocol validation was smart' },
        { user: 'alice', text: 'Testing early saved a lot of time' },
        { user: 'bob', text: 'Anyone else excited about AI features?' },
        { user: 'charlie', text: 'The spam filter is a game changer' }
      ],
      '#dev-chat': [
        { user: 'dev1', text: 'Just pushed a new commit' },
        { user: 'dev2', text: 'Running tests now...' },
        { user: 'techie', text: 'Anyone need help debugging?' },
        { user: 'coder', text: 'This architecture is clean' }
      ],
      '#random': [
        { user: 'user1', text: 'Anyone here?' },
        { user: 'user2', text: 'Yeah, what\'s up?' },
        { user: 'user3', text: 'Just lurking...' }
      ]
    };

    const messages = randomMessages[channel] || [];
    if (messages.length === 0) return null;

    const msg = messages[Math.floor(Math.random() * messages.length)];
    return { ...msg, timestamp: Date.now() };
  }

  // Simulated spam messages (for testing AI filter)
  getSpamExamples() {
    return [
      'BUY CHEAP PRODUCTS NOW!!! CLICK HERE: http://spam.com',
      'Make $$$$ working from home! Limited time offer!!!',
      'You won a FREE iPhone! Claim now at: http://scam.com',
      'URGENT: Your account needs verification: http://phishing.com'
    ];
  }

  // API: Set event callbacks
  on(event, callback) {
    switch (event) {
      case 'registered':
      case 'onConnect':
        this.callbacks.onConnect = callback;
        break;
      case 'message':
      case 'onMessage':
        this.callbacks.onMessage = callback;
        break;
      case 'join':
      case 'onJoin':
        this.callbacks.onJoin = callback;
        break;
      case 'part':
      case 'onPart':
        this.callbacks.onPart = callback;
        break;
      case 'error':
      case 'onError':
        this.callbacks.onError = callback;
        break;
      case 'userlist':
      case 'onUserList':
        this.callbacks.onUserList = callback;
        break;
    }
  }

  // API: Connect to "IRC server"
  connect(config) {
    this.currentUser = config.nick || 'PhantomUser';

    // Simulate connection delay
    setTimeout(() => {
      this.connected = true;

      if (this.callbacks.onConnect) {
        this.callbacks.onConnect();
      }

      // Auto-join demo channel
      setTimeout(() => {
        this.joinChannel('#phantom-demo');
      }, 500);

    }, 1000);
  }

  // API: Join channel
  joinChannel(channelName) {
    if (!this.connected) {
      if (this.callbacks.onError) {
        this.callbacks.onError('Not connected to IRC server');
      }
      return;
    }

    // Add channel if not already joined
    if (!this.channels.includes(channelName)) {
      this.channels.push(channelName);
    }

    // Get mock data for this channel
    const mockChannels = this.getMockChannels();
    const channelData = mockChannels.find(c => c.name === channelName) || {
      name: channelName,
      topic: `Welcome to ${channelName}`,
      users: [this.currentUser]
    };

    // Initialize messages for this channel
    if (!this.messages[channelName]) {
      this.messages[channelName] = this.getMockMessages(channelName);
    }

    // Initialize users for this channel
    if (!this.users[channelName]) {
      this.users[channelName] = channelData.users;
    }

    // Trigger join callback
    setTimeout(() => {
      if (this.callbacks.onJoin) {
        this.callbacks.onJoin({
          channel: channelName,
          nick: this.currentUser
        });
      }

      // Trigger userlist callback
      if (this.callbacks.onUserList) {
        this.callbacks.onUserList({
          channel: channelName,
          users: this.users[channelName]
        });
      }

      // Start simulating random messages for this channel
      this.startMessageSimulation(channelName);

    }, 500);
  }

  // API: Leave channel
  partChannel(channelName) {
    const index = this.channels.indexOf(channelName);
    if (index > -1) {
      this.channels.splice(index, 1);
    }

    if (this.callbacks.onPart) {
      this.callbacks.onPart({
        channel: channelName,
        nick: this.currentUser
      });
    }
  }

  // API: Send message
  sendMessage(channel, text) {
    if (!this.connected) {
      throw new Error('Not connected to IRC server');
    }

    const message = {
      user: this.currentUser,
      text: text,
      timestamp: Date.now()
    };

    // Add to messages
    if (!this.messages[channel]) {
      this.messages[channel] = [];
    }
    this.messages[channel].push(message);

    // Trigger message callback
    if (this.callbacks.onMessage) {
      this.callbacks.onMessage({
        nick: this.currentUser,
        target: channel,
        message: text,
        time: new Date()
      });
    }

    // Simulate a reply from someone
    setTimeout(() => {
      const replies = [
        { user: 'alice', text: 'Good point!' },
        { user: 'bob', text: 'I agree' },
        { user: 'charlie', text: 'Interesting...' },
        { user: 'diana', text: 'Thanks for sharing!' },
        { user: 'eve', text: '👍' }
      ];

      const reply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg = { ...reply, timestamp: Date.now() };

      this.messages[channel].push(replyMsg);

      if (this.callbacks.onMessage) {
        this.callbacks.onMessage({
          nick: reply.user,
          target: channel,
          message: reply.text,
          time: new Date()
        });
      }
    }, 2000 + Math.random() * 3000);
  }

  // Start simulating random messages
  startMessageSimulation(channel) {
    // Every 15-30 seconds, add a random message
    const interval = setInterval(() => {
      if (!this.channels.includes(channel)) {
        clearInterval(interval);
        return;
      }

      const randomMsg = this.getRandomMessage(channel);
      if (randomMsg && this.callbacks.onMessage) {
        this.messages[channel].push(randomMsg);

        this.callbacks.onMessage({
          nick: randomMsg.user,
          target: channel,
          message: randomMsg.text,
          time: new Date(randomMsg.timestamp)
        });
      }
    }, 15000 + Math.random() * 15000);
  }

  // API: Get messages for channel
  getMessages(channel) {
    return this.messages[channel] || [];
  }

  // API: Get users in channel
  getUsers(channel) {
    return this.users[channel] || [];
  }

  // API: Get joined channels
  getChannels() {
    return this.channels;
  }

  // API: Check if connected
  isConnected() {
    return this.connected;
  }

  // API: Disconnect
  disconnect() {
    this.connected = false;
    this.channels = [];
    this.messages = {};
    this.users = {};

    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
  }
}

export default MockIRCClient;
