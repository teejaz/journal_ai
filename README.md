# 📖 Journal AI

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.6_Flash-8E75B2?style=flat-square&logo=google&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Local_AI-white?style=flat-square&logo=ollama&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

**Journal AI** is a distraction-free, privacy-first markdown journaling app designed for mindful daily writing and reflection. It features real-time metrics, an interactive calendar with mood tracking, typography switching, dynamic 3-tier word count milestones (750w ➔ 1,400w ➔ 2,100w celebration), and instant `.md` file export with structured YAML frontmatter.

The app supports multi-provider AI topic and emotion intelligence (Google Gemini, OpenAI, or local Ollama) to automatically discover compound themes (e.g., `career · excited`) and granular subtopic tags (e.g., `#building-ai-app`). All entries and API keys stay 100% client-side in browser local storage—requiring zero build tools or backend servers.

---

## 🚀 Quick Start

Simply clone and open `index.html` in any browser:

```bash
git clone https://github.com/teejaz/journal_ai.git
cd journal_ai
open index.html
```

---

## ⚙️ AI Setup

Click the **⚙ (AI Settings)** icon in the top navigation bar:

- **Google Gemini**: Enter your free [Google AI Studio](https://aistudio.google.com) key (default: `gemini-3.6-flash`).
- **OpenAI**: Enter your [OpenAI API Key](https://platform.openai.com/api-keys) (`gpt-4o-mini`).
- **Local Ollama**: Start Ollama with CORS allowed (`OLLAMA_ORIGINS="*" ollama serve`) and click **⚡ Auto-detect local models**.
- **Offline / Built-in**: Switch to **Off** for zero-dependency local keyword extraction.

---

## ⌨️ Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl / Cmd + N` | New Entry |
| `Ctrl / Cmd + B` / `I` | Bold / Italic |
| `Ctrl / Cmd + P` | Toggle Markdown Preview |
| `Ctrl / Cmd + E` | Export to `.md` |
| `Ctrl / Cmd + Shift + A` | Run AI Topic Analysis |

---

## 📄 License

MIT License © 2026.
