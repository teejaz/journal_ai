/* ═══════════════════════════════════════════════════════════════════
   FOLIO — Journal App Logic v3.2 (Optimized & Verified)
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

// ─── CONSTANTS & STORAGE KEYS ─────────────────────────────────────────────────
const STORAGE_KEY = 'folio_entries_v2';
const PREFS_KEY   = 'folio_prefs_v1';
const AI_KEY      = 'folio_ai_cfg_v1';

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','was','are','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'shall','must','can','i','me','my','myself','we','our','us','you',
  'your','he','she','it','its','they','them','their','this','that',
  'these','those','what','which','who','how','when','where','why',
  'if','then','so','not','no','up','out','as','into','about','also',
  'just','more','some','all','any','one','two','than','too','very',
  'get','got','go','went','said','make','know','think','see','come',
  'his','her','its','been','after','before','over','again','each'
]);

const MOOD_LABELS = {
  happy:'Happy', grateful:'Grateful', calm:'Calm', reflective:'Reflective',
  tired:'Tired', anxious:'Anxious', frustrated:'Frustrated', sad:'Sad',
  excited:'Excited', motivated:'Motivated', overwhelmed:'Overwhelmed', inspired:'Inspired'
};
const MOOD_EMOJIS = {
  happy:'😊', grateful:'🥰', calm:'😌', reflective:'🤔',
  tired:'😴', anxious:'😟', frustrated:'😤', sad:'😢',
  excited:'🤩', motivated:'💪', overwhelmed:'🤯', inspired:'✨'
};

const TOPIC_KEYWORDS = {
  career:        ['job','work','career','boss','office','promotion','salary','interview','deadline','project','colleague','meeting','fired','hired','resume','linkedin','startup','manager','employee','coworker','company','client','presentation','raise','layoff','quit'],
  health:        ['sleep','tired','sick','doctor','hospital','exercise','gym','workout','pain','mental','anxiety','medicine','medication','eat','diet','weight','body','healthy','headache','stress','therapy','therapist','breathing','symptoms','fit','wellness'],
  relationships: ['friend','friendship','relationship','partner','girlfriend','boyfriend','spouse','wife','husband','date','dating','love','miss','loneliness','lonely','trust','argue','argument','fight','jealous','communication','boundary','support','social'],
  family:        ['mom','dad','mother','father','sister','brother','parent','child','kid','family','grandma','grandpa','aunt','uncle','cousin','home','holiday','dinner','sibling','relative','baby','daughter','son'],
  romance:       ['crush','romantic','love','heart','kiss','date','valentine','attraction','flirt','feelings','breakup','ex','jealous','intimate','affection','soulmate','marriage','wedding'],
  finance:       ['money','budget','savings','debt','pay','rent','bills','expensive','cheap','invest','investment','salary','loan','bank','credit','afford','spend','broke','rich','wealth','financial','mortgage','taxes','income'],
  creativity:    ['write','writing','art','artist','music','draw','paint','design','create','poem','poetry','story','novel','song','creativity','project','idea','inspiration','craft','photography','film','dance','sketch'],
  education:     ['school','study','class','university','college','degree','exam','homework','teacher','professor','learn','lecture','grade','student','course','assignment','major','graduate','research','thesis','knowledge'],
  travel:        ['travel','trip','vacation','flight','airport','city','country','abroad','explore','adventure','hotel','tourist','culture','passport','backpack','roadtrip','destination','beach','mountain','journey'],
  hobbies:       ['game','gaming','cook','cooking','recipe','garden','gardening','hike','hiking','bike','cycling','sport','movie','show','netflix','series','read','book','podcast','hobby','collect','photography','diy','knit'],
  'self-care':   ['meditate','meditation','rest','relax','journal','gratitude','mindful','mindfulness','spa','bath','walk','nature','breathe','calm','peace','quiet','nap','reflect','morning','routine','ritual','recharge','burnout'],
  spirituality:  ['god','pray','prayer','faith','spiritual','soul','universe','grateful','blessing','karma','church','mosque','temple','believe','purpose','meaning','destiny','energy','enlighten'],
  growth:        ['goal','progress','improve','challenge','habit','discipline','learn','better','growth','potential','confidence','mindset','change','transform','overcome','achieve','success','motivation','ambition','future','plan','dream']
};

const TONE_KEYWORDS = {
  worried:     ['worried','worry','nervous','scared','fear','afraid','concern','uncertain','doubt','dread','panic'],
  anxious:     ['anxious','anxiety','stress','stressed','tense','uneasy','restless','apprehensive'],
  excited:     ['excited','amazing','thrilled','awesome','great','fantastic','wow','incredible','yay','pumped','stoked'],
  hopeful:     ['hope','hopeful','optimistic','looking forward','better','soon','maybe','potential','positive'],
  grateful:    ['grateful','thankful','blessed','appreciate','lucky','fortunate','gratitude','glad'],
  sad:         ['sad','sadness','cry','crying','tears','depressed','depression','miserable','down','grief','loss','unhappy'],
  frustrated:  ['frustrated','frustration','annoyed','irritated','angry','anger','mad','upset','ugh'],
  desperate:   ['desperate','helpless','hopeless','lost','stuck','trapped','giving up'],
  inspired:    ['inspired','inspiration','motivated','creative','idea','eureka','suddenly','realized'],
  calm:        ['calm','peaceful','serene','quiet','settled','centered','balanced','okay','fine','grounded'],
  overwhelmed: ['overwhelmed','too much','swamped','exhausted','burnt out','burnout'],
  nostalgic:   ['miss','used to','remember','memory','memories','back then','childhood','old days','past'],
  proud:       ['proud','achievement','accomplished','did it','success','finally','milestone'],
  confused:    ['confused','unsure','unclear','wondering','question','not sure','conflicted'],
  content:     ['content','satisfied','enough','happy with','at peace','comfortable','fulfilled']
};

const TOPIC_COLORS = {
  career:'#4a9eff', health:'#4ade80', relationships:'#f472b6',
  finance:'#fbbf24', creativity:'#a78bfa', family:'#fb923c',
  romance:'#f87171', education:'#34d399', spirituality:'#c084fc',
  travel:'#38bdf8', hobbies:'#a3e635', 'self-care':'#f9a8d4',
  growth:'#2dd4bf', default:'#9ca3af'
};

// ─── STATE MANAGEMENT ────────────────────────────────────────────────────────
let entries           = [];
let currentId         = null;
let calViewDate       = new Date();
let saveTimer         = null;
let searchQuery       = '';
let currentFont       = 'lora';
let previewMode       = false;
let activeTopicFilter = null;
let selectedProvider  = 'gemini';

const DEFAULT_SYSTEM_PROMPT = 'You are an empathetic, insightful executive life coach and journaling mentor. Help the author extract clarity, uncover root causes, celebrate wins, cultivate strong personal discipline, and discover actionable next steps.';

let aiConfig = {
  provider:      'gemini',
  geminiKey:     '',
  geminiModel:   'gemini-3.6-flash',
  openaiKey:     '',
  openaiModel:   'gpt-4o-mini',
  ollamaUrl:     'http://localhost:11434',
  ollamaModel:   'llama3',
  llamacppUrl:   'http://localhost:9931',
  llamacppModel: 'ggml-org/gemma-4-E4B-it-GGUF:Q8_0',
  llamacppKey:   '',
  systemPrompt:  DEFAULT_SYSTEM_PROMPT
};

// Safe DOM Helper
const byId = id => document.getElementById(id);

// ─── LOCAL STORAGE HELPERS ────────────────────────────────────────────────────
function loadAiConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(AI_KEY) || '{}');
    Object.assign(aiConfig, saved);
    if (saved.provider) selectedProvider = saved.provider;
  } catch(e) {}
}
function saveAiConfig() {
  try { localStorage.setItem(AI_KEY, JSON.stringify(aiConfig)); } catch(e) {}
}

function loadEntries() {
  try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { entries = []; }
}
function saveEntries() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch(e) {}
}

function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
    if (p.font) setFont(p.font, false);
    if (p.lastId) currentId = p.lastId;
  } catch(e) {}
}
function savePrefs() {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify({ font: currentFont, lastId: currentId })); } catch(e) {}
}

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function formatDate(iso) { return new Date(iso).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }); }
function formatShortDate(iso) { return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric' }); }

function isoDate(d = new Date()) {
  const dt = typeof d === 'string' ? new Date(d) : (d || new Date());
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getEntryDate(e) {
  if (!e) return '';
  if (e.date && /^\d{4}-\d{2}-\d{2}$/.test(e.date)) return e.date;
  if (e.createdAt) return isoDate(new Date(e.createdAt));
  return '';
}

function plainText(md) {
  return (md || '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/>\s?/g, '')
    .replace(/[-*]\s+/g, '')
    .replace(/\d+\.\s+/g, '')
    .replace(/---+/g, '')
    .trim();
}

function countWords(t)     { const p = plainText(t).trim(); return p ? p.split(/\s+/).filter(w => w.length > 0).length : 0; }
function countSentences(t) { const p = plainText(t).trim(); return p ? (p.match(/[.!?]+/g) || []).length || (p.length ? 1 : 0) : 0; }
function getUniqueWords(t) { const w = plainText(t).toLowerCase().split(/[\s,.!?;:'"()\-—]+/).filter(w => w.length > 2 && /^[a-z]+$/.test(w)); return new Set(w); }
function readTime(t)       { return Math.max(1, Math.ceil(countWords(t) / 200)); }

function getTopWords(t, n = 15) {
  const words = plainText(t).toLowerCase().split(/[\s,.!?;:'"()\-—]+/).filter(w => w.length > 3 && /^[a-z]+$/.test(w) && !STOP_WORDS.has(w));
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n);
}

// ─── LOCAL KEYWORD & SUBTOPIC DETECTION ───────────────────────────────────────
function detectTopicsLocal(text) {
  const lower = plainText(text).toLowerCase();
  const words = lower.split(/[\s,.!?;:'"()\-—]+/);
  const wordSet = new Set(words);

  const topicScores = {};
  for (const [topic, kws] of Object.entries(TOPIC_KEYWORDS)) {
    let score = 0;
    for (const kw of kws) {
      if (kw.includes(' ')) { if (lower.includes(kw)) score += 2; }
      else if (wordSet.has(kw)) score += 1;
    }
    if (score > 0) topicScores[topic] = score;
  }

  const toneScores = {};
  for (const [tone, kws] of Object.entries(TONE_KEYWORDS)) {
    let score = 0;
    for (const kw of kws) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > 0) toneScores[tone] = score;
  }

  const sortedTopics = Object.entries(topicScores).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const sortedTones  = Object.entries(toneScores).sort((a, b) => b[1] - a[1]);
  const primaryTone  = sortedTones[0]?.[0] || 'reflective';

  return sortedTopics.map(([topic]) => ({
    topic,
    tone: primaryTone,
    confidence: 0.7,
    source: 'local'
  }));
}

function extractSubtopicsLocal(text) {
  const lower = plainText(text).toLowerCase();
  const words = lower
    .split(/[\s,.!?;:'"()\[\]\-—]+/)
    .filter(w => w.length > 3 && /^[a-z]+$/.test(w) && !STOP_WORDS.has(w));

  if (words.length < 3) return [];

  const ngrams = {};
  for (let i = 0; i < words.length - 1; i++) {
    const bi = words[i] + '-' + words[i+1];
    ngrams[bi] = (ngrams[bi] || 0) + 1;
    if (i < words.length - 2) {
      const tri = words[i] + '-' + words[i+1] + '-' + words[i+2];
      ngrams[tri] = (ngrams[tri] || 0) + 1;
    }
  }

  const candidates = Object.entries(ngrams)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase]) => phrase);

  if (candidates.length < 2) {
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    Object.entries(freq)
      .filter(([w, c]) => c >= 2 && !candidates.some(c2 => c2.includes(w)))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([w]) => candidates.push(w));
  }

  return [...new Set(candidates)].slice(0, 5);
}

// ─── AI API INTEGRATION ───────────────────────────────────────────────────────
const AI_PROMPT = (content) => `You are a thoughtful journaling assistant. Analyze this journal entry and respond with ONLY valid JSON — no markdown, no explanation.

Return this exact structure:
{
  "topics": [
    {"topic": "career", "tone": "worried"},
    {"topic": "relationships", "tone": "hopeful"}
  ],
  "subtopics": ["job-interview-prep", "girlfriend-problems", "building-ai-app"],
  "summary": "One sentence that captures the emotional core of this entry.",
  "dominant_emotion": "anxious"
}

Rules:
- topics (pick 1–4 that genuinely apply): career, health, relationships, family, romance, finance, creativity, education, travel, hobbies, self-care, spirituality, growth
- tones (pick 1 per topic): worried, anxious, excited, hopeful, grateful, sad, frustrated, desperate, inspired, calm, overwhelmed, nostalgic, proud, confused, content
- subtopics: 2–6 SPECIFIC, granular hyphenated tags describing exact subjects (e.g. girlfriend-problems, building-ai-app, home-automation, gym-plateau, salary-negotiation).
- summary: 1 sentence, empathetic.

Journal Entry:
---
${content.slice(0, 3000)}
---`;

function cleanJsonResponse(rawText) {
  if (!rawText || !rawText.trim()) {
    throw new Error('Received empty response from AI model');
  }
  let text = rawText.trim();

  // Strip code fences
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // 1. First attempt: standard JSON.parse
  try {
    return JSON.parse(text);
  } catch (e) {}

  // 2. Second attempt: extract outermost { ... } block & clean common syntax errors
  const firstBrace = text.indexOf('{');
  const lastBrace  = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {}

    // Fix trailing commas and unquoted properties
    try {
      const fixed = candidate
        .replace(/,\s*([}\]])/g, '$1') // remove trailing commas before } or ]
        .replace(/[\u201C\u201D]/g, '"') // replace curly quotes
        .replace(/[\u2018\u2019]/g, "'");
      return JSON.parse(fixed);
    } catch (e) {}
  }

  // 3. Third attempt: lenient regex extraction for structured fields
  try {
    const topics = [];
    const topicRegex = /\{\s*"topic"\s*:\s*"([^"]+)"\s*,\s*"tone"\s*:\s*"([^"]+)"\s*\}/gi;
    let m;
    while ((m = topicRegex.exec(text)) !== null) {
      topics.push({ topic: m[1].toLowerCase().trim(), tone: m[2].toLowerCase().trim() });
    }

    const subtopics = [];
    const subMatch = text.match(/"subtopics"\s*:\s*\[([^\]]*)\]/i);
    if (subMatch) {
      const tagRegex = /"([^"]+)"/g;
      let tm;
      while ((tm = tagRegex.exec(subMatch[1])) !== null) {
        subtopics.push(tm[1].replace(/^#/, '').toLowerCase().trim());
      }
    }

    const summaryMatch = text.match(/"summary"\s*:\s*"([^"]+)"/i);
    const emotionMatch = text.match(/"dominant_emotion"\s*:\s*"([^"]+)"/i);

    if (topics.length > 0 || subtopics.length > 0) {
      return {
        topics,
        subtopics,
        summary: summaryMatch ? summaryMatch[1] : '',
        dominant_emotion: emotionMatch ? emotionMatch[1] : ''
      };
    }
  } catch (e) {}

  throw new Error('Could not parse AI response as JSON');
}

async function fetchGeminiModels(apiKey) {
  if (!apiKey) return [];
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || [])
      .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
      .map(m => m.name.replace(/^models\//, ''));
  } catch(e) {
    return [];
  }
}

function updateGeminiModelDropdown(models, currentVal) {
  const select = byId('geminiModel');
  if (!select || !models || models.length === 0) return;
  const preferred = currentVal || aiConfig.geminiModel || 'gemini-3.6-flash';
  select.innerHTML = models.map(m => `
    <option value="${m}" ${m === preferred ? 'selected' : ''}>${m}</option>
  `).join('');
  if (models.includes(preferred)) {
    select.value = preferred;
  } else if (models.length > 0) {
    select.value = models[0];
  }
}

async function callGemini(content) {
  if (!aiConfig.geminiKey) throw new Error('Please enter a Gemini API Key in Settings ⚙');
  
  let targetModel = aiConfig.geminiModel || 'gemini-3.6-flash';
  
  // Array of models to try in case selected model fails with 404/not found
  const candidateModels = [
    targetModel,
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.6-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash'
  ];
  const uniqueModels = [...new Set(candidateModels)];

  const body = {
    contents: [{ parts: [{ text: AI_PROMPT(content) }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
      responseMimeType: "application/json"
    }
  };

  let lastError = null;

  for (const model of uniqueModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.geminiKey}`;
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0];
        if (!candidate) {
          const blockReason = data.promptFeedback?.blockReason || 'No candidate response returned';
          throw new Error(`Gemini blocked: ${blockReason}`);
        }
        const text = candidate.content?.parts?.map(p => p.text || '').join('') || '';
        if (!text.trim()) {
          throw new Error(`Gemini returned empty response (${candidate.finishReason || 'unknown'})`);
        }
        // If this model worked and differed from configured, update config
        if (model !== aiConfig.geminiModel) {
          aiConfig.geminiModel = model;
          saveAiConfig();
          const select = byId('geminiModel');
          if (select) select.value = model;
        }
        return cleanJsonResponse(text);
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = err.error?.message || `HTTP ${res.status}`;
        lastError = new Error(msg);
        if (!msg.toLowerCase().includes('not found') && !msg.toLowerCase().includes('is not supported')) {
          throw lastError;
        }
      }
    } catch(e) {
      lastError = e;
      if (!e.message.toLowerCase().includes('not found') && !e.message.toLowerCase().includes('is not supported')) {
        throw e;
      }
    }
  }

  throw lastError || new Error('Failed to generate content with Gemini');
}

async function fetchOpenAIModels(apiKey) {
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || [])
      .map(m => m.id)
      .filter(id => (id.startsWith('gpt-') || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('chatgpt')) && !id.includes('realtime') && !id.includes('audio') && !id.includes('transcription'))
      .sort((a,b) => a.localeCompare(b));
  } catch(e) {
    return [];
  }
}

function updateOpenAIModelDropdown(models, currentVal) {
  const select = byId('openaiModel');
  const customInput = byId('openaiCustomModel');
  if (!select) return;

  const activeModel = currentVal || aiConfig.openaiModel || 'gpt-4o-mini';

  if (!models || models.length === 0) {
    const defaults = ['gpt-4o-mini', 'gpt-4o', 'o3-mini', 'o1', 'o1-mini', 'gpt-4.5-preview', 'chatgpt-4o-latest'];
    select.innerHTML = defaults.map(m => `<option value="${m}" ${m === activeModel ? 'selected' : ''}>${m}</option>`).join('') + `<option value="custom" ${!defaults.includes(activeModel) ? 'selected' : ''}>-- Custom Model Name --</option>`;
    if (defaults.includes(activeModel)) {
      select.value = activeModel;
      if (customInput) customInput.classList.add('hidden');
    } else {
      select.value = 'custom';
      if (customInput) {
        customInput.classList.remove('hidden');
        customInput.value = activeModel;
      }
    }
    return;
  }

  const modelOptions = models.map(m => `
    <option value="${m}" ${m === activeModel ? 'selected' : ''}>${m}</option>
  `).join('') + `<option value="custom" ${!models.includes(activeModel) ? 'selected' : ''}>-- Custom Model Name --</option>`;

  select.innerHTML = modelOptions;

  if (models.includes(activeModel)) {
    select.value = activeModel;
    if (customInput) customInput.classList.add('hidden');
  } else {
    select.value = 'custom';
    if (customInput) {
      customInput.classList.remove('hidden');
      customInput.value = activeModel;
    }
  }
}

async function callOpenAI(content) {
  if (!aiConfig.openaiKey) throw new Error('Please enter an OpenAI API Key in Settings ⚙');
  
  const modelName = aiConfig.openaiModel || 'gpt-4o-mini';
  const body = {
    model: modelName,
    messages: [{ role: 'user', content: AI_PROMPT(content) }],
    temperature: 0.2
  };
  
  // o1 / o3 series use max_completion_tokens and do not support custom temperature
  if (modelName.startsWith('o1') || modelName.startsWith('o3')) {
    body.max_completion_tokens = 1024;
    delete body.temperature;
  } else {
    body.max_tokens = 1024;
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiConfig.openaiKey}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let msg = `OpenAI HTTP ${res.status}`;
    try { const err = await res.json(); msg = err.error?.message || msg; } catch(e) {}
    throw new Error(msg);
  }
  const data = await res.json();
  return cleanJsonResponse(data.choices?.[0]?.message?.content || '');
}

async function fetchOllamaModels(baseUrl = 'http://localhost:11434') {
  const cleanUrl = (baseUrl || 'http://localhost:11434').replace(/\/$/, '');
  try {
    const res = await fetch(`${cleanUrl}/api/tags`);
    if (!res.ok) throw new Error(`Ollama server returned HTTP ${res.status}`);
    const data = await res.json();
    return (data.models || []).map(m => m.name);
  } catch (e) {
    let msg = e.message || 'Cannot reach Ollama server';
    if (msg === 'Failed to fetch' || e.name === 'TypeError') {
      msg = 'Connection blocked. Run: OLLAMA_ORIGINS="*" ollama serve';
    }
    throw new Error(msg);
  }
}

function updateOllamaModelDropdown(models, currentVal) {
  const select = byId('ollamaModelSelect');
  const customInput = byId('ollamaModel');
  if (!select) return;

  const activeModel = currentVal || aiConfig.ollamaModel || 'llama3';

  if (!models || models.length === 0) {
    select.innerHTML = `
      <option value="llama3">llama3</option>
      <option value="llama3.1">llama3.1</option>
      <option value="llama3.2">llama3.2</option>
      <option value="mistral">mistral</option>
      <option value="phi3">phi3</option>
      <option value="gemma2">gemma2</option>
      <option value="qwen2.5">qwen2.5</option>
      <option value="custom">-- Custom / Other Model --</option>
    `;
    if (['llama3','llama3.1','llama3.2','mistral','phi3','gemma2','qwen2.5'].includes(activeModel)) {
      select.value = activeModel;
      if (customInput) customInput.classList.add('hidden');
    } else {
      select.value = 'custom';
      if (customInput) {
        customInput.classList.remove('hidden');
        customInput.value = activeModel;
      }
    }
    return;
  }

  const modelOptions = models.map(m => `
    <option value="${m}" ${m === activeModel ? 'selected' : ''}>${m}</option>
  `).join('') + `<option value="custom" ${!models.includes(activeModel) ? 'selected' : ''}>-- Custom / Other Model --</option>`;

  select.innerHTML = modelOptions;

  if (models.includes(activeModel)) {
    select.value = activeModel;
    if (customInput) customInput.classList.add('hidden');
  } else {
    select.value = 'custom';
    if (customInput) {
      customInput.classList.remove('hidden');
      customInput.value = activeModel;
    }
  }
}

async function callOllama(content) {
  const baseUrl = (aiConfig.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');
  const url = `${baseUrl}/api/chat`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: aiConfig.ollamaModel || 'llama3',
        messages: [{ role: 'user', content: AI_PROMPT(content) }],
        stream: false,
        format: 'json',
        options: { temperature: 0.2 }
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Ollama HTTP ${res.status} — verify model name`);
    }
    const data = await res.json();
    const text = data.message?.content || data.response || '';
    return cleanJsonResponse(text);
  } catch (e) {
    if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
      throw new Error('Cannot connect to Ollama. Start with: OLLAMA_ORIGINS="*" ollama serve');
    }
    throw e;
  }
}

// ─── LLAMA.CPP / LOCAL OPENAI-COMPATIBLE CALLER ──────────────────────────────
async function fetchLlamaCppModels(baseUrl = 'http://localhost:8080', apiKey = '') {
  const cleanUrl = (baseUrl || 'http://localhost:8080').replace(/\/$/, '');
  const headers = {};
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  try {
    const res = await fetch(`${cleanUrl}/v1/models`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map(m => m.id || m.name || m);
  } catch(e) {
    return [];
  }
}

function updateLlamaCppModelDropdown(models, currentVal) {
  const select = byId('llamacppModelSelect');
  const customInput = byId('llamacppModel');
  if (!select) return;

  const activeModel = currentVal || aiConfig.llamacppModel || 'default';

  if (!models || models.length === 0) {
    select.innerHTML = `
      <option value="default">default (Active Server Model)</option>
      <option value="custom">-- Custom Model ID --</option>
    `;
    if (activeModel === 'default') {
      select.value = 'default';
      if (customInput) customInput.classList.add('hidden');
    } else {
      select.value = 'custom';
      if (customInput) {
        customInput.classList.remove('hidden');
        customInput.value = activeModel;
      }
    }
    return;
  }

  const opts = models.map(m => `<option value="${m}" ${m === activeModel ? 'selected' : ''}>${m}</option>`).join('') + `<option value="custom" ${!models.includes(activeModel) ? 'selected' : ''}>-- Custom Model ID --</option>`;
  select.innerHTML = opts;
  if (models.includes(activeModel)) {
    select.value = activeModel;
    if (customInput) customInput.classList.add('hidden');
  } else {
    select.value = 'custom';
    if (customInput) {
      customInput.classList.remove('hidden');
      customInput.value = activeModel;
    }
  }
}

async function callLlamaCpp(content) {
  const baseUrl = (aiConfig.llamacppUrl || 'http://localhost:9931').replace(/\/$/, '');
  const url = `${baseUrl}/v1/chat/completions`;
  const headers = { 'Content-Type': 'application/json' };
  if (aiConfig.llamacppKey) headers['Authorization'] = `Bearer ${aiConfig.llamacppKey}`;

  const body = {
    messages: [{ role: 'user', content: AI_PROMPT(content) }],
    temperature: 0.2
  };
  if (aiConfig.llamacppModel && aiConfig.llamacppModel !== 'default') {
    body.model = aiConfig.llamacppModel;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || err.error || `Server HTTP ${res.status}`);
    }
    const data = await res.json();
    const msg = data.choices?.[0]?.message;
    const text = msg?.content || msg?.reasoning_content || '';
    return cleanJsonResponse(text);
  } catch (e) {
    if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
      throw new Error(`Cannot connect to server at ${baseUrl}. Ensure server is running and accessible.`);
    }
    throw e;
  }
}

async function analyzeWithAI(content) {
  if (!content.trim() || countWords(content) < 3) return null;
  switch (aiConfig.provider) {
    case 'gemini':   return await callGemini(content);
    case 'openai':   return await callOpenAI(content);
    case 'ollama':   return await callOllama(content);
    case 'llamacpp': return await callLlamaCpp(content);
    default:         return null;
  }
}

// ─── AI ANALYSIS LENSES & TEXT GENERATION ────────────────────────────────────
const ANALYSIS_LENSES = {
  todos: {
    name: 'To-Dos & Actions',
    icon: '📋',
    title: 'Action Items & Next Steps',
    prompt: `Analyze this journal entry and extract all action items, commitments, to-dos, and follow-ups. Format as a clean markdown checklist (- [ ] Task name). Group them under '### Immediate Priorities' and '### Upcoming / Next Steps'. If no explicit tasks were mentioned, recommend 2-3 logical next steps based on the thoughts written.`
  },
  pillarSuggestions: {
    name: 'Life Pillar Suggestions (PR Review)',
    icon: '🌟',
    title: 'Living Life Pillar Suggestions & Pull Request Review',
    isPR: true,
    prompt: `You are an executive life systems compiler. Analyze this journal entry against the author's primary life pillars:
- Career & Job Search (interview prep, system design, skills, resume, networking)
- Gym & Fitness Consistency (workouts, progressive overload, nutrition, meal prep, sleep, recovery)
- Dreams & Big Ambitions (building SaaS/AI apps, creative pursuits, financial independence)
- Meaningful Relationships (family, friendships, partner, boundaries, empathy)
- General Life Principles (mindset, discipline, personal standards)

Extract 1 to 5 profound realizations or working solutions from the text.

CRITICAL INSTRUCTION:
Do NOT rewrite, summarize, or paraphrase using AI words. Extract the EXACT, VERBATIM quoted text directly as written by the author in their journal entry.

Respond ONLY with valid JSON with this exact structure:
{
  "suggestions": [
    {
      "pillarId": "career", // "career" | "gym" | "dreams" | "relationships" or custom
      "pillarName": "Career & Job Search",
      "section": "realizations", // "realizations" or "solutions" or "manual"
      "quotedText": "Exact verbatim quote from the entry as written by user",
      "context": "Brief reason why this quote is significant"
    }
  ]
}`
  },
  principles: {
    name: 'Core Principles',
    icon: '🧭',
    title: 'Core Principles & Standards',
    prompt: `Analyze this journal entry and extract the core personal principles, mental models, philosophies, or self-standards the author established, realized, or reinforced. Format each principle with a bold heading (e.g. ### 1. Principle Name) followed by a short quote or takeaway on how to live by it.`
  },
  motivation: {
    name: 'Motivational Coach',
    icon: '🔥',
    title: 'Empowering Coach Boost',
    prompt: `Act as an empathetic, high-energy personal performance coach. Read this journal entry, acknowledge the challenges or celebrate the wins, provide empowering perspective, and end with an actionable mantra for the day.`
  },
  mits: {
    name: 'Top Priorities (MITs)',
    icon: '🎯',
    title: 'Most Important Tasks (MITs)',
    prompt: `Analyze this journal entry and identify the 1 to 3 Most Important Tasks (MITs) — the highest-leverage actions that will make the biggest difference. Explain why each priority matters and the immediate first step.`
  },
  summary: {
    name: 'Section Summary',
    icon: '📑',
    title: 'Section-by-Section Summary',
    prompt: `Analyze this journal entry and provide a concise, section-by-section breakdown. For each distinct theme or paragraph, provide a bold heading and 2-3 bullet points summarizing the core thoughts and outcomes.`
  },
  mood: {
    name: 'Mood Deep-Dive',
    icon: '🌡️',
    title: 'Psychological & Emotional Deep-Dive',
    prompt: `Perform a deep emotional and psychological analysis of this journal entry. Break down: 1) Primary Emotional State, 2) Subtle Undertones, 3) Key Triggers & Friction Points, 4) Energy Level, and 5) A constructive mindset recommendation.`
  },
  topics: {
    name: 'Topics & Tags',
    icon: '🏷️',
    title: 'Compound Themes & Tags',
    prompt: `Analyze this journal entry and extract: 1) Broad Topics & Tones (e.g. career · excited, health · hopeful), 2) Granular Hashtags (#subtopics), and 3) A one-sentence reflection.`
  },
  custom: {
    name: 'Custom Prompt',
    icon: '💬',
    title: 'Custom AI Analysis',
    prompt: `Answer the user's custom question based on their journal entry.`
  }
};

async function generateTextWithAI(promptInstruction, content) {
  if (!content || !content.trim()) throw new Error('Journal entry is empty. Write something first.');

  const systemPrompt = aiConfig.systemPrompt || DEFAULT_SYSTEM_PROMPT;
  const fullPrompt = `${promptInstruction}\n\nJournal Entry:\n---\n${content.slice(0, 5000)}\n---`;

  if (aiConfig.provider === 'gemini') {
    if (!aiConfig.geminiKey) throw new Error('Please enter your Gemini API Key in Settings ⚙');
    const targetModel = aiConfig.geminiModel || 'gemini-3.6-flash';
    const models = [targetModel, 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.6-pro', 'gemini-2.5-flash'];
    const uniqueModels = [...new Set(models)];

    const body = {
      contents: [{ parts: [{ text: fullPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
    };

    let lastError = null;
    for (const model of uniqueModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.geminiKey}`;
      try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
          if (text.trim()) return text.trim();
        } else {
          const err = await res.json().catch(() => ({}));
          lastError = new Error(err.error?.message || `HTTP ${res.status}`);
        }
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error('Failed to generate with Gemini');
  }

  if (aiConfig.provider === 'openai') {
    if (!aiConfig.openaiKey) throw new Error('Please enter your OpenAI API Key in Settings ⚙');
    const model = aiConfig.openaiModel || 'gpt-4o-mini';
    const isReasoning = model.startsWith('o1') || model.startsWith('o3');

    const messages = isReasoning
      ? [{ role: 'user', content: `[SYSTEM INSTRUCTIONS]: ${systemPrompt}\n\n${fullPrompt}` }]
      : [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullPrompt }
        ];

    const body = {
      model,
      messages
    };
    if (isReasoning) {
      body.max_completion_tokens = 1500;
    } else {
      body.temperature = 0.3;
      body.max_tokens = 1500;
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.openaiKey}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  }

  if (aiConfig.provider === 'ollama') {
    const baseUrl = (aiConfig.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: aiConfig.ollamaModel || 'llama3',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullPrompt }
        ],
        stream: false,
        options: { temperature: 0.3 }
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Ollama HTTP ${res.status}`);
    }
    const data = await res.json();
    return (data.message?.content || data.response || '').trim();
  }

  if (aiConfig.provider === 'llamacpp') {
    const baseUrl = (aiConfig.llamacppUrl || 'http://localhost:9931').replace(/\/$/, '');
    const headers = { 'Content-Type': 'application/json' };
    if (aiConfig.llamacppKey) headers['Authorization'] = `Bearer ${aiConfig.llamacppKey}`;

    const body = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: fullPrompt }
      ],
      temperature: 0.3
    };
    if (aiConfig.llamacppModel && aiConfig.llamacppModel !== 'default') {
      body.model = aiConfig.llamacppModel;
    }

    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `llama.cpp HTTP ${res.status}`);
    }
    const data = await res.json();
    const msg = data.choices?.[0]?.message;
    return (msg?.content || msg?.reasoning_content || '').trim();
  }

  // Local heuristic generator
  return generateLocalLensText(promptInstruction, content);
}

function generateLocalLensText(promptInstruction, content) {
  const lines = content.split('\n').filter(l => l.trim());
  const words = countWords(content);

  if (promptInstruction.includes('checklist') || promptInstruction.includes('To-Dos')) {
    const actionLines = lines.filter(l => /\b(need to|must|should|will|plan to|have to|todo|finish|start|build|buy|call)\b/i.test(l));
    if (actionLines.length > 0) {
      return `### Immediate Priorities\n` + actionLines.map(l => `- [ ] ${l.replace(/^[-*#\d.]+\s*/, '')}`).join('\n');
    }
    return `### Action Items\n- [ ] Review today's key insights and plan tomorrow's first step\n- [ ] Follow up on main priorities mentioned in this entry`;
  }

  if (promptInstruction.includes('principles') || promptInstruction.includes('Standards')) {
    return `### Core Principles & Takeaways\n- **Continuous Consistency**: Small daily reflection compounds into massive clarity.\n- **Mindful Awareness**: Acknowledging thoughts and emotions is the first step to mastering them.`;
  }

  if (promptInstruction.includes('coach') || promptInstruction.includes('Motivational')) {
    return `### 🌟 Coach's Note\nYou've written **${words} words** of thoughtful reflection today. Acknowledging your thoughts is proof of continuous growth.\n\n> "Consistency is not about perfection; it is about refusing to stop."\n\nKeep building your momentum today!`;
  }

  return `### Journal Summary\n- **Word Count**: ${words} words\n- **Core Theme**: Focused daily reflection\n- **Status**: Recorded and saved locally.`;
}

// ─── AI SETTINGS MODAL HANDLERS ───────────────────────────────────────────────
function openAiSettings() {
  loadAiConfig();
  selectedProvider = aiConfig.provider || 'gemini';

  const gKey   = byId('geminiKey');
  const gModel = byId('geminiModel');
  const oKey   = byId('openaiKey');
  const oModel = byId('openaiModel');
  const lUrl   = byId('ollamaUrl');
  const lModel = byId('ollamaModel');
  const lcUrl  = byId('llamacppUrl');
  const lcKey  = byId('llamacppKey');
  const lcMod  = byId('llamacppModel');

  if (gKey)   gKey.value   = aiConfig.geminiKey || '';
  if (gModel) gModel.value = aiConfig.geminiModel || 'gemini-3.6-flash';
  if (oKey)   oKey.value   = aiConfig.openaiKey || '';
  if (lUrl)   lUrl.value   = aiConfig.ollamaUrl || 'http://localhost:11434';
  if (lModel) lModel.value = aiConfig.ollamaModel || 'llama3';
  if (lcUrl)  lcUrl.value  = aiConfig.llamacppUrl || 'http://localhost:8080';
  if (lcKey)  lcKey.value  = aiConfig.llamacppKey || '';
  if (lcMod)  lcMod.value  = aiConfig.llamacppModel || 'default';

  const sysPromptEl = byId('aiSystemPrompt');
  if (sysPromptEl) sysPromptEl.value = aiConfig.systemPrompt || DEFAULT_SYSTEM_PROMPT;

  // If Gemini key is saved, auto-fetch supported models
  if (aiConfig.geminiKey) {
    fetchGeminiModels(aiConfig.geminiKey).then(models => {
      if (models && models.length > 0) updateGeminiModelDropdown(models, aiConfig.geminiModel);
    });
  }

  // If OpenAI key is saved, auto-fetch supported models
  updateOpenAIModelDropdown([], aiConfig.openaiModel);
  if (aiConfig.openaiKey) {
    fetchOpenAIModels(aiConfig.openaiKey).then(models => {
      if (models && models.length > 0) updateOpenAIModelDropdown(models, aiConfig.openaiModel);
    });
  }

  // Pre-fetch Ollama models
  fetchOllamaModels(aiConfig.ollamaUrl || 'http://localhost:11434').then(models => {
    updateOllamaModelDropdown(models, aiConfig.ollamaModel);
  }).catch(() => {
    updateOllamaModelDropdown([], aiConfig.ollamaModel);
  });

  // Pre-fetch llama.cpp models
  const initialLcUrl = aiConfig.llamacppUrl || 'http://localhost:9931';
  fetchLlamaCppModels(initialLcUrl, aiConfig.llamacppKey).then(models => {
    updateLlamaCppModelDropdown(models, aiConfig.llamacppModel || 'ggml-org/gemma-4-E4B-it-GGUF:Q8_0');
  }).catch(() => {
    updateLlamaCppModelDropdown(['ggml-org/gemma-4-E4B-it-GGUF:Q8_0'], aiConfig.llamacppModel || 'ggml-org/gemma-4-E4B-it-GGUF:Q8_0');
  });

  switchAiTab(selectedProvider);
  updateAiStatus();

  const modal = byId('aiSettingsModal');
  if (modal) modal.classList.remove('hidden');
}

function switchAiTab(provider) {
  selectedProvider = provider;
  document.querySelectorAll('.ai-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.provider === provider);
  });

  const panelMap = {
    gemini:   'panelGemini',
    openai:   'panelOpenAI',
    ollama:   'panelOllama',
    llamacpp: 'panelLlamaCpp',
    none:     'panelNone'
  };
  ['panelGemini', 'panelOpenAI', 'panelOllama', 'panelLlamaCpp', 'panelNone'].forEach(id => {
    const el = byId(id);
    if (el) el.classList.add('hidden');
  });

  const targetId = panelMap[provider];
  if (targetId && byId(targetId)) {
    byId(targetId).classList.remove('hidden');
  }
}

function updateAiStatus(state = 'idle', customMsg = '') {
  const dot  = byId('aiStatusDot');
  const text = byId('aiStatusText');
  if (!dot || !text) return;

  dot.className = 'ai-status-dot';
  if (state === 'testing') {
    dot.classList.add('testing');
    text.textContent = 'Testing connection...';
    return;
  }
  if (state === 'ok') {
    dot.classList.add('ok');
    text.textContent = customMsg || `Connected to ${selectedProvider}`;
    return;
  }
  if (state === 'error') {
    dot.classList.add('error');
    text.textContent = customMsg || 'Connection failed';
    return;
  }

  // Idle check
  if (aiConfig.provider === 'none') {
    text.textContent = 'AI features disabled — using keyword matching';
  } else if ((aiConfig.provider === 'gemini' && aiConfig.geminiKey) ||
             (aiConfig.provider === 'openai' && aiConfig.openaiKey) ||
             (aiConfig.provider === 'ollama') ||
             (aiConfig.provider === 'llamacpp')) {
    dot.classList.add('ok');
    const mod = aiConfig[aiConfig.provider + 'Model'] || '';
    text.textContent = `${aiConfig.provider} configured ${mod ? `(${mod})` : ''}`;
  } else {
    text.textContent = 'Not configured — enter API key / URL';
  }
}

async function testAiConnection() {
  updateAiStatus('testing');

  // Read current input values
  const gKey   = byId('geminiKey')?.value.trim() || '';
  const gModel = byId('geminiModel')?.value || 'gemini-3.6-flash';
  const oKey   = byId('openaiKey')?.value.trim() || '';
  
  const oSelect = byId('openaiModel');
  const oCustom = byId('openaiCustomModel');
  const oModel = (oSelect?.value === 'custom' ? oCustom?.value.trim() : oSelect?.value) || oCustom?.value.trim() || 'gpt-4o-mini';

  const lUrl   = byId('ollamaUrl')?.value.trim() || 'http://localhost:11434';
  const ollamaSelect = byId('ollamaModelSelect');
  const ollamaCustom = byId('ollamaModel');
  const lModel = (ollamaSelect?.value === 'custom' ? ollamaCustom?.value.trim() : ollamaSelect?.value) || ollamaCustom?.value.trim() || 'llama3';

  const lcUrl    = byId('llamacppUrl')?.value.trim() || 'http://localhost:9931';
  const lcKey    = byId('llamacppKey')?.value.trim() || '';
  const lcSelect = byId('llamacppModelSelect');
  const lcCustom = byId('llamacppModel');
  const lcModel  = lcCustom?.value.trim() || lcSelect?.value || 'ggml-org/gemma-4-E4B-it-GGUF:Q8_0';

  const sysPrompt = byId('aiSystemPrompt')?.value.trim() || DEFAULT_SYSTEM_PROMPT;

  // Apply to config for testing
  aiConfig.provider      = selectedProvider;
  aiConfig.geminiKey     = gKey;
  aiConfig.geminiModel   = gModel;
  aiConfig.openaiKey     = oKey;
  aiConfig.openaiModel   = oModel;
  aiConfig.ollamaUrl     = lUrl;
  aiConfig.ollamaModel   = lModel;
  aiConfig.llamacppUrl   = lcUrl;
  aiConfig.llamacppKey   = lcKey;
  aiConfig.llamacppModel = lcModel;
  aiConfig.systemPrompt  = sysPrompt;

  if (selectedProvider === 'none') {
    updateAiStatus('idle', 'Local keyword matching selected');
    saveAiConfig();
    return;
  }

  try {
    const sample = "Had a productive day working on web applications and enjoying fitness.";
    const result = await analyzeWithAI(sample);

    if (result && result.topics) {
      saveAiConfig();
      const currentMod = aiConfig[selectedProvider + 'Model'] || '';
      updateAiStatus('ok', `✓ Success! Connected to ${selectedProvider} ${currentMod ? `(${currentMod})` : ''}`);
      updateAiBtnLabel();
    } else {
      updateAiStatus('error', 'Connected but got unexpected response format');
    }
  } catch(err) {
    updateAiStatus('error', `✗ ${err.message}`);
  }
}

function saveAiSettingsHandler() {
  const oSelect = byId('openaiModel');
  const oCustom = byId('openaiCustomModel');
  const oModel = (oSelect?.value === 'custom' ? oCustom?.value.trim() : oSelect?.value) || oCustom?.value.trim() || 'gpt-4o-mini';

  const ollamaSelect = byId('ollamaModelSelect');
  const ollamaCustom = byId('ollamaModel');
  const lModel = (ollamaSelect?.value === 'custom' ? ollamaCustom?.value.trim() : ollamaSelect?.value) || ollamaCustom?.value.trim() || 'llama3';

  const lcSelect = byId('llamacppModelSelect');
  const lcCustom = byId('llamacppModel');
  const lcModel  = lcCustom?.value.trim() || lcSelect?.value || 'ggml-org/gemma-4-E4B-it-GGUF:Q8_0';

  const sysPrompt = byId('aiSystemPrompt')?.value.trim() || DEFAULT_SYSTEM_PROMPT;

  aiConfig.provider      = selectedProvider;
  aiConfig.geminiKey     = byId('geminiKey')?.value.trim() || '';
  aiConfig.geminiModel   = byId('geminiModel')?.value || 'gemini-3.6-flash';
  aiConfig.openaiKey     = byId('openaiKey')?.value.trim() || '';
  aiConfig.openaiModel   = oModel;
  aiConfig.ollamaUrl     = byId('ollamaUrl')?.value.trim() || 'http://localhost:11434';
  aiConfig.ollamaModel   = lModel;
  aiConfig.llamacppUrl   = byId('llamacppUrl')?.value.trim() || 'http://localhost:9931';
  aiConfig.llamacppKey   = byId('llamacppKey')?.value.trim() || '';
  aiConfig.llamacppModel = lcModel;
  aiConfig.systemPrompt  = sysPrompt;

  saveAiConfig();
  updateAiStatus();
  updateAiBtnLabel();

  const modal = byId('aiSettingsModal');
  if (modal) modal.classList.add('hidden');
}

function updateAiBtnLabel() {
  const btn = byId('aiAnalyzeBtn');
  if (!btn) return;
  const lbl = btn.querySelector('.ai-btn-label');
  if (!lbl) return;
  const providerShort = { gemini:'Gemini', openai:'OpenAI', ollama:'Ollama', llamacpp:'llama.cpp', none:'' };
  const label = providerShort[aiConfig.provider] || '';
}

// ─── ENTRY CRUD & RENDER ──────────────────────────────────────────────────────
function createEntry() {
  const now = new Date();
  const entry = {
    id: uid(),
    title: '',
    content: '',
    mood: null,
    topics: [],
    subtopics: [],
    aiSummary: '',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    date: isoDate(now)
  };
  entries.unshift(entry);
  saveEntries();
  return entry;
}

function getEntry(id) { return entries.find(e => e.id === id); }
function deleteEntry(id) { entries = entries.filter(e => e.id !== id); saveEntries(); }

function updateCurrent() {
  const entry = getEntry(currentId);
  if (!entry) return;
  entry.title = byId('entryTitle')?.value.trim() || '';
  entry.content = byId('editorTextarea')?.value || '';
  entry.updatedAt = new Date().toISOString();
}

function renderTopicChips(topicsArr, container) {
  if (!container) return;
  if (!topicsArr || topicsArr.length === 0) {
    container.innerHTML = `<span style="font-size:.72rem;color:var(--text-muted);font-style:italic">No topics detected — click ✨ Analyze</span>`;
    return;
  }
  container.innerHTML = topicsArr.map(({ topic, tone }) => `
    <span class="topic-chip topic-${topic} tone-${tone}" data-topic="${topic}" title="Click to filter by ${topic} · ${tone}">
      <span class="chip-topic">${topic}</span>
      <span class="chip-tone">${tone}</span>
    </span>
  `).join('');

  container.querySelectorAll('.topic-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const topic = chip.dataset.topic;
      if (activeTopicFilter === topic) {
        activeTopicFilter = null;
        byId('clearTopicFilter')?.classList.add('hidden');
      } else {
        activeTopicFilter = topic;
        byId('clearTopicFilter')?.classList.remove('hidden');
      }
      renderSidebarTopicFilters();
      renderEntriesList();
    });
  });
}

function renderSubtopicTags(subtopicsArr, container) {
  if (!container) return;
  if (!subtopicsArr || subtopicsArr.length === 0) {
    container.innerHTML = `<span style="font-size:.7rem;color:var(--text-muted);font-style:italic">—</span>`;
    return;
  }
  container.innerHTML = subtopicsArr.map(tag => {
    const clean = tag.replace(/[^a-z0-9\-]/gi, '').toLowerCase();
    return `<span class="subtopic-tag" data-tag="${clean}" title="Click to search #${clean}">#${clean}</span>`;
  }).join('');

  container.querySelectorAll('.subtopic-tag').forEach(tagEl => {
    tagEl.addEventListener('click', () => {
      const searchInput = byId('searchInput');
      if (searchInput) {
        searchInput.value = tagEl.dataset.tag;
        searchQuery = tagEl.dataset.tag;
        renderEntriesList();
      }
    });
  });
}

function renderSidebarTopicFilters() {
  const container = byId('topicFilterBar');
  if (!container) return;

  const topicCount = {};
  entries.forEach(e => {
    (e.topics || []).forEach(t => {
      topicCount[t.topic] = (topicCount[t.topic] || 0) + 1;
    });
  });

  const sorted = Object.entries(topicCount).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) { container.innerHTML = ''; return; }

  container.innerHTML = sorted.map(([topic, count]) => `
    <button class="topic-filter-chip${activeTopicFilter === topic ? ' active' : ''}" data-topic="${topic}">
      ${topic} <span style="opacity:.5">${count}</span>
    </button>
  `).join('');

  container.querySelectorAll('.topic-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.topic;
      if (activeTopicFilter === t) {
        activeTopicFilter = null;
        byId('clearTopicFilter')?.classList.add('hidden');
      } else {
        activeTopicFilter = t;
        byId('clearTopicFilter')?.classList.remove('hidden');
      }
      renderSidebarTopicFilters();
      renderEntriesList();
    });
  });
}

// ─── LIVING LIFE PILLARS KNOWLEDGE STORE ─────────────────────────────────────
const PILLARS_KEY = 'journal_ai_pillars_v1';
const DEFAULT_PILLARS = [
  {
    id: 'career',
    name: 'Career & Job Search',
    icon: '💼',
    isDefault: true,
    realizations: [
      { id: 'c1', text: 'Preparation beats anxiety: Practicing system design mock interviews weekly dramatically increases confidence.', date: '2026-08-20', quote: 'Felt way more prepared after the mock interview.' }
    ],
    solutions: [
      { id: 'cs1', text: 'Set a dedicated 90-minute morning deep work block specifically for portfolio projects and outreach.', date: '2026-08-22', quote: 'Morning deep work was uninterrupted.' }
    ],
    manualNotes: '### Core Career Principles\n- Focus on high-leverage skills (distributed systems, agentic architectures).\n- Treat interview preparation as an active daily workout.'
  },
  {
    id: 'gym',
    name: 'Gym & Fitness Consistency',
    icon: '🏋️',
    isDefault: true,
    realizations: [
      { id: 'g1', text: 'Consistency outperforms intensity: Showing up 4 times a week steadily compounds far more than burning out.', date: '2026-08-21', quote: 'Felt energized without pushing into injury.' }
    ],
    solutions: [
      { id: 'gs1', text: 'Pack gym bag and lay out workout clothes the night before to eliminate morning friction.', date: '2026-08-23', quote: 'Zero morning friction when bag was ready.' }
    ],
    manualNotes: '### Fitness Systems & Rules\n- 4 gym sessions weekly: Push, Pull, Legs, Upper.\n- 8 hours of sleep is non-negotiable for recovery.'
  },
  {
    id: 'dreams',
    name: 'Dreams & Big Ambitions',
    icon: '🚀',
    isDefault: true,
    realizations: [
      { id: 'd1', text: 'Building in public creates momentum and accountability that private ideation cannot match.', date: '2026-08-22', quote: 'Sharing updates kept me motivated.' }
    ],
    solutions: [
      { id: 'ds1', text: 'Ship a small working MVP before optimizing or adding complex secondary features.', date: '2026-08-24', quote: 'Focusing on the core feature shipped the app in 2 days.' }
    ],
    manualNotes: '### Ambition Roadmap\n- Build high-utility AI tools that empower daily mindful living.\n- Prioritize craftsmanship, privacy-first design, and speed.'
  },
  {
    id: 'relationships',
    name: 'Meaningful Relationships',
    icon: '🤝',
    isDefault: true,
    realizations: [
      { id: 'r1', text: 'Active listening without giving unsolicited advice builds the deepest mutual trust.', date: '2026-08-19', quote: 'She appreciated me just listening.' }
    ],
    solutions: [
      { id: 'rs1', text: 'Schedule a recurring weekly call with close friends and family to stay connected.', date: '2026-08-21', quote: 'Great Sunday catch-up call.' }
    ],
    manualNotes: '### Relationship Standards\n- Be fully present: No phones during dinner or quality conversations.\n- Express gratitude and appreciation openly and often.'
  }
];

let lifePillars = [];
let activePillarId = 'career';
let currentPRSuggestions = [];

function loadLifePillars() {
  try {
    const raw = localStorage.getItem(PILLARS_KEY);
    if (raw) {
      lifePillars = JSON.parse(raw);
    } else {
      lifePillars = DEFAULT_PILLARS;
      saveLifePillars();
    }
  } catch(e) {
    lifePillars = DEFAULT_PILLARS;
  }
}

function saveLifePillars() {
  try {
    localStorage.setItem(PILLARS_KEY, JSON.stringify(lifePillars));
  } catch(e) {}
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let activeLens = 'todos';
let activeAnalysisMarkdown = '';

function openAnalysisView(lens = 'todos') {
  const entry = getEntry(currentId);
  if (!entry || !entry.content.trim()) {
    alert('Please write something in your journal entry before running AI analysis.');
    return;
  }

  activeLens = lens;

  // Clean the main writing UI so there is no clutter
  const editorContainer = byId('editorContainer');
  const entryMeta = byId('entryMeta');
  const mdToolbar = byId('mdToolbar');
  const goalTrack = byId('editorGoalTrack');
  const analysisView = byId('analysisView');

  if (editorContainer) editorContainer.classList.add('hidden');
  if (entryMeta) entryMeta.classList.add('hidden');
  if (mdToolbar) mdToolbar.classList.add('hidden');
  if (goalTrack) goalTrack.classList.add('hidden');
  if (analysisView) analysisView.classList.remove('hidden');

  // Update header info
  const entryTag = byId('analysisEntryTag');
  if (entryTag) {
    entryTag.textContent = entry.title || formatShortDate(entry.createdAt) || 'Journal Insights';
  }

  const providerBadge = byId('analysisProviderBadge');
  if (providerBadge) {
    const pNames = { gemini: 'Gemini', openai: 'OpenAI', ollama: 'Ollama', llamacpp: 'llama.cpp', none: 'Offline' };
    const pModel = aiConfig[aiConfig.provider + 'Model'] || '';
    providerBadge.textContent = `${pNames[aiConfig.provider] || 'AI'} ${pModel ? `(${pModel})` : ''}`;
  }

  // Update lens dropdown value
  const select = byId('analysisLensSelect');
  if (select) select.value = activeLens;

  syncLensPromptEditor(activeLens);

  // Check if we already have saved analysis for this lens on this entry
  const saved = entry.analysis && entry.analysis[activeLens];
  if (saved) {
    activeAnalysisMarkdown = typeof saved === 'string' ? saved : JSON.stringify(saved);
    if (activeLens === 'pillarSuggestions') {
      try {
        const data = typeof saved === 'string' ? JSON.parse(saved) : saved;
        renderPRReviewCards(data);
      } catch(e) {
        renderAnalysisOutput(typeof saved === 'string' ? saved : '');
      }
    } else {
      renderAnalysisOutput(activeAnalysisMarkdown);
    }
  } else {
    // Show prompt ready to run
    const card = byId('analysisOutputCard');
    if (card) {
      card.innerHTML = `
        <div class="analysis-placeholder">
          <div style="font-size:1.8rem;margin-bottom:8px">${ANALYSIS_LENSES[activeLens]?.icon || '✨'}</div>
          <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">${ANALYSIS_LENSES[activeLens]?.title || 'Ready for Analysis'}</div>
          <div>Click <strong>"Generate"</strong> above to extract insights for this entry.</div>
        </div>
      `;
    }
  }
}

function closeAnalysisView() {
  const analysisView = byId('analysisView');
  const editorContainer = byId('editorContainer');
  const entryMeta = byId('entryMeta');
  const mdToolbar = byId('mdToolbar');
  const goalTrack = byId('editorGoalTrack');

  if (analysisView) analysisView.classList.add('hidden');
  if (editorContainer) editorContainer.classList.remove('hidden');
  if (entryMeta) entryMeta.classList.remove('hidden');
  if (mdToolbar) mdToolbar.classList.remove('hidden');
  if (goalTrack) goalTrack.classList.remove('hidden');

  byId('editorTextarea')?.focus();
}

async function runLensAnalysis(lensKey, customPromptText = '') {
  const entry = getEntry(currentId);
  if (!entry) return;

  const card = byId('analysisOutputCard');
  if (card) {
    card.innerHTML = `
      <div class="analysis-loading-wrap">
        <div class="analysis-spinner"></div>
        <div>Generating ${ANALYSIS_LENSES[lensKey]?.name || 'insights'}...</div>
      </div>
    `;
  }

  const lens = ANALYSIS_LENSES[lensKey] || ANALYSIS_LENSES.todos;
  const promptInstruction = customPromptText || lens.prompt;

  try {
    const generated = await generateTextWithAI(promptInstruction, entry.content);

    if (lensKey === 'pillarSuggestions') {
      try {
        const jsonMatch = generated.match(/\{[\s\S]*\}/);
        const data = JSON.parse(jsonMatch ? jsonMatch[0] : generated);
        currentPRSuggestions = data.suggestions || [];
        renderPRReviewCards(data);

        // Cache with entry
        if (!entry.analysis) entry.analysis = {};
        entry.analysis[lensKey] = data;
        activeAnalysisMarkdown = formatPRSuggestionsAsMarkdown(data.suggestions || []);
        saveEntries();
        return;
      } catch(parseErr) {
        // Fallback to markdown rendering
        activeAnalysisMarkdown = generated;
        renderAnalysisOutput(generated);
      }
    } else {
      activeAnalysisMarkdown = generated;
      renderAnalysisOutput(generated);
    }

    // Cache with entry
    if (!entry.analysis) entry.analysis = {};
    entry.analysis[lensKey] = generated;
    saveEntries();

    // Also run topic extractor in background to keep sidebar chips fresh
    if (lensKey === 'topics' || !entry.topics || entry.topics.length === 0) {
      triggerBackgroundTopicExtraction(entry);
    }
  } catch(err) {
    if (card) {
      card.innerHTML = `
        <div style="padding:40px 20px;text-align:center;color:#f87171">
          <div style="font-size:1.5rem;margin-bottom:8px">⚠️ Analysis Error</div>
          <div>${err.message}</div>
          <button class="btn-pill" id="retryAnalysisBtn" style="margin-top:16px">Try Again</button>
        </div>
      `;
      byId('retryAnalysisBtn')?.addEventListener('click', () => runLensAnalysis(lensKey, customPromptText));
    }
  }
}

function buildPillarFileDiffLines(pillar, additionText, targetSection, entryDate) {
  const pName = pillar.name || 'Life Pillar';
  const pIcon = pillar.icon || '📌';
  const filename = `${pName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  
  const lines = [];
  let ln = 1;

  lines.push({ ln: ln++, type: 'heading', sign: ' ', text: `# ${pIcon} ${pName}` });
  lines.push({ ln: ln++, type: 'ctx', sign: ' ', text: `` });

  // Section 1: Realizations
  const isRealization = targetSection === 'realizations' || targetSection === 'realization';
  lines.push({ ln: ln++, type: 'heading', sign: ' ', text: `## 💡 Profound Realizations` });
  
  if (isRealization && additionText) {
    lines.push({ ln: ln++, type: 'added', sign: '+', text: `- **${entryDate}**: "${additionText}"` });
  }

  const rList = pillar.realizations || [];
  if (rList.length === 0 && !isRealization) {
    lines.push({ ln: ln++, type: 'ctx', sign: ' ', text: `  (No realizations recorded yet)` });
  } else {
    rList.forEach(r => {
      lines.push({ ln: ln++, type: 'ctx', sign: ' ', text: `- **${r.date || 'Past'}**: ${r.text}` });
    });
  }
  lines.push({ ln: ln++, type: 'ctx', sign: ' ', text: `` });

  // Section 2: Solutions
  const isSolution = targetSection === 'solutions' || targetSection === 'solution';
  lines.push({ ln: ln++, type: 'heading', sign: ' ', text: `## 🛠️ Working Solutions & Systems` });
  
  if (isSolution && additionText) {
    lines.push({ ln: ln++, type: 'added', sign: '+', text: `- **${entryDate}**: "${additionText}"` });
  }

  const sList = pillar.solutions || [];
  if (sList.length === 0 && !isSolution) {
    lines.push({ ln: ln++, type: 'ctx', sign: ' ', text: `  (No solutions recorded yet)` });
  } else {
    sList.forEach(s => {
      lines.push({ ln: ln++, type: 'ctx', sign: ' ', text: `- **${s.date || 'Past'}**: ${s.text}` });
    });
  }
  lines.push({ ln: ln++, type: 'ctx', sign: ' ', text: `` });

  // Section 3: Principles Manual
  const isManual = targetSection === 'manual';
  lines.push({ ln: ln++, type: 'heading', sign: ' ', text: `## 📖 Living Principles Manual` });
  if (isManual && additionText) {
    lines.push({ ln: ln++, type: 'added', sign: '+', text: `- "${additionText}"` });
  }
  if (pillar.manualNotes && pillar.manualNotes.trim()) {
    pillar.manualNotes.split('\n').forEach(l => {
      lines.push({ ln: ln++, type: 'ctx', sign: ' ', text: l });
    });
  } else if (!isManual) {
    lines.push({ ln: ln++, type: 'ctx', sign: ' ', text: `  (Write manual principles in editor)` });
  }

  return { filename, lines };
}

function renderDiffTableHTML(filename, diffLines) {
  return `
    <div class="pr-diff-file-header">
      <div class="pr-diff-file-title">
        <span>📄</span>
        <span>${escapeHtml(filename)}</span>
      </div>
      <span class="pr-diff-stat-badge">+1 addition</span>
    </div>
    <div class="pr-diff-file-body">
      ${diffLines.map(row => `
        <div class="pr-diff-row ${row.type}">
          <span class="pr-diff-ln">${row.ln}</span>
          <span class="pr-diff-sign">${row.sign}</span>
          <span class="pr-diff-text">${escapeHtml(row.text)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPRReviewCards(data) {
  const card = byId('analysisOutputCard');
  if (!card) return;

  const suggestions = data.suggestions || [];
  currentPRSuggestions = suggestions;

  if (suggestions.length === 0) {
    card.innerHTML = `
      <div class="analysis-placeholder">
        <div style="font-size:1.8rem;margin-bottom:8px">🌟</div>
        <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">No New Life Pillar Suggestions</div>
        <div>Keep writing about your career, fitness, goals, or relationships to discover new realizations and working solutions.</div>
      </div>
    `;
    return;
  }

  const entry = getEntry(currentId);
  const entryDate = entry ? (entry.date || isoDate(new Date(entry.createdAt))) : isoDate();

  card.innerHTML = `
    <div class="pr-review-wrap">
      <div class="pr-review-intro">
        <strong>Pull Request Review</strong>: Found ${suggestions.length} verbatim quote${suggestions.length > 1 ? 's' : ''} from your entry. Review the full file diff and select which Life Pillar &amp; Section to merge them into.
      </div>
      ${suggestions.map((s, idx) => {
        const quotedText = s.quotedText || s.quote || s.text || '';
        const targetPillarId = (s.pillarId || '').toLowerCase().trim();
        const initialPillar = lifePillars.find(p => p.id === targetPillarId || p.name.toLowerCase().includes(targetPillarId)) || lifePillars[0];
        const initialSection = s.section || (s.type === 'solution' ? 'solutions' : 'realizations');

        const { filename, lines } = buildPillarFileDiffLines(initialPillar, quotedText, initialSection, entryDate);

        return `
          <div class="pr-diff-card" id="prCard_${idx}" data-index="${idx}">
            <div class="pr-diff-header">
              <div class="pr-diff-controls">
                <label style="font-size:0.72rem;color:var(--text-secondary)">Target Pillar:</label>
                <select class="pr-select-input pr-pillar-select" data-idx="${idx}">
                  ${lifePillars.map(p => `
                    <option value="${p.id}" ${p.id === initialPillar.id ? 'selected' : ''}>${p.icon || '📌'} ${escapeHtml(p.name)}</option>
                  `).join('')}
                </select>

                <label style="font-size:0.72rem;color:var(--text-secondary)">Section:</label>
                <select class="pr-select-input pr-section-select" data-idx="${idx}">
                  <option value="realizations" ${initialSection === 'realizations' ? 'selected' : ''}>💡 Profound Realizations</option>
                  <option value="solutions" ${initialSection === 'solutions' ? 'selected' : ''}>🛠️ Working Solutions</option>
                  <option value="manual" ${initialSection === 'manual' ? 'selected' : ''}>📖 Principles Manual</option>
                </select>
              </div>
              <span style="font-size:0.7rem;color:var(--text-muted)">#pr-${idx + 1}</span>
            </div>

            <!-- Full File Diff View -->
            <div id="prDiffContainer_${idx}">
              ${renderDiffTableHTML(filename, lines)}
            </div>

            ${s.context ? `<div class="pr-context-quote">💡 <em>Context: ${escapeHtml(s.context)}</em></div>` : ''}

            <div class="pr-actions-row">
              <button class="pr-btn-discard" data-idx="${idx}">✗ Discard</button>
              <button class="pr-btn-merge" id="prMergeBtn_${idx}" data-idx="${idx}">✓ Accept &amp; Merge into ${escapeHtml(initialPillar.name)}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Attach dynamic dropdown change listeners to update the full-file diff live
  card.querySelectorAll('.pr-pillar-select, .pr-section-select').forEach(select => {
    select.addEventListener('change', e => {
      const idx = parseInt(select.dataset.idx, 10);
      updatePRCardDiff(idx);
    });
  });

  // Attach event listeners to merge & discard buttons
  card.querySelectorAll('.pr-btn-merge').forEach(btn => {
    btn.addEventListener('click', () => acceptPRSuggestion(parseInt(btn.dataset.idx, 10)));
  });
  card.querySelectorAll('.pr-btn-discard').forEach(btn => {
    btn.addEventListener('click', () => discardPRSuggestion(parseInt(btn.dataset.idx, 10)));
  });
}

function updatePRCardDiff(idx) {
  const cardEl = byId(`prCard_${idx}`);
  if (!cardEl) return;

  const pillarSelect = cardEl.querySelector('.pr-pillar-select');
  const sectionSelect = cardEl.querySelector('.pr-section-select');
  const diffContainer = byId(`prDiffContainer_${idx}`);
  const mergeBtn = byId(`prMergeBtn_${idx}`);

  const item = currentPRSuggestions[idx];
  if (!item || !pillarSelect || !sectionSelect || !diffContainer) return;

  const pillarId = pillarSelect.value;
  const section = sectionSelect.value;
  const pillar = lifePillars.find(p => p.id === pillarId) || lifePillars[0];

  const quotedText = item.quotedText || item.quote || item.text || '';
  const entry = getEntry(currentId);
  const entryDate = entry ? (entry.date || isoDate(new Date(entry.createdAt))) : isoDate();

  const { filename, lines } = buildPillarFileDiffLines(pillar, quotedText, section, entryDate);
  diffContainer.innerHTML = renderDiffTableHTML(filename, lines);

  if (mergeBtn) {
    mergeBtn.textContent = `✓ Accept & Merge into ${pillar.name}`;
  }
}

function acceptPRSuggestion(index) {
  const item = currentPRSuggestions[index];
  if (!item) return;

  const cardEl = byId(`prCard_${index}`);
  const pillarSelect = cardEl?.querySelector('.pr-pillar-select');
  const sectionSelect = cardEl?.querySelector('.pr-section-select');

  const targetId = pillarSelect ? pillarSelect.value : ((item.pillarId || '').toLowerCase().trim());
  const targetSection = sectionSelect ? sectionSelect.value : (item.section || (item.type === 'solution' ? 'solutions' : 'realizations'));

  let pillar = lifePillars.find(p => p.id === targetId || p.name.toLowerCase().includes(targetId)) || lifePillars[0];

  const entry = getEntry(currentId);
  const entryDate = entry ? (entry.date || isoDate(new Date(entry.createdAt))) : isoDate();
  const quotedText = item.quotedText || item.quote || item.text || '';

  const newEntry = {
    id: uid(),
    text: quotedText,
    date: entryDate,
    quote: quotedText,
    entryId: currentId,
    type: targetSection
  };

  if (targetSection === 'solutions' || targetSection === 'solution') {
    if (!pillar.solutions) pillar.solutions = [];
    pillar.solutions.unshift(newEntry);
  } else if (targetSection === 'manual') {
    pillar.manualNotes = (pillar.manualNotes ? pillar.manualNotes.trim() + '\n' : '') + `- **${entryDate}**: "${quotedText}"`;
  } else {
    if (!pillar.realizations) pillar.realizations = [];
    pillar.realizations.unshift(newEntry);
  }

  saveLifePillars();

  if (cardEl) {
    cardEl.classList.add('merged');
    const actionsRow = cardEl.querySelector('.pr-actions-row');
    if (actionsRow) {
      const sectionLabel = targetSection === 'solutions' ? 'Working Solutions' : (targetSection === 'manual' ? 'Principles Manual' : 'Realizations');
      actionsRow.innerHTML = `<span class="pr-merged-badge">✓ Merged into ${escapeHtml(pillar.name)} → ${sectionLabel}</span>`;
    }
  }
}

function discardPRSuggestion(index) {
  const cardEl = byId(`prCard_${index}`);
  if (cardEl) {
    cardEl.classList.add('dismissed');
    setTimeout(() => cardEl.remove(), 300);
  }
}

function formatPRSuggestionsAsMarkdown(suggestions) {
  if (!suggestions.length) return '';
  return `### Life Pillar Insights\n` + suggestions.map(s => `
- **${s.pillarName || s.pillarId}** (${s.type === 'solution' ? 'Working Solution' : 'Realization'}): ${s.text}
  ${s.quote ? `> "${s.quote}"` : ''}
  `).join('\n');
}

// ─── LIFE PILLARS KNOWLEDGE HUB VIEW & EDIT ──────────────────────────────────
function openLifePillarsModal() {
  loadLifePillars();
  const modal = byId('pillarsModal');
  if (!modal) return;

  renderPillarsNav();
  renderPillarDetail(activePillarId || (lifePillars[0] && lifePillars[0].id) || 'career');
  modal.classList.remove('hidden');
}

function renderPillarsNav() {
  const nav = byId('pillarsNav');
  if (!nav) return;

  nav.innerHTML = lifePillars.map(p => {
    const totalCount = (p.realizations?.length || 0) + (p.solutions?.length || 0);
    return `
      <button class="pillar-tab-btn ${p.id === activePillarId ? 'active' : ''}" data-id="${p.id}">
        <span>${p.icon || '📌'}</span>
        <div style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(p.name)}</div>
        <span style="font-size:.65rem;opacity:.5">${totalCount}</span>
      </button>
    `;
  }).join('');

  nav.querySelectorAll('.pillar-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activePillarId = btn.dataset.id;
      renderPillarsNav();
      renderPillarDetail(activePillarId);
    });
  });
}

function renderPillarDetail(pillarId) {
  activePillarId = pillarId;
  const pillar = lifePillars.find(p => p.id === pillarId) || lifePillars[0];
  if (!pillar) return;

  const iconEl   = byId('activePillarIcon');
  const nameEl   = byId('activePillarName');
  const metaEl   = byId('activePillarMeta');
  const delBtn   = byId('deletePillarBtn');
  const rendered = byId('pillarContentRendered');
  const editor   = byId('pillarContentEditor');
  const textarea = byId('pillarMarkdownTextarea');

  if (iconEl) iconEl.textContent = pillar.icon || '📌';
  if (nameEl) nameEl.textContent = pillar.name;
  if (metaEl) {
    const rCount = pillar.realizations?.length || 0;
    const sCount = pillar.solutions?.length || 0;
    metaEl.textContent = `${rCount} realization${rCount !== 1 ? 's' : ''} · ${sCount} solution${sCount !== 1 ? 's' : ''}`;
  }

  if (delBtn) {
    delBtn.classList.toggle('hidden', !!pillar.isDefault);
  }

  // Ensure viewer is shown and editor hidden
  if (rendered) rendered.classList.remove('hidden');
  if (editor) editor.classList.add('hidden');
  if (textarea) textarea.value = pillar.manualNotes || '';

  if (rendered) {
    const rList = pillar.realizations || [];
    const sList = pillar.solutions || [];

    let html = '';

    // Realizations Section
    html += `
      <div class="pillar-section-group">
        <div class="pillar-sec-title">💡 Profound Realizations (${rList.length})</div>
        ${rList.length === 0 ? `<div style="font-size:.78rem;color:var(--text-muted);font-style:italic">No realizations merged yet. Run Life Pillar Suggestions in the Analysis Hub to extract insights from your entries.</div>` : ''}
        ${rList.map(r => `
          <div class="pillar-item-card">
            <div>${escapeHtml(r.text)}</div>
            ${r.quote ? `<div style="font-size:.75rem;color:var(--text-muted);margin-top:4px;font-style:italic">"${escapeHtml(r.quote)}"</div>` : ''}
            <div class="item-meta">Recorded on ${escapeHtml(r.date || 'Past entry')}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Solutions Section
    html += `
      <div class="pillar-section-group" style="margin-top:16px">
        <div class="pillar-sec-title">🛠️ Working Solutions &amp; Systems (${sList.length})</div>
        ${sList.length === 0 ? `<div style="font-size:.78rem;color:var(--text-muted);font-style:italic">No solutions merged yet.</div>` : ''}
        ${sList.map(s => `
          <div class="pillar-item-card">
            <div>${escapeHtml(s.text)}</div>
            ${s.quote ? `<div style="font-size:.75rem;color:var(--text-muted);margin-top:4px;font-style:italic">"${escapeHtml(s.quote)}"</div>` : ''}
            <div class="item-meta">Recorded on ${escapeHtml(s.date || 'Past entry')}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Manual Notes / Principles Manual Section
    if (pillar.manualNotes && pillar.manualNotes.trim()) {
      html += `
        <div class="pillar-section-group" style="margin-top:16px">
          <div class="pillar-sec-title">📖 Living Principles Manual</div>
          <div style="background:rgba(255,255,255,0.02);padding:14px;border-radius:var(--radius-sm);border:1px solid var(--border)">
            ${renderMarkdown(pillar.manualNotes)}
          </div>
        </div>
      `;
    }

    rendered.innerHTML = html;
  }
}

function savePillarManualNotes() {
  const pillar = lifePillars.find(p => p.id === activePillarId);
  const textarea = byId('pillarMarkdownTextarea');
  if (!pillar || !textarea) return;

  pillar.manualNotes = textarea.value.trim();
  saveLifePillars();

  byId('pillarContentEditor')?.classList.add('hidden');
  byId('pillarContentRendered')?.classList.remove('hidden');
  renderPillarDetail(activePillarId);
}

function createNewPillar() {
  const name = prompt('Enter a name for your new Life Pillar (e.g. "Mindset & Mental Resilience", "Financial Mastery"):');
  if (!name || !name.trim()) return;

  const icon = prompt('Enter an emoji icon for this pillar:', '✨') || '✨';

  const newP = {
    id: uid(),
    name: name.trim(),
    icon: icon.trim(),
    isDefault: false,
    realizations: [],
    solutions: [],
    manualNotes: `### ${name.trim()} Principles\n- Write your core personal rules and standards here.`
  };

  lifePillars.push(newP);
  saveLifePillars();
  activePillarId = newP.id;
  renderPillarsNav();
  renderPillarDetail(activePillarId);
}

function deleteActivePillar() {
  const pillar = lifePillars.find(p => p.id === activePillarId);
  if (!pillar || pillar.isDefault) return;

  if (confirm(`Are you sure you want to delete the "${pillar.name}" pillar?`)) {
    lifePillars = lifePillars.filter(p => p.id !== activePillarId);
    saveLifePillars();
    activePillarId = lifePillars[0]?.id || 'career';
    renderPillarsNav();
    renderPillarDetail(activePillarId);
  }
}

function exportPillarMarkdown() {
  const pillar = lifePillars.find(p => p.id === activePillarId);
  if (!pillar) return;

  let md = `# ${pillar.icon || '📌'} ${pillar.name}\n\n`;
  md += `## 💡 Profound Realizations\n`;
  (pillar.realizations || []).forEach(r => {
    md += `- **${r.date}**: ${r.text}\n`;
    if (r.quote) md += `  > "${r.quote}"\n`;
  });

  md += `\n## 🛠️ Working Solutions & Systems\n`;
  (pillar.solutions || []).forEach(s => {
    md += `- **${s.date}**: ${s.text}\n`;
    if (s.quote) md += `  > "${s.quote}"\n`;
  });

  if (pillar.manualNotes) {
    md += `\n## 📖 Living Principles Manual\n\n${pillar.manualNotes}\n`;
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${pillar.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  a.click();
}

function renderAnalysisOutput(markdown) {
  const card = byId('analysisOutputCard');
  if (!card) return;
  if (!markdown) {
    card.innerHTML = `<div class="analysis-placeholder">Select an analysis lens above to generate insights.</div>`;
    return;
  }
  card.innerHTML = renderMarkdown(markdown);
}

function appendAnalysisToEntry() {
  const entry = getEntry(currentId);
  if (!entry || !activeAnalysisMarkdown) return;

  const lensTitle = ANALYSIS_LENSES[activeLens]?.title || 'AI Insights';
  const appendText = `\n\n---\n\n## ✦ ${lensTitle}\n\n${activeAnalysisMarkdown}\n`;

  const ta = byId('editorTextarea');
  if (ta) {
    ta.value = (ta.value || '').trim() + appendText;
    updateCurrent();
    saveEntries();
    updateStats(ta.value);
  }

  closeAnalysisView();
}

async function copyAnalysisToClipboard() {
  if (!activeAnalysisMarkdown) return;
  try {
    await navigator.clipboard.writeText(activeAnalysisMarkdown);
    const btn = byId('copyAnalysisBtn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = `✓ Copied!`;
      setTimeout(() => btn.innerHTML = orig, 2000);
    }
  } catch (e) {
    alert('Copied to clipboard');
  }
}

async function triggerBackgroundTopicExtraction(entry) {
  if (!entry || countWords(entry.content) < 3) return;
  try {
    let result = null;
    if (aiConfig.provider !== 'none') {
      result = await analyzeWithAI(entry.content);
    }
    if (result && Array.isArray(result.topics)) {
      entry.topics    = result.topics;
      entry.subtopics = Array.isArray(result.subtopics) ? result.subtopics : extractSubtopicsLocal(entry.content);
      entry.aiSummary = result.summary || '';
    } else {
      entry.topics    = detectTopicsLocal(entry.content);
      entry.subtopics = extractSubtopicsLocal(entry.content);
    }
    saveEntries();
    renderTopicChips(entry.topics, byId('entryTopics'));
    renderSubtopicTags(entry.subtopics, byId('entrySubtopics'));
    renderSidebarTopicFilters();
  } catch (e) {}
}

async function triggerAnalysis(showThinking = true) {
  const entry = getEntry(currentId);
  if (!entry || countWords(entry.content) < 3) {
    alert('Please write something in your entry before analyzing.');
    return;
  }
  openAnalysisView('todos');
}

// ─── TOPICS OVERVIEW MODAL ────────────────────────────────────────────────────
function openTopicsOverview() {
  const modal = byId('topicsModal');
  const body  = byId('topicsModalBody');
  if (!modal || !body) return;

  const topicMap = {};
  entries.forEach(e => {
    (e.topics || []).forEach(({ topic, tone }) => {
      if (!topicMap[topic]) topicMap[topic] = { tones: {}, total: 0 };
      topicMap[topic].tones[tone] = (topicMap[topic].tones[tone] || 0) + 1;
      topicMap[topic].total += 1;
    });
  });

  const sorted = Object.entries(topicMap).sort((a, b) => b[1].total - a[1].total);
  const maxCount = sorted[0]?.[1]?.total || 1;

  if (sorted.length === 0) {
    body.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted);font-size:.85rem">
      No topics detected yet. Write entries &amp; click <strong>✨ Analyze</strong> to get started.
    </div>`;
    modal.classList.remove('hidden');
    return;
  }

  let html = '';
  for (const [topic, data] of sorted) {
    const color = TOPIC_COLORS[topic] || TOPIC_COLORS.default;
    const pct   = Math.round((data.total / maxCount) * 100);
    const tones = Object.entries(data.tones).sort((a, b) => b[1] - a[1]);

    html += `
    <div class="topic-overview-row" style="margin-bottom:14px">
      <div class="topic-overview-label" style="display:flex;align-items:center;gap:8px;font-size:.82rem;font-weight:600;text-transform:capitalize">
        <span style="width:8px;height:8px;border-radius:50%;background:${color}"></span>
        ${topic}
        <span style="margin-left:auto;font-size:.7rem;color:var(--text-muted);font-weight:400">${data.total} entries</span>
      </div>
      <div style="height:3px;border-radius:99px;background:rgba(255,255,255,0.07);overflow:hidden;margin:4px 0 6px">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:99px"></div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${tones.map(([tone, cnt]) => `
          <span class="topic-chip topic-${topic} tone-${tone}" data-topic="${topic}">
            <span class="chip-topic">${topic}</span>
            <span class="chip-tone">${tone} ×${cnt}</span>
          </span>
        `).join('')}
      </div>
    </div>`;
  }

  // All Subtopics
  const allSubtopics = {};
  entries.forEach(e => (e.subtopics || []).forEach(s => {
    allSubtopics[s] = (allSubtopics[s] || 0) + 1;
  }));
  const topSubs = Object.entries(allSubtopics).sort((a,b) => b[1] - a[1]).slice(0, 18);
  if (topSubs.length > 0) {
    html += `<div style="border-top:1px solid var(--border);padding-top:16px;margin-top:14px">
      <div style="font-size:.68rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px"># Specific Subtopics</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${topSubs.map(([s, c]) => `<span class="subtopic-tag" data-tag="${s}" title="${c} entries">#${s}${c>1 ? ` <span style='opacity:.5'>${c}</span>` : ''}</span>`).join('')}
      </div>
    </div>`;
  }

  body.innerHTML = html;

  // Add click to filter from modal
  body.querySelectorAll('.topic-chip[data-topic]').forEach(chip => {
    chip.addEventListener('click', () => {
      activeTopicFilter = chip.dataset.topic;
      byId('clearTopicFilter')?.classList.remove('hidden');
      renderSidebarTopicFilters();
      renderEntriesList();
      modal.classList.add('hidden');
    });
  });

  body.querySelectorAll('.subtopic-tag[data-tag]').forEach(tagEl => {
    tagEl.addEventListener('click', () => {
      const searchInput = byId('searchInput');
      if (searchInput) {
        searchInput.value = tagEl.dataset.tag;
        searchQuery = tagEl.dataset.tag;
        renderEntriesList();
        modal.classList.add('hidden');
      }
    });
  });

  modal.classList.remove('hidden');
}

// ─── MARKDOWN RENDERER ────────────────────────────────────────────────────────
function renderMarkdown(md) {
  let html = (md || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^---+$/gm, '<hr>').replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\s*[-*]\s+\[ \]\s+(.+)$/gm, '<li style="list-style:none"><input type="checkbox" disabled> $1</li>')
    .replace(/^\s*[-*]\s+\[[xX]\]\s+(.+)$/gm, '<li style="list-style:none"><input type="checkbox" checked disabled> <del>$1</del></li>')
    .replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>').replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>')
    .split('\n').map(line => {
      if (/^<(h[1-6]|blockquote|hr|li)/.test(line.trim())) return line;
      if (line.trim() === '') return '<br>';
      return `<p>${line}</p>`;
    }).join('\n');
  return html.replace(/(<li.*<\/li>\n?)+/g, m => `<ul style="padding-left:${m.includes('type="checkbox"') ? '0' : '20px'}">${m}</ul>`);
}

// ─── UI LIST & CALENDAR RENDERING ─────────────────────────────────────────────
function renderEntriesList() {
  const container = byId('entriesList');
  if (!container) return;

  const q = searchQuery.toLowerCase();
  let filtered = entries.filter(e =>
    (!q || (e.title || '').toLowerCase().includes(q) || (e.content || '').toLowerCase().includes(q) || (e.subtopics || []).some(s => s.toLowerCase().includes(q))) &&
    (!activeTopicFilter || (e.topics || []).some(t => t.topic === activeTopicFilter))
  );

  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding:16px;text-align:center;font-size:.78rem;color:var(--text-muted)">No entries found</div>`;
    return;
  }

  filtered.forEach(entry => {
    const el = document.createElement('div');
    el.className = 'entry-item' + (entry.id === currentId ? ' active' : '');
    el.dataset.id = entry.id;

    const mood = entry.mood ? MOOD_EMOJIS[entry.mood] : '';
    const preview = plainText(entry.content).slice(0, 60) || 'Empty entry';
    const topicChips = (entry.topics || []).slice(0, 2).map(({ topic }) =>
      `<span style="font-size:.6rem;background:rgba(138,80,255,.15);border:1px solid rgba(138,80,255,.25);border-radius:99px;padding:1px 6px;color:#c8a8ff;margin-right:2px">${topic}</span>`
    ).join('');

    const subtagChips = (entry.subtopics || []).slice(0, 2).map(t =>
      `<span style="font-size:.58rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:4px;padding:1px 5px;color:var(--text-muted);margin-right:2px;font-family:var(--font-mono)">#${t}</span>`
    ).join('');

    el.innerHTML = `
      <div class="entry-item-title">${entry.title || 'Untitled'}</div>
      <div class="entry-item-meta">
        <span class="entry-item-mood">${mood}</span>
        <span>${formatShortDate(entry.createdAt)}</span>
        ${topicChips}
      </div>
      <div class="entry-item-preview">${preview}${preview.length >= 60 ? '…' : ''}</div>
      ${subtagChips ? `<div style="margin-top:3px">${subtagChips}</div>` : ''}
    `;

    el.addEventListener('click', () => loadEntry(entry.id));
    container.appendChild(el);
  });
}

function renderCalendar() {
  const calGrid = byId('calGrid');
  const calTitle = byId('calTitle');
  if (!calGrid || !calTitle) return;

  const year  = calViewDate.getFullYear();
  const month = calViewDate.getMonth();
  const today = new Date();

  calTitle.textContent = calViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const activeEntry = getEntry(currentId);
  const activeDate = activeEntry ? getEntryDate(activeEntry) : null;

  const entryDates = new Set(entries.map(e => getEntryDate(e)).filter(Boolean));
  const firstDay   = new Date(year, month, 1);
  const lastDay    = new Date(year, month + 1, 0);
  const startDow   = firstDay.getDay();

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  let html = dayNames.map(d => `<div class="cal-day-name">${d}</div>`).join('');

  for (let i = 0; i < startDow; i++) html += `<div class="cal-day empty"></div>`;

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    const isSelected = activeDate === dateStr;
    const has = entryDates.has(dateStr);
    const cls = ['cal-day', isToday ? 'today' : '', has ? 'has-entry' : '', isSelected ? 'selected' : ''].filter(Boolean).join(' ');
    html += `<div class="${cls}" data-date="${dateStr}" title="${has ? 'Click to open entry' : 'Click to write on this day'}">${d}</div>`;
  }

  calGrid.innerHTML = html;
  calGrid.querySelectorAll('.cal-day:not(.empty)').forEach(cell => {
    cell.addEventListener('click', () => {
      const dateStr = cell.dataset.date;
      const dayEntries = entries.filter(e => getEntryDate(e) === dateStr);
      if (dayEntries.length > 0) {
        loadEntry(dayEntries[0].id);
        const itemEl = document.querySelector(`.entry-item[data-id="${dayEntries[0].id}"]`);
        if (itemEl) itemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        const now = new Date();
        const [y, m, d] = dateStr.split('-').map(Number);
        const entryDateObj = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
        const newEntry = {
          id: uid(),
          title: '',
          content: '',
          mood: null,
          topics: [],
          subtopics: [],
          aiSummary: '',
          createdAt: entryDateObj.toISOString(),
          updatedAt: entryDateObj.toISOString(),
          date: dateStr
        };
        entries.unshift(newEntry);
        saveEntries();
        loadEntry(newEntry.id);
        byId('entryTitle')?.focus();
      }
    });
  });
}

function loadEntry(id) {
  if (currentId && currentId !== id) { updateCurrent(); saveEntries(); }
  currentId = id;

  const entry = getEntry(id);
  if (!entry) return;

  // Sync calendar view month to entry's month if needed
  const eDate = getEntryDate(entry);
  if (eDate) {
    const [ey, em] = eDate.split('-').map(Number);
    if (ey && em && (calViewDate.getFullYear() !== ey || calViewDate.getMonth() !== (em - 1))) {
      calViewDate = new Date(ey, em - 1, 1);
    }
  }

  if (byId('entryTitle'))     byId('entryTitle').value = entry.title || '';
  if (byId('editorTextarea')) byId('editorTextarea').value = entry.content || '';
  if (byId('entryDateDisplay')) byId('entryDateDisplay').textContent = formatDate(entry.createdAt);

  setMoodUI(entry.mood);
  updateStats(entry.content || '');
  renderTopicChips(entry.topics || [], byId('entryTopics'));
  renderSubtopicTags(entry.subtopics || [], byId('entrySubtopics'));
  renderEntriesList();
  renderCalendar();
  updateAllTimeStats();
  updateMoodTimeline();
  renderSidebarTopicFilters();

  const emptyState = byId('emptyState');
  if (emptyState) emptyState.classList.add('hidden');

  if (previewMode) renderPreview();
  savePrefs();
}

function setMoodUI(moodKey) {
  const emoji = moodKey ? MOOD_EMOJIS[moodKey] : '🫙';
  const label = moodKey ? MOOD_LABELS[moodKey] : 'Not set';

  if (byId('currentFeeling'))   byId('currentFeeling').textContent   = emoji;
  if (byId('entryMoodDisplay')) byId('entryMoodDisplay').textContent = moodKey ? `${emoji} ${label}` : '';
  if (byId('panelMoodEmoji'))   byId('panelMoodEmoji').textContent   = emoji;
  if (byId('panelMoodText'))    byId('panelMoodText').textContent    = label;

  document.querySelectorAll('.feel-opt').forEach(b => {
    b.classList.toggle('selected', b.dataset.feeling === moodKey);
  });
  if (byId('feelingLabelDisplay')) byId('feelingLabelDisplay').textContent = label;
}

function updateStats(content) {
  const wc = countWords(content);
  const chars = plainText(content).length;
  const uniq = getUniqueWords(content).size;
  const sents = countSentences(content);
  const rt = readTime(content);

  if (byId('statWords'))    byId('statWords').textContent    = `${wc.toLocaleString()} word${wc !== 1 ? 's' : ''}`;
  if (byId('statChars'))    byId('statChars').textContent    = `${chars.toLocaleString()} chars`;
  if (byId('statReadTime')) byId('statReadTime').textContent = `${rt} min read`;
  if (byId('statUnique'))   byId('statUnique').textContent   = `${uniq} unique`;

  if (byId('pnlWords'))     byId('pnlWords').textContent     = wc.toLocaleString();
  if (byId('pnlSentences')) byId('pnlSentences').textContent = sents.toLocaleString();
  if (byId('pnlUnique'))    byId('pnlUnique').textContent    = uniq.toLocaleString();
  if (byId('pnlReadTime'))  byId('pnlReadTime').textContent  = `${rt}m`;

  // ── Word Goal Milestones (750 -> 1400 -> 2100) ────────────────────────────
  let targetGoal = 750;
  let tierLabel  = 'Tier 1 · 750w';
  let isCongrats = false;

  if (wc < 750) {
    targetGoal = 750;
    tierLabel  = 'Tier 1 · 750w';
  } else if (wc < 1400) {
    targetGoal = 1400;
    tierLabel  = 'Tier 2 · 1,400w';
  } else if (wc < 2100) {
    targetGoal = 2100;
    tierLabel  = 'Tier 3 · 2,100w';
  } else {
    targetGoal = 2100;
    tierLabel  = '🎉 2,100w+ Masterpiece';
    isCongrats = true;
  }

  const percentVal = Math.min(100, Math.round((wc / targetGoal) * 100));
  const fillWidth  = `${percentVal}%`;

  const editorGoalFill = byId('editorGoalFill');
  const panelGoalFill  = byId('panelGoalFill');
  const goalBadge      = byId('statGoalBadge');
  const goalTierEl     = byId('goalMilestoneTier');
  const goalWordsEl    = byId('goalWordsCount');
  const goalPercentEl  = byId('goalPercent');
  const goalCongratsEl = byId('goalCongrats');

  if (editorGoalFill) {
    editorGoalFill.style.width = fillWidth;
    editorGoalFill.classList.toggle('goal-congrats-glow', isCongrats);
  }
  if (panelGoalFill) {
    panelGoalFill.style.width = fillWidth;
    panelGoalFill.classList.toggle('goal-congrats-glow', isCongrats);
  }
  if (goalBadge) {
    if (isCongrats) {
      goalBadge.textContent = `🎉 Congrats! 2,100+ words achieved!`;
      goalBadge.className = 'stat-goal-badge goal-achieved';
    } else {
      goalBadge.textContent = `🎯 ${wc.toLocaleString()} / ${targetGoal.toLocaleString()}w (${percentVal}%)`;
      goalBadge.className = 'stat-goal-badge';
    }
  }
  if (goalTierEl)    goalTierEl.textContent = tierLabel;
  if (goalWordsEl)   goalWordsEl.textContent = `${wc.toLocaleString()} / ${targetGoal.toLocaleString()} words`;
  if (goalPercentEl) goalPercentEl.textContent = isCongrats ? '100% ✨' : `${percentVal}%`;
  if (goalCongratsEl) {
    goalCongratsEl.classList.toggle('hidden', !isCongrats);
  }
}

function updateAllTimeStats() {
  const container = byId('allTimeStats');
  if (!container) return;

  const totalWords = entries.reduce((s, e) => s + countWords(e.content), 0);
  const allUnique = new Set();
  entries.forEach(e => getUniqueWords(e.content).forEach(w => allUnique.add(w)));

  const dates = [...new Set(entries.map(e => getEntryDate(e)).filter(Boolean))].sort().reverse();
  let streak = 0, check = isoDate();
  for (const date of dates) {
    if (date === check) {
      streak++;
      const [y, m, d] = check.split('-').map(Number);
      const prevDate = new Date(y, m - 1, d - 1);
      check = isoDate(prevDate);
    } else if (date < check) break;
  }

  container.innerHTML = `
    <div class="at-row"><span class="at-label">Total entries</span><span class="at-value">${entries.length}</span></div>
    <div class="at-row"><span class="at-label">Total words</span><span class="at-value">${totalWords.toLocaleString()}</span></div>
    <div class="at-row"><span class="at-label">Vocabulary</span><span class="at-value">${allUnique.size.toLocaleString()}</span></div>
    <div class="at-row"><span class="at-label">Writing streak</span><span class="at-value">${streak} day${streak !== 1 ? 's' : ''} 🔥</span></div>
  `;
}

function updateMoodTimeline() {
  const container = byId('moodTimeline');
  if (!container) return;

  const moodEntries = entries.filter(e => e.mood).slice(0, 10);
  if (moodEntries.length === 0) {
    container.innerHTML = `<span style="font-size:.78rem;color:var(--text-muted)">No moods recorded yet</span>`;
    return;
  }

  container.innerHTML = moodEntries.map(e => `
    <div class="timeline-item" data-id="${e.id}">
      <span>${MOOD_EMOJIS[e.mood]}</span>
      <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px">${e.title || 'Untitled'}</span>
      <span style="margin-left:auto;opacity:.5">${formatShortDate(e.createdAt)}</span>
    </div>
  `).join('');

  container.querySelectorAll('.timeline-item').forEach(item => {
    item.addEventListener('click', () => loadEntry(item.dataset.id));
  });
}

function renderPreview() {
  const pane = byId('previewPane');
  const ta   = byId('editorTextarea');
  if (pane && ta) pane.innerHTML = renderMarkdown(ta.value);
}

function togglePreview() {
  previewMode = !previewMode;
  const ta   = byId('editorTextarea');
  const pane = byId('previewPane');
  const btn  = byId('previewToggle');

  if (previewMode) {
    renderPreview();
    if (ta)   ta.classList.add('hidden');
    if (pane) pane.classList.remove('hidden');
    if (btn)  { btn.classList.add('preview-active'); btn.textContent = '✏ Edit'; }
  } else {
    if (ta)   ta.classList.remove('hidden');
    if (pane) pane.classList.add('hidden');
    if (btn)  { btn.classList.remove('preview-active'); btn.textContent = '👁 Preview'; }
    if (ta)   ta.focus();
  }
}

function applyMarkdown(cmd) {
  const ta = byId('editorTextarea');
  if (!ta) return;

  const s = ta.selectionStart, e = ta.selectionEnd;
  const sel = ta.value.slice(s, e);
  let prefix = '', suffix = '', newLine = false;

  switch(cmd) {
    case 'bold':   prefix = '**'; suffix = '**'; break;
    case 'italic': prefix = '_';  suffix = '_';  break;
    case 'h1':     prefix = '# '; newLine = true; break;
    case 'h2':     prefix = '## '; newLine = true; break;
    case 'h3':     prefix = '### '; newLine = true; break;
    case 'ul':     prefix = '- '; newLine = true; break;
    case 'ol':     prefix = '1. '; newLine = true; break;
    case 'quote':  prefix = '> '; newLine = true; break;
    case 'code':   prefix = '`'; suffix = '`'; break;
    case 'hr':     prefix = '\n---\n'; newLine = true; break;
  }

  const inserted = newLine ? prefix + (sel || 'text') : prefix + (sel || 'text') + suffix;
  ta.setRangeText(inserted, s, e, 'select');
  ta.focus();
  onEditorInput();
}

function exportMarkdown() {
  const entry = getEntry(currentId);
  if (!entry) return;

  updateCurrent(); saveEntries();
  const wc = countWords(entry.content);
  const uniq = getUniqueWords(entry.content).size;
  const topicsLine = (entry.topics || []).map(t => `${t.topic}-${t.tone}`).join(', ') || 'none';
  const subtopicLine = (entry.subtopics || []).join(', ') || 'none';

  const fileText = `---
title: "${entry.title || 'Untitled'}"
date: ${entry.createdAt}
mood: ${entry.mood || 'none'}
topics: ${topicsLine}
subtopics: ${subtopicLine}
words: ${wc}
unique_words: ${uniq}
---

# ${entry.title || 'Untitled'}

*${formatDate(entry.createdAt)}*${entry.mood ? `  \n**Mood:** ${MOOD_EMOJIS[entry.mood]} ${MOOD_LABELS[entry.mood]}` : ''}

---

${entry.content}

---
*Exported from Folio · ${wc} words*
`;

  const blob = new Blob([fileText], { type: 'text/markdown;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `${(entry.title || 'entry').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${entry.date}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function setFont(key, save = true) {
  currentFont = key;
  const ta = byId('editorTextarea');
  if (ta) {
    ta.classList.remove('font-inter', 'font-mono');
    if (key === 'inter') ta.classList.add('font-inter');
    if (key === 'mono')  ta.classList.add('font-mono');
  }
  document.querySelectorAll('.btn-pill[data-font]').forEach(b => {
    b.classList.toggle('active', b.dataset.font === key);
  });
  if (save) savePrefs();
}

function onEditorInput() {
  const ta = byId('editorTextarea');
  if (!ta) return;

  const content = ta.value;
  updateStats(content);
  if (previewMode) renderPreview();

  const ind = byId('saveIndicator');
  if (ind) { ind.className = 'status-saved saving'; ind.textContent = '● Saving...'; }

  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    updateCurrent(); saveEntries(); renderEntriesList();
    if (ind) { ind.className = 'status-saved saved'; ind.textContent = '✓ Saved'; setTimeout(() => { ind.textContent = 'Saved'; }, 1500); }
  }, 500);
}

function toggleSidebar() {
  byId('appShell')?.classList.toggle('sidebar-hidden');
}

function onNewEntry() {
  if (currentId) { updateCurrent(); saveEntries(); }
  if (previewMode) togglePreview(); // exit preview mode

  const entry = createEntry();
  loadEntry(entry.id);
  byId('entryTitle')?.focus();
}

function onDeleteConfirm() {
  if (!currentId) return;
  deleteEntry(currentId);
  currentId = null;
  if (entries.length > 0) loadEntry(entries[0].id);
  else {
    if (byId('entryTitle'))     byId('entryTitle').value = '';
    if (byId('editorTextarea')) byId('editorTextarea').value = '';
    byId('emptyState')?.classList.remove('hidden');
    renderEntriesList(); renderCalendar(); updateAllTimeStats(); updateMoodTimeline();
  }
  byId('deleteModal')?.classList.add('hidden');
}

// ─── INIT APPLICATION ─────────────────────────────────────────────────────────
function init() {
  loadEntries();
  loadPrefs();
  loadAiConfig();

  // Create Welcome entry if empty
  if (entries.length === 0) {
    const welcome = createEntry();
    welcome.title = 'Welcome to Folio 📖';
    welcome.content = `# Welcome to Folio

*A beautiful place for your thoughts.*

---

Folio is your personal, private journaling space. Everything saves automatically to your browser's local storage, and you can export any entry as a **.md** (Markdown) file anytime.

## Features

- **Write freely** — clean typography, Markdown support
- **Set a mood** — track feelings for every entry
- **Analyze topics** — click ✨ Analyze to auto-detect themes & granular subtopics (#girlfriend-problems, #building-ai-app)
- **Connect AI** — easily connect Gemini, OpenAI, or Ollama in AI Settings ⚙
- **Export** — download entries as clean Markdown files

---
*Happy journaling!* ✨`;
    welcome.mood = 'inspired';
    welcome.topics = [{ topic: 'creativity', tone: 'inspired' }, { topic: 'growth', tone: 'hopeful' }];
    welcome.subtopics = ['welcome-to-folio', 'getting-started'];
    saveEntries();
    currentId = welcome.id;
  }

  const startEntry = (currentId ? getEntry(currentId) : null) || entries[0];
  if (startEntry) loadEntry(startEntry.id);
  else byId('emptyState')?.classList.remove('hidden');

  renderCalendar();
  updateAllTimeStats();
  updateMoodTimeline();
  renderSidebarTopicFilters();

  // Bind Button Handlers cleanly
  byId('newEntryBtn')?.addEventListener('click', onNewEntry);
  byId('emptyNewBtn')?.addEventListener('click', onNewEntry);
  byId('sidebarToggle')?.addEventListener('click', toggleSidebar);

  byId('searchInput')?.addEventListener('input', e => {
    searchQuery = e.target.value;
    renderEntriesList();
  });

  byId('calPrev')?.addEventListener('click', () => { calViewDate.setMonth(calViewDate.getMonth() - 1); renderCalendar(); });
  byId('calNext')?.addEventListener('click', () => { calViewDate.setMonth(calViewDate.getMonth() + 1); renderCalendar(); });

  byId('editorTextarea')?.addEventListener('input', onEditorInput);
  byId('entryTitle')?.addEventListener('input', () => {
    const ind = byId('saveIndicator');
    if (ind) { ind.className = 'status-saved saving'; ind.textContent = '● Saving...'; }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      updateCurrent(); saveEntries(); renderEntriesList();
      if (ind) { ind.className = 'status-saved saved'; ind.textContent = '✓ Saved'; setTimeout(() => { ind.textContent = 'Saved'; }, 1500); }
    }, 500);
  });

  document.querySelectorAll('.md-tool[data-cmd]').forEach(btn => {
    btn.addEventListener('click', () => applyMarkdown(btn.dataset.cmd));
  });

  byId('previewToggle')?.addEventListener('click', togglePreview);

  // Mood picker
  const feelingBtn = byId('feelingBtn');
  const feelingPicker = byId('feelingPicker');
  feelingBtn?.addEventListener('click', e => {
    e.stopPropagation();
    feelingPicker?.classList.toggle('hidden');
  });

  document.querySelectorAll('.feel-opt').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      const lbl = byId('feelingLabelDisplay');
      if (lbl) lbl.textContent = btn.title;
    });
    btn.addEventListener('mouseleave', () => {
      const entry = getEntry(currentId);
      const lbl = byId('feelingLabelDisplay');
      if (lbl) lbl.textContent = entry?.mood ? MOOD_LABELS[entry.mood] : 'Select a mood';
    });
    btn.addEventListener('click', () => {
      const moodKey = btn.dataset.feeling;
      const entry = getEntry(currentId);
      if (entry) { entry.mood = moodKey; saveEntries(); }
      setMoodUI(moodKey);
      updateMoodTimeline();
      renderEntriesList();
      feelingPicker?.classList.add('hidden');
    });
  });

  document.addEventListener('click', e => {
    const wrap = byId('feelingWrap');
    if (wrap && !wrap.contains(e.target)) feelingPicker?.classList.add('hidden');
  });

  // Fonts
  document.querySelectorAll('.btn-pill[data-font]').forEach(btn => {
    btn.addEventListener('click', () => setFont(btn.dataset.font));
  });

  // Export / Delete
  byId('exportBtn')?.addEventListener('click', exportMarkdown);
  byId('deleteBtn')?.addEventListener('click', () => { if (currentId) byId('deleteModal')?.classList.remove('hidden'); });
  byId('cancelDelete')?.addEventListener('click', () => byId('deleteModal')?.classList.add('hidden'));
  byId('confirmDelete')?.addEventListener('click', onDeleteConfirm);
  byId('deleteModal')?.addEventListener('click', e => { if (e.target === byId('deleteModal')) byId('deleteModal')?.classList.add('hidden'); });

  // AI Buttons & Modals
  byId('aiAnalyzeBtn')?.addEventListener('click', () => triggerAnalysis(true));
  byId('aiSettingsBtn')?.addEventListener('click', openAiSettings);
  byId('closeAiSettings')?.addEventListener('click', () => byId('aiSettingsModal')?.classList.add('hidden'));
  byId('aiSettingsModal')?.addEventListener('click', e => { if (e.target === byId('aiSettingsModal')) byId('aiSettingsModal')?.classList.add('hidden'); });

  // AI Settings Tabs
  document.querySelectorAll('.ai-tab').forEach(tab => {
    tab.addEventListener('click', () => switchAiTab(tab.dataset.provider));
  });

  byId('testAiBtn')?.addEventListener('click', testAiConnection);
  byId('saveAiSettings')?.addEventListener('click', saveAiSettingsHandler);
  byId('resetSystemPrompt')?.addEventListener('click', () => {
    const el = byId('aiSystemPrompt');
    if (el) el.value = DEFAULT_SYSTEM_PROMPT;
  });

    byId('geminiModelHint')?.addEventListener('click', async () => {
    const key = byId('geminiKey')?.value.trim() || aiConfig.geminiKey;
    if (!key) { alert('Please enter your Gemini API key first'); return; }
    const hint = byId('geminiModelHint');
    if (hint) hint.textContent = '⏳ Fetching models...';
    const models = await fetchGeminiModels(key);
    if (models && models.length > 0) {
      updateGeminiModelDropdown(models, byId('geminiModel')?.value);
      if (hint) hint.textContent = `✓ Found ${models.length} models`;
      setTimeout(() => { if (hint) hint.textContent = '⚡ Auto-detect models'; }, 3000);
    } else {
      if (hint) hint.textContent = '✗ Could not fetch models';
      setTimeout(() => { if (hint) hint.textContent = '⚡ Auto-detect models'; }, 3000);
    }
  });

  // OpenAI Select & Auto-detect
  byId('openaiModel')?.addEventListener('change', e => {
    const customInput = byId('openaiCustomModel');
    if (e.target.value === 'custom') {
      customInput?.classList.remove('hidden');
      customInput?.focus();
    } else {
      customInput?.classList.add('hidden');
    }
  });

  byId('openaiModelHint')?.addEventListener('click', async () => {
    const key = byId('openaiKey')?.value.trim() || aiConfig.openaiKey;
    if (!key) { alert('Please enter your OpenAI API key first'); return; }
    const hint = byId('openaiModelHint');
    if (hint) hint.textContent = '⏳ Fetching models...';
    const models = await fetchOpenAIModels(key);
    if (models && models.length > 0) {
      updateOpenAIModelDropdown(models, byId('openaiModel')?.value);
      if (hint) hint.textContent = `✓ Found ${models.length} models`;
      setTimeout(() => { if (hint) hint.textContent = '⚡ Auto-detect models'; }, 3000);
    } else {
      if (hint) hint.textContent = '✗ Could not fetch models';
      setTimeout(() => { if (hint) hint.textContent = '⚡ Auto-detect models'; }, 3000);
    }
  });

  // Ollama Select & Auto-detect
  byId('ollamaModelSelect')?.addEventListener('change', e => {
    const customInput = byId('ollamaModel');
    if (e.target.value === 'custom') {
      customInput?.classList.remove('hidden');
      customInput?.focus();
    } else {
      customInput?.classList.add('hidden');
    }
  });

  byId('ollamaModelHint')?.addEventListener('click', async () => {
    const url = byId('ollamaUrl')?.value.trim() || aiConfig.ollamaUrl || 'http://localhost:11434';
    const hint = byId('ollamaModelHint');
    if (hint) hint.textContent = '⏳ Checking Ollama...';
    try {
      const models = await fetchOllamaModels(url);
      if (models && models.length > 0) {
        updateOllamaModelDropdown(models, byId('ollamaModelSelect')?.value);
        if (hint) hint.textContent = `✓ Found ${models.length} models`;
        setTimeout(() => { if (hint) hint.textContent = '⚡ Auto-detect local models'; }, 3000);
      } else {
        if (hint) hint.textContent = '✗ No models found (pull with: ollama pull llama3)';
        setTimeout(() => { if (hint) hint.textContent = '⚡ Auto-detect local models'; }, 4000);
      }
    } catch(err) {
      alert(`Could not fetch Ollama models:\n\n${err.message}\n\nMake sure Ollama is running and allows browser requests:\nRun in Terminal: OLLAMA_ORIGINS="*" ollama serve`);
      if (hint) hint.textContent = '⚡ Auto-detect local models';
    }
  });

  // llama.cpp Select & Auto-detect
  byId('llamacppModelSelect')?.addEventListener('change', e => {
    const customInput = byId('llamacppModel');
    if (e.target.value === 'custom') {
      customInput?.focus();
    } else if (e.target.value && e.target.value !== 'default') {
      if (customInput) customInput.value = e.target.value;
    }
  });

  byId('llamacppModel')?.addEventListener('input', e => {
    const select = byId('llamacppModelSelect');
    if (select) {
      const match = Array.from(select.options).find(o => o.value === e.target.value.trim());
      select.value = match ? match.value : 'custom';
    }
  });

  byId('llamacppModelHint')?.addEventListener('click', async () => {
    const url = byId('llamacppUrl')?.value.trim() || aiConfig.llamacppUrl || 'http://localhost:9931';
    const key = byId('llamacppKey')?.value.trim() || aiConfig.llamacppKey || '';
    const hint = byId('llamacppModelHint');
    if (hint) hint.textContent = '⏳ Checking server...';
    try {
      const models = await fetchLlamaCppModels(url, key);
      if (models && models.length > 0) {
        updateLlamaCppModelDropdown(models, byId('llamacppModel')?.value || models[0]);
        if (hint) hint.textContent = `✓ Found ${models.length} models`;
        setTimeout(() => { if (hint) hint.textContent = '⚡ Auto-detect server models'; }, 3000);
      } else {
        if (hint) hint.textContent = '✓ Connected (default model active)';
        setTimeout(() => { if (hint) hint.textContent = '⚡ Auto-detect server models'; }, 3000);
      }
    } catch(err) {
      alert(`Could not fetch llama.cpp models:\n\n${err.message}\n\nEnsure llama-server or LM Studio is running.`);
      if (hint) hint.textContent = '⚡ Auto-detect server models';
    }
  });

  // Topics Overview Modal
  byId('topicsOverviewBtn')?.addEventListener('click', openTopicsOverview);
  byId('closeTopicsModal')?.addEventListener('click', () => byId('topicsModal')?.classList.add('hidden'));
  byId('topicsModal')?.addEventListener('click', e => { if (e.target === byId('topicsModal')) byId('topicsModal')?.classList.add('hidden'); });

  // Clear Topic Filter
  byId('clearTopicFilter')?.addEventListener('click', () => {
    activeTopicFilter = null;
    byId('clearTopicFilter')?.classList.add('hidden');
    renderSidebarTopicFilters();
    renderEntriesList();
  });

function syncLensPromptEditor(lens) {
  const lensObj = ANALYSIS_LENSES[lens] || ANALYSIS_LENSES.todos;
  const nameEl = byId('promptLensName');
  if (nameEl) nameEl.textContent = lensObj.name || 'Selected Lens';

  const ta = byId('analysisPromptTextarea');
  if (ta) ta.value = lensObj.prompt || '';
}

  // AI Analysis Hub Event Listeners
  byId('backToWritingBtn')?.addEventListener('click', closeAnalysisView);
  byId('appendAnalysisBtn')?.addEventListener('click', appendAnalysisToEntry);
  byId('copyAnalysisBtn')?.addEventListener('click', copyAnalysisToClipboard);
  byId('rerunAnalysisBtn')?.addEventListener('click', () => {
    const customPrompt = byId('analysisPromptTextarea')?.value.trim() || ANALYSIS_LENSES[activeLens]?.prompt;
    runLensAnalysis(activeLens, customPrompt);
  });

  // Prompt Editor Toggle & Reset
  byId('togglePromptEditorBtn')?.addEventListener('click', () => {
    const box = byId('analysisPromptBox');
    if (box) {
      box.classList.toggle('hidden');
      if (!box.classList.contains('hidden')) {
        byId('analysisPromptTextarea')?.focus();
      }
    }
  });

  byId('resetLensPromptBtn')?.addEventListener('click', () => {
    const lensObj = ANALYSIS_LENSES[activeLens] || ANALYSIS_LENSES.todos;
    const ta = byId('analysisPromptTextarea');
    if (ta) ta.value = lensObj.prompt || '';
  });

  // Dropdown Lens Selector
  byId('analysisLensSelect')?.addEventListener('change', e => {
    const lens = e.target.value;
    activeLens = lens;
    syncLensPromptEditor(lens);

    const entry = getEntry(currentId);
    const saved = entry?.analysis && entry.analysis[lens];
    if (saved) {
      activeAnalysisMarkdown = typeof saved === 'string' ? saved : JSON.stringify(saved);
      if (lens === 'pillarSuggestions') {
        try {
          const data = typeof saved === 'string' ? JSON.parse(saved) : saved;
          renderPRReviewCards(data);
        } catch(err) {
          renderAnalysisOutput(typeof saved === 'string' ? saved : '');
        }
      } else {
        renderAnalysisOutput(activeAnalysisMarkdown);
      }
    } else {
      const card = byId('analysisOutputCard');
      if (card) {
        card.innerHTML = `
          <div class="analysis-placeholder">
            <div style="font-size:1.8rem;margin-bottom:8px">${ANALYSIS_LENSES[lens]?.icon || '✨'}</div>
            <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">${ANALYSIS_LENSES[lens]?.title || 'Ready for Analysis'}</div>
            <div>Click <strong>"Generate"</strong> above to extract insights for this entry.</div>
          </div>
        `;
      }
    }
  });

  byId('runLensBtn')?.addEventListener('click', () => {
    const lens = byId('analysisLensSelect')?.value || activeLens || 'todos';
    const customPrompt = byId('analysisPromptTextarea')?.value.trim() || ANALYSIS_LENSES[lens]?.prompt;
    runLensAnalysis(lens, customPrompt);
  });

  // Custom Prompt Execution
  const runCustomPrompt = () => {
    const q = byId('analysisCustomInput')?.value.trim();
    if (!q) { alert('Please enter a custom question or prompt.'); return; }
    runLensAnalysis('custom', q);
  };
  byId('runCustomPromptBtn')?.addEventListener('click', runCustomPrompt);
  byId('analysisCustomInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); runCustomPrompt(); }
  });

  // Living Life Pillars Hub
  loadLifePillars();
  byId('lifePillarsBtn')?.addEventListener('click', openLifePillarsModal);
  byId('closePillarsModal')?.addEventListener('click', () => byId('pillarsModal')?.classList.add('hidden'));
  byId('pillarsModal')?.addEventListener('click', e => { if (e.target === byId('pillarsModal')) byId('pillarsModal')?.classList.add('hidden'); });

  byId('editPillarToggleBtn')?.addEventListener('click', () => {
    const rendered = byId('pillarContentRendered');
    const editor   = byId('pillarContentEditor');
    const textarea = byId('pillarMarkdownTextarea');
    const pillar = lifePillars.find(p => p.id === activePillarId);

    if (editor?.classList.contains('hidden')) {
      if (textarea && pillar) textarea.value = pillar.manualNotes || '';
      rendered?.classList.add('hidden');
      editor?.classList.remove('hidden');
      textarea?.focus();
    } else {
      rendered?.classList.remove('hidden');
      editor?.classList.add('hidden');
    }
  });

  byId('savePillarManualBtn')?.addEventListener('click', savePillarManualNotes);
  byId('cancelPillarEditBtn')?.addEventListener('click', () => {
    byId('pillarContentEditor')?.classList.add('hidden');
    byId('pillarContentRendered')?.classList.remove('hidden');
  });

  byId('newPillarBtn')?.addEventListener('click', createNewPillar);
  byId('deletePillarBtn')?.addEventListener('click', deleteActivePillar);
  byId('exportPillarBtn')?.addEventListener('click', exportPillarMarkdown);

  // Keyboard Shortcuts
  document.addEventListener('keydown', e => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 'n') { e.preventDefault(); onNewEntry(); }
    if (mod && e.key === 'b') { e.preventDefault(); applyMarkdown('bold'); }
    if (mod && e.key === 'i') { e.preventDefault(); applyMarkdown('italic'); }
    if (mod && e.key === 'p') { e.preventDefault(); togglePreview(); }
    if (mod && e.key === 'e') { e.preventDefault(); exportMarkdown(); }
    if (mod && e.shiftKey && e.key === 'A') { e.preventDefault(); triggerAnalysis(); }
    if (e.key === 'Escape') {
      feelingPicker?.classList.add('hidden');
      byId('deleteModal')?.classList.add('hidden');
      byId('topicsModal')?.classList.add('hidden');
      byId('aiSettingsModal')?.classList.add('hidden');
      byId('pillarsModal')?.classList.add('hidden');
      const analysisView = byId('analysisView');
      if (analysisView && !analysisView.classList.contains('hidden')) {
        closeAnalysisView();
      }
    }
  });

  updateAiBtnLabel();
}

// ─── BOOTSTRAP ────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
