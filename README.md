# 📖 Journal AI

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.6_Flash-8E75B2?style=flat-square&logo=google&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Local_AI-white?style=flat-square&logo=ollama&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

**Journal AI** is a distraction-free, privacy-first markdown journaling app designed for mindful daily writing and deep reflection. It features real-time metrics, an interactive calendar with date navigation, mood tracking, typography switching, dynamic 3-tier word count milestones (750w ➔ 1,400w ➔ 2,100w celebration), and instant `.md` file export with structured YAML frontmatter.

The app features an interactive **AI Reflection & Analysis Hub** equipped with specialized prompt lenses:
- 📋 **To-Dos & Actions**: Extracts interactive markdown checklists from your thoughts.
- 🧭 **Core Principles**: Discovers mental models, values, and life rules you set for yourself.
- 🔥 **Motivational Coach**: Empowering encouragement and tailored daily mantras.
- 🎯 **Top Priorities (MITs)**: Identifies your 1–3 highest-leverage focus areas.
- 📑 **Section Summary**: Concise thematic breakdown with key takeaways.
- 🌡️ **Mood Deep-Dive**: Psychological analysis of emotional undertones and friction points.
- 🏷️ **Compound Topics & Tags**: Discovers compound themes (`career · excited`) and `#subtopics`.
- 💬 **Custom AI Prompts**: Ask any free-form question against your journal entry.

All entries and API keys stay 100% client-side in browser local storage—requiring zero build tools or backend servers.

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

- **Google Gemini**: Free [Google AI Studio](https://aistudio.google.com) key (`gemini-3.6-flash`, `gemini-3.7-flash` with auto-detect).
- **OpenAI**: [OpenAI API Key](https://platform.openai.com/api-keys) (`gpt-4o-mini`, `gpt-4o`, `o3-mini`, `o1`, `gpt-4.5` with auto-detect).
- **Local Ollama**: Start with CORS allowed (`OLLAMA_ORIGINS="*" ollama serve`) & auto-detect installed models.
- **llama.cpp / Local Server**: Connect to `http://localhost:8080` (or LM Studio / LocalAI) with model auto-detection.
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
