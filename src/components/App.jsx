import { useState, useEffect, useRef } from 'react';
import MockIRCClient from '../lib/mock-irc';
import PhantomAI from '../lib/ai-service';

function App() {
  // IRC state
  const [connected, setConnected] = useState(false);
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [messages, setMessages] = useState({});
  const [users, setUsers] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [joinChannelInput, setJoinChannelInput] = useState('');

  // Connection state
  const [nick, setNick] = useState('');
  const [server, setServer] = useState('irc.libera.chat');
  const [showConnectForm, setShowConnectForm] = useState(true);

  // AI state
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiKey, setAiKey] = useState('');
  const [aiProviderInfo, setAiProviderInfo] = useState(null);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [catchUp, setCatchUp] = useState(null);
  const [loadingCatchUp, setLoadingCatchUp] = useState(false);
  const [codeSnippets, setCodeSnippets] = useState([]);
  const [loadingSnippets, setLoadingSnippets] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);

  // Refs
  const ircClient = useRef(null);
  const aiService = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentChannel]);

  // Connect to IRC
  const handleConnect = () => {
    if (!nick.trim()) {
      alert('Please enter a nickname');
      return;
    }

    // Initialize IRC client (using mock for demo)
    ircClient.current = new MockIRCClient();

    // Initialize AI service if key provided
    if (aiKey.trim()) {
      aiService.current = new PhantomAI(aiKey.trim());
      const providerInfo = aiService.current.getProviderInfo();
      setAiProviderInfo(providerInfo);
      setAiEnabled(providerInfo.enabled);
    }

    // Setup event handlers
    ircClient.current.on('onConnect', () => {
      setConnected(true);
      setShowConnectForm(false);
      console.log('Connected to IRC!');
    });

    ircClient.current.on('onMessage', (message) => {
      setMessages(prev => ({
        ...prev,
        [message.to]: [...(prev[message.to] || []), message]
      }));
    });

    ircClient.current.on('onJoin', ({ channel, nick: joinedNick }) => {
      if (joinedNick === nick) {
        setChannels(prev => [...new Set([...prev, channel])]);
        setCurrentChannel(channel);

        // Load message history for this channel
        const history = ircClient.current.getMessages(channel);
        if (history && history.length > 0) {
          setMessages(prev => ({
            ...prev,
            [channel]: history.map(msg => ({
              from: msg.user,
              to: channel,
              message: msg.text,
              time: new Date(msg.timestamp)
            }))
          }));
        }
      }
    });

    ircClient.current.on('onPart', ({ channel, nick: partedNick }) => {
      if (partedNick === nick) {
        setChannels(prev => prev.filter(ch => ch !== channel));
        if (currentChannel === channel) {
          setCurrentChannel(channels[0] || null);
        }
      }
    });

    ircClient.current.on('onUserList', ({ channel, users: userList }) => {
      setUsers(prev => ({
        ...prev,
        [channel]: userList
      }));
    });

    ircClient.current.on('onError', (error) => {
      console.error('IRC Error:', error);
      alert(`IRC Error: ${error.message || error}`);
    });

    // Connect
    ircClient.current.connect({
      host: server,
      nick: nick.trim(),
      username: nick.trim().toLowerCase(),
      realname: 'Phantom IRC User'
    });
  };

  // Join channel
  const handleJoinChannel = () => {
    if (!connected || !joinChannelInput.trim()) return;

    let channelName = joinChannelInput.trim();
    if (!channelName.startsWith('#')) {
      channelName = '#' + channelName;
    }

    ircClient.current.joinChannel(channelName);
    setJoinChannelInput('');
  };

  // Leave channel
  const handlePartChannel = (channel) => {
    if (!connected) return;
    ircClient.current.partChannel(channel);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!connected || !currentChannel || !inputMessage.trim()) return;

    // Check for spam if AI enabled
    if (aiEnabled && aiService.current) {
      const spamCheck = await aiService.current.checkSpam(inputMessage, currentChannel);
      if (spamCheck.isSpam && spamCheck.confidence > 70) {
        if (!window.confirm(`AI detected potential spam (${spamCheck.confidence}% confidence: ${spamCheck.reason}). Send anyway?`)) {
          return;
        }
      }
    }

    ircClient.current.sendMessage(currentChannel, inputMessage);
    setInputMessage('');
  };

  // Get AI summary
  const handleGetSummary = async () => {
    if (!aiEnabled || !aiService.current || !currentChannel) {
      alert('AI features require an API key. Reconnect with a Claude API key.');
      return;
    }

    setLoadingSummary(true);
    const channelMessages = messages[currentChannel] || [];
    const lastMessages = channelMessages.slice(-100);

    const summaryText = await aiService.current.summarizeMessages(lastMessages, currentChannel);
    setSummary(summaryText);
    setLoadingSummary(false);
  };

  // Get Smart Catch-Up (AI developer feature)
  const handleSmartCatchUp = async () => {
    if (!aiEnabled || !aiService.current || !currentChannel) {
      alert('AI features require an API key. Reconnect with a Claude API key.');
      return;
    }

    setLoadingCatchUp(true);
    const channelMessages = messages[currentChannel] || [];
    const lastMessages = channelMessages.slice(-100);

    const catchUpData = await aiService.current.smartCatchUp(lastMessages, currentChannel);
    setCatchUp(catchUpData);
    setLoadingCatchUp(false);
  };

  // Extract Code Snippets (AI developer feature)
  const handleExtractCode = async () => {
    if (!aiEnabled || !aiService.current || !currentChannel) {
      alert('AI features require an API key. Reconnect with a Claude API key.');
      return;
    }

    setLoadingSnippets(true);
    const channelMessages = messages[currentChannel] || [];

    const snippets = await aiService.current.extractCodeSnippets(channelMessages);
    setCodeSnippets(snippets);
    setShowSnippets(true);
    setLoadingSnippets(false);
  };

  // Connection form
  if (showConnectForm) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-phantom-darker">
        <div className="bg-phantom-dark p-8 rounded-lg shadow-2xl w-96 border border-phantom-purple">
          <h1 className="text-3xl font-bold text-phantom-purple mb-6 text-center">
            👻 Phantom IRC
          </h1>
          <p className="text-gray-400 text-sm mb-6 text-center">
            AI-Powered IRC Client
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nickname
              </label>
              <input
                type="text"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                className="w-full px-4 py-2 bg-phantom-gray text-white rounded border border-gray-600 focus:border-phantom-purple focus:outline-none"
                placeholder="PhantomUser"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Server
              </label>
              <input
                type="text"
                value={server}
                onChange={(e) => setServer(e.target.value)}
                className="w-full px-4 py-2 bg-phantom-gray text-white rounded border border-gray-600 focus:border-phantom-purple focus:outline-none"
                placeholder="irc.libera.chat"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI API Key (Optional - for AI features)
              </label>
              <input
                type="password"
                value={aiKey}
                onChange={(e) => setAiKey(e.target.value)}
                className="w-full px-4 py-2 bg-phantom-gray text-white rounded border border-gray-600 focus:border-phantom-purple focus:outline-none"
                placeholder="sk-ant-... or sk-proj-..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports <span className="text-orange-400">Anthropic (Claude)</span> and <span className="text-green-400">OpenAI (GPT)</span> keys
              </p>
            </div>

            <button
              onClick={handleConnect}
              className="w-full bg-phantom-purple hover:bg-phantom-purple-light text-white font-bold py-3 px-4 rounded transition-colors"
            >
              Connect to IRC
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Kiroween 2024 - Resurrection Category</p>
            <p className="mt-1">Built with 💜 by ALPHA + BETA</p>
          </div>
        </div>
      </div>
    );
  }

  // Main IRC interface
  return (
    <div className="w-full h-full flex bg-phantom-darker">
      {/* Sidebar - Channels */}
      <div className="w-64 bg-phantom-dark border-r border-phantom-gray flex flex-col">
        <div className="p-4 border-b border-phantom-gray">
          <h2 className="text-xl font-bold text-phantom-purple">👻 Phantom IRC</h2>
          <p className="text-xs text-gray-400 mt-1">Connected as {nick}</p>
          {aiProviderInfo && aiProviderInfo.enabled && (
            <p className="text-xs mt-1" style={{ color: aiProviderInfo.color }}>
              {aiProviderInfo.icon} {aiProviderInfo.name}
            </p>
          )}
          {!aiEnabled && (
            <p className="text-xs text-gray-500 mt-1">AI features disabled</p>
          )}
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs text-gray-500 uppercase font-semibold px-2 mb-2">Channels</p>
            {channels.map(channel => (
              <div
                key={channel}
                className={`px-3 py-2 rounded cursor-pointer mb-1 flex items-center justify-between group ${
                  currentChannel === channel
                    ? 'bg-phantom-purple text-white'
                    : 'text-gray-300 hover:bg-phantom-gray'
                }`}
                onClick={() => setCurrentChannel(channel)}
              >
                <span className="font-medium">{channel}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePartChannel(channel);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Join channel input */}
        <div className="p-4 border-t border-phantom-gray">
          <div className="flex gap-2">
            <input
              type="text"
              value={joinChannelInput}
              onChange={(e) => setJoinChannelInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinChannel()}
              className="flex-1 px-3 py-2 bg-phantom-gray text-white rounded text-sm border border-gray-600 focus:border-phantom-purple focus:outline-none"
              placeholder="#rust"
            />
            <button
              onClick={handleJoinChannel}
              className="bg-phantom-purple hover:bg-phantom-purple-light text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {currentChannel ? (
          <>
            {/* Channel header */}
            <div className="h-16 bg-phantom-dark border-b border-phantom-gray px-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{currentChannel}</h3>
                <p className="text-xs text-gray-400">
                  {users[currentChannel]?.length || 0} users
                </p>
              </div>

              {/* AI Feature buttons */}
              {aiEnabled && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSmartCatchUp}
                    disabled={loadingCatchUp}
                    className="bg-phantom-purple hover:bg-phantom-purple-light text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loadingCatchUp ? '⚡ Analyzing...' : '⚡ Catch-Up'}
                  </button>
                  <button
                    onClick={handleExtractCode}
                    disabled={loadingSnippets}
                    className="bg-phantom-purple hover:bg-phantom-purple-light text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loadingSnippets ? '💻 Extracting...' : '💻 Code'}
                  </button>
                  <button
                    onClick={handleGetSummary}
                    disabled={loadingSummary}
                    className="bg-phantom-purple hover:bg-phantom-purple-light text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loadingSummary ? '📝 Summarizing...' : '📝 Summary'}
                  </button>
                </div>
              )}
            </div>

            {/* AI Summary display */}
            {summary && (
              <div className="bg-phantom-purple bg-opacity-20 border-b border-phantom-purple px-6 py-3">
                <p className="text-sm text-gray-300">
                  <span className="font-bold text-phantom-purple">AI Summary:</span> {summary}
                </p>
                <button
                  onClick={() => setSummary('')}
                  className="text-xs text-gray-400 hover:text-white mt-1"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Smart Catch-Up display */}
            {catchUp && (
              <div className="bg-purple-900 bg-opacity-30 border-b border-purple-600 px-6 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-purple-300">⚡ Smart Catch-Up</span>
                  <button
                    onClick={() => setCatchUp(null)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
                <p className="text-sm text-gray-300 mb-2">{catchUp.summary}</p>
                {catchUp.topics && catchUp.topics.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-purple-400">Topics: </span>
                    <span className="text-xs text-gray-300">{catchUp.topics.join(' • ')}</span>
                  </div>
                )}
                {catchUp.keyDecisions && catchUp.keyDecisions.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-purple-400">Decisions: </span>
                    <span className="text-xs text-gray-300">{catchUp.keyDecisions.join(' • ')}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs font-semibold text-purple-400">Code shared: </span>
                  <span className="text-xs text-gray-300">{catchUp.codeShared} snippet{catchUp.codeShared !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {/* Code Snippets display */}
            {showSnippets && codeSnippets.length > 0 && (
              <div className="bg-gray-900 border-b border-gray-700 px-6 py-3 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-300">💻 Code Snippets ({codeSnippets.length})</span>
                  <button
                    onClick={() => setShowSnippets(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
                <div className="space-y-3">
                  {codeSnippets.map((snippet, idx) => (
                    <div key={idx} className="bg-black bg-opacity-40 p-3 rounded border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-blue-400">{snippet.language}</span>
                          <span className="text-xs text-gray-500">by {snippet.author}</span>
                        </div>
                        <span className="text-xs text-gray-500">{snippet.category}</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-2">{snippet.context}</p>
                      <pre className="text-xs text-gray-400 bg-black bg-opacity-50 p-2 rounded overflow-x-auto">
                        {snippet.code.substring(0, 200)}{snippet.code.length > 200 ? '...' : ''}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showSnippets && codeSnippets.length === 0 && (
              <div className="bg-gray-900 border-b border-gray-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">💻 No code snippets found in this channel</span>
                  <button
                    onClick={() => setShowSnippets(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {(messages[currentChannel] || []).map((msg, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-bold text-phantom-purple">
                      {msg.from}
                    </span>
                    <span className="text-xs text-gray-500">
                      {msg.time.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-200 mt-1">{msg.message}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="h-20 bg-phantom-dark border-t border-phantom-gray px-6 flex items-center gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-3 bg-phantom-gray text-white rounded border border-gray-600 focus:border-phantom-purple focus:outline-none"
                placeholder={`Message ${currentChannel}...`}
              />
              <button
                onClick={handleSendMessage}
                className="bg-phantom-purple hover:bg-phantom-purple-light text-white px-6 py-3 rounded font-medium transition-colors"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-2xl mb-2">👻</p>
              <p>Join a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar - Users */}
      {currentChannel && (
        <div className="w-64 bg-phantom-dark border-l border-phantom-gray">
          <div className="p-4 border-b border-phantom-gray">
            <p className="text-sm text-gray-400 uppercase font-semibold">
              Users — {users[currentChannel]?.length || 0}
            </p>
          </div>
          <div className="overflow-y-auto p-2">
            {(users[currentChannel] || []).map((user, idx) => (
              <div
                key={idx}
                className="px-3 py-2 text-gray-300 hover:bg-phantom-gray rounded cursor-pointer"
              >
                {user}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
