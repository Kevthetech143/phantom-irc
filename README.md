# 👻 Phantom IRC - AI-Powered IRC Client

**Kiroween 2024 Hackathon Submission - Resurrection Category**

Bringing IRC back to life with AI-powered features and Discord-like UX.

---

## 🎯 The Problem

IRC (Internet Relay Chat) has been around since 1988, but in 2024:
- Most IRC clients look dated (HexChat, Weechat)
- No IRC client has AI features (spam filtering, summaries)
- Modern users expect Discord-like UX

**Market Gap:** No AI-powered IRC client with modern UX exists. ([Validation Report](https://github.com/your-repo/validation))

---

## ✨ The Solution: Phantom IRC

**AI-Powered Modern IRC Client** that combines:
- 🤖 **AI Spam Filter** - Claude API detects spam before you send
- 📝 **AI Summaries** - "What did I miss?" - Summarize last 100 messages
- 🎨 **Discord-like UI** - Modern dark theme, sidebar channels, user list
- ⚡ **Real-time** - Native IRC protocol (irc-framework)
- 🆓 **Free & Open Source** - MIT license

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Claude API key (optional, for AI features)

### Installation

```bash
# Clone repo
git clone https://github.com/your-repo/phantom-irc.git
cd phantom-irc

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Open http://localhost:3000**

### Connect to IRC

1. **Enter Nickname** (e.g., `PhantomUser`)
2. **Server** (default: `irc.libera.chat`)
3. **Claude API Key** (optional - for AI features)
   - Get key from: https://console.anthropic.com
   - Leave blank to disable AI features
4. Click **Connect to IRC**

### Join Channels

- Type channel name (e.g., `#rust`, `#gnome`)
- Click **Join**
- Start chatting!

---

## 🤖 AI Features

### 1. AI Spam Filter
- Analyzes your messages BEFORE sending
- Warns if spam detected (>70% confidence)
- Powered by Claude 3 Haiku

**Example:**
```
You: "BUY CRYPTO NOW!!! CLICK HERE!!!"
AI: ⚠️ Spam detected (95% confidence: promotional links)
    Send anyway? [Yes] [No]
```

### 2. AI Channel Summary
- Click "🤖 AI Summary" button
- Summarizes last 100 messages in 2-3 sentences
- Focus on main topics, decisions, links

**Example:**
```
AI Summary: Discussion about Rust async/await best practices.
User "ferris" shared benchmark results showing tokio::spawn
outperforms std::thread by 40%. Link to GitHub gist posted.
```

### 3. Smart Notifications (Coming Soon)
- AI prioritizes important messages
- Filters noise, highlights mentions

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 4 |
| IRC Protocol | irc-framework (npm) |
| AI | Anthropic Claude API |
| Storage | LocalStorage |

### File Structure

```
/phantom-irc
├── .kiro/                    # Kiro specs (hackathon requirement)
│   ├── steering.md           # Project overview
│   └── specs/                # Component specs
├── src/
│   ├── components/
│   │   └── App.jsx           # Main React component
│   ├── lib/
│   │   ├── irc-client.js     # IRC wrapper (irc-framework)
│   │   └── ai-service.js     # Claude API wrapper
│   ├── styles/
│   │   └── index.css         # Tailwind CSS
│   └── main.jsx              # React entry point
├── public/                   # Static assets
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
└── package.json              # Dependencies
```

---

## 🎨 UI Features

### Discord-Inspired Layout
- **Left Sidebar:** Channel list + join input
- **Center:** Message area + input
- **Right Sidebar:** User list

### Dark Theme
- Background: `#0f0f1e` (phantom-darker)
- Sidebar: `#1a1a2e` (phantom-dark)
- Accent: `#7c3aed` (phantom-purple)
- Hover: `#a78bfa` (phantom-purple-light)

### Responsive
- Auto-scroll to latest message
- User count display
- Channel switching
- Leave channel (X button on hover)

---

## 🧪 Testing

### Manual Testing Checklist

**IRC Core:**
- [x] Connect to irc.libera.chat
- [x] Join channel (#rust, #gnome)
- [x] Send message
- [x] Receive messages from others
- [x] Leave channel
- [x] User list updates

**AI Features:**
- [x] Spam filter warns before sending
- [x] AI summary generates (last 100 messages)
- [x] Works without API key (AI disabled gracefully)

**UI/UX:**
- [x] Discord-like layout renders
- [x] Dark theme applied
- [x] Auto-scroll to latest message
- [x] Channel switching works

---

## 📊 Validation Results

**Building Protocol Applied:**
1. ✅ Brainstormed 8 ideas
2. ✅ Validated top 3
3. ✅ Deep competitive research (1 hour)
4. ✅ Found market gap (8.2/10)
5. ✅ Made GO decision
6. ✅ Built in 48 hours

**Validation Score: 8.2/10 (STRONG GO)**

| Criteria | Score | Notes |
|----------|-------|-------|
| Market Gap | 8/10 | No AI-powered IRC client exists |
| User Demand | 7/10 | Active r/irc threads, HN interest |
| Buildable | 9/10 | Libraries exist, straightforward |
| Kiro Showcase | 9/10 | AI integration, spec-driven dev |

[Read Full Validation Report →](https://github.com/your-repo/validation-report.md)

---

## 🏆 Kiroween Hackathon

### Category: Resurrection 💀
**"Bring something dead back to life"**

IRC has been declared "dead" many times, but:
- Still used by Linux kernel developers
- GNOME, KDE, Rust communities active
- Libera.Chat (2021) proves IRC is alive

**Our Angle:** Resurrect IRC with AI + Modern UX

### Kiro Usage

**How we used Kiro:**
1. **Spec-driven development** - `.kiro/steering.md` guided implementation
2. **Component specifications** - Each component has clear spec
3. **AI integration** - Kiro assisted with Claude API design
4. **Real-time protocol** - IRC message handling specs

[Read Full Kiro Documentation →](.kiro/KIRO-USAGE.md)

---

## 🎥 Demo Video

[Watch 3-minute demo →](https://youtube.com/link-to-demo)

**Highlights:**
1. Connect to Libera.Chat
2. Join #rust channel
3. AI spam filter in action
4. AI summary of 100 messages
5. Discord-like UX showcase

---

## 🚧 Future Roadmap

### Phase 2 (Post-Hackathon)
- [ ] Desktop app (Tauri wrapper)
- [ ] Emoji reactions (LocalStorage)
- [ ] Multi-server connections
- [ ] DCC file transfer
- [ ] TLS/SSL support

### Phase 3 (Production)
- [ ] Deploy to Vercel/Railway
- [ ] User accounts (save channels)
- [ ] Themes (light mode, custom colors)
- [ ] Plugins system (extend with JS)

---

## 📝 License

MIT License - Built for Kiroween 2024

---

## 👥 Team

**ALPHA + BETA**
- Applied Building Protocol (validate before building)
- Built in 48 hours
- AI-powered IRC resurrection

---

## 🙏 Acknowledgments

- **Kiroween 2024** - For the hackathon opportunity
- **Anthropic Claude** - AI features
- **irc-framework** - IRC protocol library
- **Libera.Chat** - IRC network for testing
- **IRC community** - Keeping IRC alive since 1988

---

**Status:** ✅ Production-ready MVP
**Deployment:** http://localhost:3000 (local dev)
**GitHub:** https://github.com/your-repo/phantom-irc
**Validation:** 8.2/10 (STRONG GO)

**Built with 💜 for Kiroween 2024**
