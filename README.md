# 📖 Folio — The Mindful Markdown & AI Journaling App

> A beautifully designed, distraction-free journaling app with real-time writing metrics, dynamic word count milestones, interactive mood tracking, and multi-provider AI topic analysis.

![Folio Journal Preview](https://img.shields.io/badge/Folio-v1.0.0-f5b645?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.6_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Local_AI-white?style=for-the-badge&logo=ollama&logoColor=black)

---

## ✨ Key Features

### ✍️ Distraction-Free Writing & Markdown Support
- **Full Markdown Toolbar**: Headings (`#`, `##`, `###`), bold, italics, blockquotes, horizontal dividers, bullet lists, and code blocks.
- **Split Preview / Edit Mode**: Toggle instantly between raw markdown writing and a typography-optimized live preview.
- **Typography Switching**: Seamlessly toggle between **Lora (Serif)**, **Inter (Sans)**, and **JetBrains Mono (Monospace)**.
- **Auto-Save**: Live persistence to `localStorage` with non-intrusive save indicators.

### 🎯 3-Tier Word Goal Milestones
- **Tier 1 (0 – 750 words)**: Morning Pages baseline goal.
- **Tier 2 (750 – 1,400 words)**: Deep Flow target dynamically expands as you reach 750 words.
- **Tier 3 (1,400 – 2,100 words)**: Deep Mastery target expands as you reach 1,400 words.
- **Celebratory Milestone (2,100+ words)**: Unlocks animated gold ambient glow and congratulations banner.
- Real-time progress bar embedded directly below the editor and in the right statistics panel.

### 🧠 Two-Tier AI Topic & Sentiment Intelligence
- **Broad Topics + Tones**: Classifies entries into high-level domains paired with emotional tone (e.g., `career · excited`, `health · hopeful`, `relationships · anxious`).
- **Specific Subtopic Tags**: Discovers granular, hyphenated tags (e.g., `#building-ai-app`, `#home-automation`, `#salary-negotiation`).
- **Click-to-Filter**: Click any `#subtopic` tag or topic badge to instantly filter your journal history.

### ⚡ Multi-Provider AI Support
- **Google Gemini**: Native integration with `gemini-3.6-flash`, `gemini-3.7-flash`, and `gemini-3.6-pro` using JSON structured outputs. Includes **⚡ Auto-detect models** support.
- **OpenAI**: Support for `gpt-4o-mini`, `gpt-4o`, and `gpt-3.5-turbo`.
- **Local Ollama**: 100% private on-device LLM analysis (`llama3`, `mistral`, `phi3`, etc.) with local model auto-detection.
- **Offline Fallback**: Built-in zero-dependency N-gram phrase extractor and keyword scoring engine when AI is turned off.

### 📊 Rich Analytics & Habit Tracking
- Real-time word count, character count, sentence count, and reading time estimation.
- **Unique Vocabulary Tracker**: Identifies distinct words and analyzes lexical diversity.
- **Top Words Frequency Cloud**: Visual tag cloud of recurring keywords.
- **Writing Streaks & Habit Tracker**: Daily writing streak calculation and history.
- **Interactive Calendar & Mood Timeline**: Visual calendar with entry dots and mood tracking.

### 💾 Export & Data Portability
- Export entries directly as clean `.md` Markdown files with structured **YAML frontmatter** (title, date, mood, broad topics, and specific tags).
- 100% Client-Side & Private — no account required; data stays on your device.

---

## 🚀 Getting Started

### 1. Run Locally (Zero Setup)
No build step or Node dependencies required. Simply open `index.html` in any web browser:

```bash
# Clone the repository
git clone https://github.com/<your-username>/folio-journal.git

# Navigate to the folder
cd folio-journal

# Open in default browser (macOS)
open index.html
```

Or serve with any static web server:
```bash
# Python 3
python3 -m http.server 8000

# or Node npx
npx serve .
```

---

## ⚙️ AI Configuration

Click the **⚙ (AI Settings)** button in the top navigation bar to choose your AI engine:

### 1. Google Gemini (Recommended)
1. Get a free API key at [Google AI Studio](https://aistudio.google.com).
2. Paste your key in Settings ➔ Gemini tab.
3. Select `gemini-3.6-flash` (or click **⚡ Auto-detect models**).
4. Click **Test Connection** ➔ **Save & Apply**.

### 2. OpenAI
1. Get an API key at [OpenAI Platform](https://platform.openai.com/api-keys).
2. Paste your key in Settings ➔ OpenAI tab.
3. Select `gpt-4o-mini` or `gpt-4o`.

### 3. Local Ollama (100% Private & Free)
1. Install [Ollama](https://ollama.com) and pull a model:
   ```bash
   ollama pull llama3
   ```
2. On macOS, start Ollama with CORS allowed for browser access:
   ```bash
   OLLAMA_ORIGINS="*" ollama serve
   ```
   *(Or set permanently: `launchctl setenv OLLAMA_ORIGINS "*"`)*
3. In Folio Settings ➔ Ollama tab, click **⚡ Auto-detect local models** and select your model.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl / Cmd + N` | Create New Journal Entry |
| `Ctrl / Cmd + B` | Bold Text (`**text**`) |
| `Ctrl / Cmd + I` | Italicize Text (`_text_`) |
| `Ctrl / Cmd + P` | Toggle Live Markdown Preview |
| `Ctrl / Cmd + E` | Export Entry to `.md` File |
| `Ctrl / Cmd + Shift + A` | Run AI Topic & Emotion Analysis |
| `Escape` | Close Open Modals / Pickers |

---

## 🛠 Tech Stack

- **Frontend**: Pure Semantic HTML5 & Modern Vanilla JavaScript (ES6+ Modules & Async/Await)
- **Styling**: Modern CSS3 (Custom Properties / Variables, Glassmorphism, CSS Grid, Flexbox, Responsive Design)
- **Storage**: Browser `localStorage` API
- **AI Integrations**: Gemini REST API (Structured JSON Schema), OpenAI Chat Completions API, Ollama REST API

---

## 📄 License

MIT License © 2026. Built with focus, mindfulness, and care.
