# Phantom IRC - AI-Powered IRC Client

## Project Overview
**Category**: Resurrection (Kiroween 2024)
**Goal**: Bring IRC back to life with AI-powered features and Discord-like UX

## Market Validation
- **Score**: 8.2/10 (STRONG GO)
- **Gap**: No AI-powered IRC client exists
- **Target Users**: Open source developers (Linux kernel, GNOME, KDE, Rust community)

## Architecture

### Core Stack
- **Frontend**: React 18 + Vite 5
- **Styling**: Tailwind CSS (Discord-inspired dark theme)
- **IRC Protocol**: irc-framework (battle-tested npm library)
- **AI**: Anthropic Claude API
- **Storage**: LocalStorage (channels, settings)

### Key Features (MVP)
1. **Core IRC**: Connect, join channels, send/receive messages
2. **AI Spam Filter**: Flag suspicious messages with Claude API
3. **AI Summaries**: "What did I miss?" - summarize last 100 messages
4. **Discord-like UI**: Sidebar + main chat + right panel
5. **Dark Theme**: Purple accents (spooky Halloween theme)

## File Structure
```
/phantom-irc
├── .kiro/               # Kiroween requirement
│   ├── steering.md      # This file
│   └── specs/           # Component specifications
├── src/
│   ├── components/      # React components
│   ├── lib/            # IRC + AI logic
│   ├── styles/         # Tailwind CSS
│   └── main.jsx        # Entry point
├── public/             # Static assets
└── package.json        # Dependencies
```

## Implementation Plan

### Phase 1: Core IRC (Hours 1-6)
- IRC connection manager (irc-framework wrapper)
- Channel management (join, part, list)
- Message handling (send, receive, display)
- User list management

### Phase 2: UI Development (Hours 7-10)
- Discord-inspired layout
- Channel sidebar (left)
- Message area (center)
- User list (right)
- Dark theme with purple accents

### Phase 3: AI Integration (Hours 11-16)
- Claude API wrapper
- Spam detection (classify messages)
- Channel summarization (on-demand)
- Smart notifications

### Phase 4: Polish & Deploy (Hours 17-22)
- Emoji reactions (LocalStorage)
- Settings panel
- Deploy to Vercel
- Demo video recording
- Kiro usage documentation

## Success Criteria
- ✅ Connect to Libera.Chat
- ✅ Join/part channels
- ✅ Send/receive messages in real-time
- ✅ AI spam filter works (95%+ accuracy)
- ✅ AI summaries work ("What happened in last hour?")
- ✅ UI looks modern (Discord-inspired)
- ✅ Demo video shows all features
- ✅ Open source (MIT license)

## Kiro Integration
- This project uses Kiro for spec-driven development
- All components have specifications in `.kiro/specs/`
- Kiro assists with AI integration (Claude API)
- Real-time protocol handling (IRC messages)

## Building Protocol Applied
This idea was validated BEFORE building:
1. ✅ Brainstormed 8 ideas
2. ✅ Validated top 3
3. ✅ Deep competitive research (8 pages)
4. ✅ Found market gap (8.2/10)
5. ✅ Made GO decision
6. ✅ NOW building

**We learned from previous mistake (Team Intelligence Platform)**
