import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '200kb' }));

const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_APIKEY;
const PORT = process.env.PORT || 4001;
const DATA_DIR = path.join(process.cwd(), 'server');
const PLANS_FILE = path.join(DATA_DIR, 'plans.json');
const PROXY_AUTH_TOKEN = process.env.PROXY_AUTH_TOKEN || process.env.VITE_PROXY_AUTH_TOKEN || null;

if (!OPENAI_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. The proxy AI will return 503 until an API key is provided.');
}

// Basic in-memory rate limiter per IP (naive)
const rateWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 30;
const ipMap = new Map();
app.use((req, res, next) => {
  // If a proxy auth token is configured, require it on requests
  try {
    if (PROXY_AUTH_TOKEN) {
      const provided = req.headers['x-proxy-auth'] || req.headers['x-proxy-token'];
      if (!provided || provided !== PROXY_AUTH_TOKEN) return res.status(401).json({ error: 'Missing or invalid proxy auth' });
    }
  } catch (err) {}
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = ipMap.get(ip) || { count: 0, ts: now };
    if (now - entry.ts > rateWindowMs) {
      entry.count = 0; entry.ts = now;
    }
    entry.count++;
    ipMap.set(ip, entry);
    if (entry.count > maxRequestsPerWindow) return res.status(429).json({ error: 'Rate limit exceeded' });
  } catch (err) { /* ignore */ }
  next();
});

async function readPlans() {
  try {
    const raw = await fs.readFile(PLANS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) { return []; }
}

async function writePlans(plans) {
  try {
    await fs.writeFile(PLANS_FILE, JSON.stringify(plans, null, 2), 'utf8');
  } catch (err) { console.error('Failed to write plans file', err); }
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Heuristic fallback generator used when OpenAI is unavailable or the account has no quota.
function generateHeuristicSuggestions({ event, budget = 100, transport = 'car', seatingPref = 'standard', numPeople = 1, summary = {} }) {
  // Basic ticket base price by seating
  const baseTicket = seatingPref === 'vip' ? 120 : seatingPref === 'premium' ? 80 : 40;
  const transportCost = transport === 'flight' ? 150 : transport === 'train' ? 40 : 20;
  const accommodation = budget > 300 && numPeople > 1 ? 80 : (budget > 200 ? 50 : 0);

  const ticketTotal = baseTicket * numPeople;
  const totalEstimate = ticketTotal + transportCost + accommodation;

  const suggestions = [];

  if (totalEstimate <= budget) {
    suggestions.push({
      title: 'Within budget',
      detail: `Estimated total ${totalEstimate} (tickets ${ticketTotal} + travel ${transportCost} + lodging ${accommodation})`,
      recommendation: 'Good to go — tickets fit your budget. Consider buying now to lock prices.',
      suggestedChanges: null
    });
    suggestions.push({
      title: 'Consider upgrades',
      detail: 'You have room in your budget — a small seating upgrade may improve experience.',
      recommendation: 'If you value comfort, try premium seating.',
      suggestedChanges: { seatingPref: 'premium', budgetAdjustment: Math.ceil((80 - baseTicket) * numPeople) }
    });
  } else {
    suggestions.push({
      title: 'Over budget',
      detail: `Estimated total ${totalEstimate}. You will exceed your budget.`,
      recommendation: 'Reduce seating or choose cheaper transport to fit the budget.',
      suggestedChanges: { seatingPref: 'standard', transport: 'train', budgetAdjustment: 0 }
    });
    suggestions.push({
      title: 'Cheaper options',
      detail: 'Switch to standard seating or train travel to cut costs.',
      recommendation: 'Try standard seating and train travel.',
      suggestedChanges: { seatingPref: 'standard', transport: 'train' }
    });
  }

  if (event && event.city && event.city.toLowerCase() !== 'online') {
    suggestions.push({
      title: 'Local tips',
      detail: `Check local transit passes in ${event.city} and look for group discounts.`,
      recommendation: 'Search for transit day-passes or local discount codes.',
      suggestedChanges: null
    });
  }

  // Map the suggestions to the structured schema expected by the frontend
  return suggestions.map(s => ({
    title: s.title,
    detail: s.detail,
    recommendation: s.recommendation || '',
    suggestedChanges: s.suggestedChanges || null
  }));
}

app.post('/plans', async (req, res) => {
  const payload = req.body || {};
  const id = makeId();
  const plan = { id, ...payload };
  const plans = await readPlans();
  plans.unshift(plan);
  await writePlans(plans.slice(0, 200));
  res.json({ success: true, id, plan });
});

app.get('/plans/:id', async (req, res) => {
  const id = req.params.id;
  const plans = await readPlans();
  const found = plans.find(p => p.id === id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  res.json({ plan: found });
});

app.post('/ai/suggest', async (req, res) => {
  if (!OPENAI_KEY) {
    // Return heuristic suggestions when no OpenAI key is configured
    const fallback = generateHeuristicSuggestions(req.body || {});
    return res.json({ suggestions: fallback, fallback: true, message: 'OpenAI key not configured; returning heuristic suggestions.' });
  }
  const { event, budget, transport, seatingPref, numPeople, summary } = req.body || {};
  const system = `You are an event planning assistant that returns strictly JSON. Given event metadata and budget/preferences, return an array of up to 5 suggestion objects. Each suggestion should be: { "title": string, "detail": string, "recommendation": string, "suggestedChanges": { "seatingPref"?:string, "transport"?:string, "budgetAdjustment"?:number, "numPeople"?:number } } . ONLY return valid JSON array.`;
  const user = `Event: ${event ? JSON.stringify({ name: event.name, city: event.city, date: event.date, artist: event.artist }) : 'unknown'}\nBudget: ${budget}\nTransport: ${transport}\nSeating: ${seatingPref}\nPeople: ${numPeople}\nSummary: ${summary && typeof summary.totalEstimate !== 'undefined' ? JSON.stringify(summary) : 'none'}`;

  try {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    });

    if (!resp.ok) {
      const txt = await resp.text();
      // If OpenAI returned an insufficient_quota error, fall back to heuristics
      try {
        const parsedErr = JSON.parse(txt || '{}');
        const errType = parsedErr?.error?.type || parsedErr?.error?.code || null;
        if (errType === 'insufficient_quota' || errType === 'quota_exceeded') {
          const fallback = generateHeuristicSuggestions({ event, budget, transport, seatingPref, numPeople, summary });
          return res.json({ suggestions: fallback, fallback: true, message: 'OpenAI quota exceeded; returning heuristic suggestions.' });
        }
      } catch (e) { /* ignore parse errors */ }
      // For other OpenAI errors, still attempt heuristic fallback
      const fallback = generateHeuristicSuggestions({ event, budget, transport, seatingPref, numPeople, summary });
      return res.json({ suggestions: fallback, fallback: true, message: 'OpenAI error; returning heuristic suggestions.', details: txt });
    }

    const json = await resp.json();
    const content = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
    // Attempt to extract JSON from content
    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // Try to find JSON block inside text
      const m = content && content.match(/```json\s*([\s\S]*?)```/i);
      if (m && m[1]) {
        try { parsed = JSON.parse(m[1]); } catch {};
      }
    }
    if (parsed && Array.isArray(parsed)) return res.json({ suggestions: parsed });
    // fallback: return raw content so frontend can show it
    return res.json({ raw: content });
  } catch (err) {
    console.error('Proxy error', err);
    res.status(500).json({ error: 'Proxy failed', details: String(err) });
  }
});

app.listen(PORT, () => console.log(`AI proxy & plan server listening on http://localhost:${PORT}`));
