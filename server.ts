import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client safely
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("GoogleGenAI initialized server-side successfully with provided API key.");
  } else {
    console.warn("GEMINI_API_KEY not found in environment variables. Using high-quality server-side fallback generators.");
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI client:", e);
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
});

// Prompt semantic analyzer and software constructor API
app.post("/api/generate", async (req, res) => {
  const { prompt, deepThinking } = req.body;
  
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // If Gemini client is activated, execute live generative structure building
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the user's prompt: "${prompt}".
        They want to generate an application or website blueprint. 
        Deep Thinking status is: ${deepThinking ? "ACTIVE" : "INACTIVE"}.
        
        Generate a dynamic, authentic software blueprint metadata object with:
        1. A literal/professional title (2-4 words, eg "Personal Ledgers", "Retail Storefront", "Pulse Canvas").
        2. A cohesive functional summary description (1-2 clean sentences).
        3. A curated list of 3-5 real tech stack libraries/architectures suited perfectly for the prompt.
        
        Ensure output returns the exact schema specified.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { 
                type: Type.STRING, 
                description: "App Name" 
              },
              description: { 
                type: Type.STRING, 
                description: "Brief 1-2 sentence description" 
              },
              techStack: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Associated tech libraries"
              }
            },
            required: ["title", "description", "techStack"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text.trim());
        return res.json(parsed);
      }
    } catch (err) {
      console.warn("Gemini Live prompt compilation failed, resorting to precise fallback algorithm:", err);
    }
  }

  // Solid, responsive fallback generator if key is missing or api fails
  const cleanPrompt = prompt.trim();
  const rawTitle = cleanPrompt.length > 30 ? cleanPrompt.substring(0, 27) + "..." : cleanPrompt;
  const titleFormatted = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
  const stackOptions: string[] = ['React v19', 'Tailwind v4'];
  
  if (deepThinking) {
    stackOptions.push('Reasoning Core');
  }
  
  const lp = cleanPrompt.toLowerCase();
  if (lp.includes('dash') || lp.includes('chart') || lp.includes('analyt')) {
    stackOptions.push('Recharts');
  }
  if (lp.includes('e-com') || lp.includes('store') || lp.includes('pay') || lp.includes('stripe')) {
    stackOptions.push('Stripe Gateway');
  }
  if (lp.includes('sql') || lp.includes('database') || lp.includes('sqlite')) {
    stackOptions.push('SQLite DB');
  }
  if (lp.includes('gemini') || lp.includes('ai') || lp.includes('agent')) {
    stackOptions.push('Gemini AI SDK');
  }
  if (!deepThinking && stackOptions.length === 2) {
    stackOptions.push('Web Auth');
  }

  return res.json({
    title: titleFormatted,
    description: `A custom-engineered high-performance build of "${cleanPrompt}" styled elegantly with luxurious spacing and real-time state responsiveness.`,
    techStack: stackOptions
  });
});

// Real-time AI Assistant Generation Chat with Conversational Memory
app.post("/api/chat", async (req, res) => {
  const { prompt, history, deepThinking } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Format previous conversation context if history is provided to empower Conversation Memory
  let conversationContext = "";
  if (Array.isArray(history) && history.length > 0) {
    conversationContext = history
      .map((msg: any) => `${msg.sender === 'user' ? 'User' : 'Assistant (Lovable AI)'}: ${msg.text}`)
      .join("\n\n");
  }

  const modelName = deepThinking ? "gemini-2.5-pro" : "gemini-2.5-flash";

  if (ai) {
    let responseText = "";
    const systemInstructionAndConfig = {
      contents: `You are Lovable AI, a world-class senior full-stack AI engineer and software architect.
        Analyze the user's prompt: "${prompt}".
        They are using a dashboard named BuildCraft that has 4 mockup preview screens:
        1. 'fitness' (Fitness activity tracker, steps counter, daily exercise logs)
        2. 'expenses' (Fintech transactions, income/expense entries, ledgers)
        3. 'todo' (Task lists, workflows, checklists)
        4. 'saas' (Cloud server monitor, telemetries, logs)

        Previous conversation history for contextual memory:
        ${conversationContext}

        Generate a response detailing how to build or update their desired application. You must return a structured JSON response matching the required schema so the app can render it beautifully with markdown, checklists, and code attachments.
        
        Rules:
        - Provide high-quality explanations inside the 'text' field using rich markdown formatting (block headers, bullet points, and code blocks). Keep code snippets clean.
        - Inside the 'screen' field, dynamically classify and suggest the best simulator display: MUST be exactly one of 'fitness', 'expenses', 'todo', or 'saas'.
        - Provide 3-4 professional checklists representing implementation details.
        - If the user asks to write/preview code, provide the code file name (e.g. 'expenses_service.ts') and actual React/TypeScript code logic inside 'fileContent'.
        `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { 
              type: Type.STRING, 
              description: "The core markdown-formatted developer response." 
            },
            screen: { 
              type: Type.STRING, 
              description: "The targeted app mockup screen to toggle: 'fitness', 'expenses', 'todo', or 'saas'." 
            },
            checklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 technical task list checkboxes done."
            },
            fileName: {
              type: Type.STRING,
              description: "Optional code filename associated with this response."
            },
            fileContent: {
              type: Type.STRING,
              description: "Raw source code snippet for the file (TypeScript/React)."
            }
          },
          required: ["text", "screen", "checklist"]
        }
      }
    };

    try {
      console.log(`[AI Core] Initiating chat construction matching model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        ...systemInstructionAndConfig
      });
      responseText = response.text || "";
    } catch (err: any) {
      console.warn(`[AI Core] Primary model ${modelName} encountered an issue or quota exhaustion:`, err.message || err);
      
      // If Pro failed and we haven't loaded Flash yet, fall back instantly to gemini-2.5-flash
      if (modelName === "gemini-2.5-pro") {
        try {
          console.info("[AI Core] Attempting graceful fallback to gemini-2.5-flash...");
          const fallbackResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            ...systemInstructionAndConfig
          });
          responseText = fallbackResponse.text || "";
        } catch (fallbackErr: any) {
          console.error("[AI Core] Flash fallback model also failed:", fallbackErr.message || fallbackErr);
        }
      }
    }

    if (responseText) {
      try {
        const parsed = JSON.parse(responseText.trim());
        return res.json(parsed);
      } catch (parseError) {
        console.error("[AI Core] Error parsing generative response text to JSON payload:", parseError);
      }
    }
  }

  // Pure dynamic fallback algorithms if Gemini API key is not mapped or quota exceeded
  const lowerPrompt = prompt.toLowerCase();
  
  // Categorize
  let screen: 'fitness' | 'expenses' | 'todo' | 'saas' = 'fitness';
  let title = 'Health & Vitality Tracker';
  let concept = 'fitness and exercise tracker';
  let fileAttachedName = 'fitness_logic_engine.ts';
  let fileAttachedContent = '';
  let featuresMarkdown = '';
  let technicalBulletPoints = '';
  let checklistArr: string[] = [];

  const fitnessKeywords = ['fitness', 'gym', 'health', 'workout', 'step', 'run', 'walk', 'calorie', 'heart', 'pulse', 'exercise', 'diet', 'train', 'sport', 'track', 'sehat', 'daud', 'bhag', 'vazan', 'khel', 'yoga', 'sleep', 'water'];
  const expenseKeywords = ['expense', 'income', 'budget', 'ledger', 'money', 'pay', 'trans', 'bill', 'finance', 'invoice', 'wallet', 'dollar', 'rupee', 'paisa', 'bank', 'spend', 'salary', 'cost', 'price', 'kharch', 'kamai', 'hisaab', 'bachat', 'tax', 'profit', 'revenue'];
  const todoKeywords = ['todo', 'task', 'list', 'checklist', 'plan', 'schedule', 'remind', 'goal', 'habit', 'routine', 'note', 'agenda', 'work', 'assign', 'productivity', 'manage', 'kaam', 'fihrist', 'likho', 'yaad', 'subah', 'rozana', 'done', 'priorit'];
  const saasKeywords = ['saas', 'cloud', 'server', 'cpu', 'telemetry', 'latency', 'database', 'api', 'dashboard', 'monitor', 'metric', 'network', 'ping', 'deploy', 'host', 'infra', 'analytics', 'scale', 'chalana', 'system', 'daata', 'traffic', 'load', 'hosting'];

  // Count matches
  let fitnessScore = 0;
  let expenseScore = 0;
  let todoScore = 0;
  let saasScore = 0;

  for (const k of fitnessKeywords) { if (lowerPrompt.includes(k)) fitnessScore++; }
  for (const k of expenseKeywords) { if (lowerPrompt.includes(k)) expenseScore++; }
  for (const k of todoKeywords) { if (lowerPrompt.includes(k)) todoScore++; }
  for (const k of saasKeywords) { if (lowerPrompt.includes(k)) saasScore++; }

  // Fallback to highest score, default to 'fitness'
  if (expenseScore > fitnessScore && expenseScore >= todoScore && expenseScore >= saasScore) {
    screen = 'expenses';
  } else if (todoScore > fitnessScore && todoScore >= expenseScore && todoScore >= saasScore) {
    screen = 'todo';
  } else if (saasScore > fitnessScore && saasScore >= expenseScore && saasScore >= todoScore) {
    screen = 'saas';
  } else if (fitnessScore > 0) {
    screen = 'fitness';
  } else {
    // Implicit matching via contents
    if (lowerPrompt.includes('welcome') || lowerPrompt.includes('intro') || lowerPrompt.includes('start') || lowerPrompt.includes('screen') || lowerPrompt.includes('hai')) {
      screen = 'todo'; // Good container for generic lists or instructions
    }
  }

  // Generate specific high-caliber Claude style content based on categorized screen
  if (screen === 'fitness') {
    title = 'Quantum Fit & Vitality Engine';
    concept = 'AI-powered biometric monitoring, daily goal tracking, and active dynamic cardiac telemetry';
    fileAttachedName = 'QuantumVitalityManager.tsx';
    fileAttachedContent = `import React, { useState, useEffect } from 'react';
import { Shield, Activity, Share2, Flame, Heart, Award } from 'lucide-react';

export interface DailyMetrics {
  steps: number;
  calories: number;
  activeMinutes: number;
  heartRate: number;
  waterIntakeMl: number;
}

export function QuantumVitalityManager() {
  const [metrics, setMetrics] = useState<DailyMetrics>({
    steps: 8432,
    calories: 420,
    activeMinutes: 38,
    heartRate: 72,
    waterIntakeMl: 1200
  });

  const [sessionStreak, setSessionStreak] = useState(14);
  const stepGoal = 10000;

  const logActivity = (type: 'run' | 'yoga' | 'hydrate') => {
    setMetrics(prev => {
      switch (type) {
        case 'run':
          return {
            ...prev,
            steps: prev.steps + 2500,
            calories: prev.calories + 180,
            activeMinutes: prev.activeMinutes + 15,
            heartRate: 145
          };
        case 'yoga':
          return {
            ...prev,
            calories: prev.calories + 75,
            activeMinutes: prev.activeMinutes + 25,
            heartRate: 98
          };
        case 'hydrate':
          return { ...prev, waterIntakeMl: prev.waterIntakeMl + 250 };
      }
    });
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-805 rounded-3xl text-slate-101 shadow-2xl max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="font-sans font-bold text-sm tracking-wide text-white uppercase">VITALITY.CORE</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
          🔥 {sessionStreak} DAY STREAK
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/60">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Daily Steps</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white">{metrics.steps.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">/ {stepGoal}</span>
          </div>
        </div>
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/60">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Heart Rhythm</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <Heart className="w-3.5 h-3.5 text-rose-505 animate-pulse" />
            <span className="text-2xl font-black text-rose-403">{metrics.heartRate}</span>
            <span className="text-[10px] text-slate-500">BPM</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5">
        <button onClick={() => logActivity('run')} className="flex-1 py-2 text-xs font-bold bg-emerald-505 hover:bg-emerald-400 text-slate-950 rounded-xl transition">
          + Add Run
        </button>
        <button onClick={() => logActivity('hydrate')} className="flex-1 py-2 text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl transition">
          + Drink Water
        </button>
      </div>
    </div>
  );
}`;

    featuresMarkdown = `### Core Vitality Engine Architecture
To fulfill your request: **"${prompt}"**, I have deployed the **Quantum Fit & Vitality Engine** architecture inside our reactive mockup sandbox.

The backend service layer tracks dynamic health telemetry coordinates in real time. We pair responsive web elements (built using robust React functional hooks and SVG animation trees) with persistent store updates.

#### 🌌 Key Architectural Features Included:
- **Biometric Calibration Hub**: Calculates instant steps progress and cardiac rates under active workouts.
- **Glass-Molded Vitality Cards**: Smoothly showcases visual status bars using gradient fills and high contrast layouts.
- **Dynamic Session Reducer**: Integrates lazy dispatch handles to prevent interface locking during rapid events.`;

    technicalBulletPoints = `- **Cardiac Analytics Interface**: Configured real-time cardiac visualizers reflecting average pulse rate shifts.
- **SVG Circular Progress Framework**: Implemented custom stroke dash arrays representing steps vs goal percentages.
- **Micro-workout Logging**: Hooked up modular event emitters designed to feed persistent workout history logs.`;

    checklistArr = [
      'Implemented fluid SVG circular steps percentage meters',
      'Wrote lazy cardiac data updates with random rate fluctuations',
      'Configured responsive desktop-first layout for exercise logs',
      'Prepared system hooks for wearable hardware synchronization'
    ];

  } else if (screen === 'expenses') {
    title = 'Aurelius Wealth Ledger';
    concept = 'fintech transaction logs, double-entry subledgers, and predictive expense forecasting matrixes';
    fileAttachedName = 'WealthLedgerMatrix.tsx';
    fileAttachedContent = `import React, { useState } from 'react';
import { DollarSign, Eye, RefreshCw, BarChart2, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export interface LedgerEntry {
  id: string;
  category: string;
  detail: string;
  amount: number;
  direction: 'credit' | 'debit';
  timestamp: string;
}

export function WealthLedgerMatrix() {
  const [entries, setEntries] = useState<LedgerEntry[]>([
    { id: '1', category: 'SaaS Revenue', detail: 'App Subscription Sales', amount: 1450.00, direction: 'credit', timestamp: '10:15 AM' },
    { id: '2', category: 'Cloud Infrastructure', detail: 'AWS Hosting & DB Cluster', amount: 320.00, direction: 'debit', timestamp: '09:30 AM' },
    { id: '3', category: 'Freelance Design', detail: 'External Illustrator Retainer', amount: 450.00, direction: 'debit', timestamp: 'Yesterday' }
  ]);

  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'credit' | 'debit'>('credit');

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;
    
    const newEntry: LedgerEntry = {
      id: Date.now().toString(),
      category,
      detail: 'Manual transactional entry',
      amount: parseFloat(amount),
      direction,
      timestamp: 'Just now'
    };

    setEntries(prev => [newEntry, ...prev]);
    setCategory('');
    setAmount('');
  };

  const netBalance = entries.reduce((sum, entry) => {
    return entry.direction === 'credit' ? sum + entry.amount : sum - entry.amount;
  }, 0);

  return (
    <div className="p-6 bg-[#0f172a] border border-slate-800 rounded-3xl text-slate-101 shadow-2xl max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <h3 className="font-mono text-xs tracking-widest text-[#94a3b8] uppercase">WEALTH_LEDGER.v1</h3>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
          NET COMPASS: \${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

      <form onSubmit={handleInsert} className="space-y-3 mb-6 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="text" 
            placeholder="Category" 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className="bg-slate-900 border border-slate-805 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-505"
          />
          <input 
            type="number" 
            placeholder="Amount" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            className="bg-slate-900 border border-slate-805 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-505"
          />
        </div>
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={() => setDirection('credit')}
            className={\`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition \${direction === 'credit' ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}\`}
          >
            Credit (Income)
          </button>
          <button 
            type="button" 
            onClick={() => setDirection('debit')}
            className={\`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition \${direction === 'debit' ? 'bg-rose-500/15 border-rose-500 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-400'}\`}
          >
            Debit (Expense)
          </button>
        </div>
        <button type="submit" className="w-full py-2 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl hover:bg-emerald-400 transition uppercase tracking-wide">
          Commit Transaction Entry
        </button>
      </form>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {entries.map(entry => (
          <div key={entry.id} className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-900 hover:border-slate-800 transition">
            <div>
              <p className="text-xs font-bold text-white">{entry.category}</p>
              <p className="text-[10px] text-slate-400">{entry.timestamp}</p>
            </div>
            <span className={\`text-xs font-mono font-bold \${entry.direction === 'credit' ? 'text-emerald-400' : 'text-rose-400'}\`}>
              {entry.direction === 'credit' ? '+' : '-'}\${entry.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`;

    featuresMarkdown = `### Aurelius Wealth Ledger Architecture
To realize your custom query: **"${prompt}"**, I have compiled the **Aurelius Wealth Ledger Matrix** mockup.

This model introduces a clean, enterprise-ready data validation lifecycle ensuring double-entry transactions are formatted and recorded without memory leaks. All cash coordinates, sub-ledgers, and account balances are updated synchronously.

#### 💹 Key Technological Layers:
- **Ledger Ingestion Loop**: Employs rigorous numeric checks preventing floating-point rounding abnormalities.
- **Immersive Micro-Form Deck**: Structured around easy single-action triggers that minimize input friction.
- **Automated Trend Estimator**: Provides a computed breakdown of active net metrics on each layout redraw.`;

    technicalBulletPoints = `- **Transactional Integrity Guard**: Uses standard string ID identifiers ensuring entry uniqueness.
- **Debit vs Credit Color Schema**: Leverages eye-friendly high contrast semantic color pairings (**emerald green** / **rose red**).
- **Sub-ledger Cache Matrix**: Supports smooth local insertion states allowing live updates in-view.`;

    checklistArr = [
      'Designed double-entry ledger state structures',
      'Configured input field validators preventing empty submissions',
      'Aligned high-contrast financial balances counters',
      'Wrote transaction category mapper callbacks'
    ];

  } else if (screen === 'todo') {
    title = 'Zenith Command Hub';
    concept = 'distributed task checklists, priority matrices, and interactive epic-to-subtask workflows';
    fileAttachedName = 'ZenithCommandHub.tsx';
    fileAttachedContent = `import React, { useState } from 'react';
import { Shield, CheckSquare, Square, Trash2, Calendar, Folder, Plus } from 'lucide-react';

export interface CommandTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  tag: string;
}

export function ZenithCommandHub() {
  const [tasks, setTasks] = useState<CommandTask[]>([
    { id: '1', title: 'Initialize production database cluster', priority: 'high', completed: true, tag: 'Database' },
    { id: '2', title: 'Refactor OAuth security popup redirects', priority: 'high', completed: false, tag: 'Auth' },
    { id: '3', title: 'Compile visual onboarding deck templates', priority: 'medium', completed: false, tag: 'Visuals' },
    { id: '4', title: 'Weld localized string tables', priority: 'low', completed: true, tag: 'Design' }
  ]);

  const [inputTitle, setInputTitle] = useState('');
  const [inputPriority, setInputPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [inputTag, setInputTag] = useState('Core');

  const commitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;

    const newTask: CommandTask = {
      id: Date.now().toString(),
      title: inputTitle.trim(),
      priority: inputPriority,
      completed: false,
      tag: inputTag
    };

    setTasks(prev => [...prev, newTask]);
    setInputTitle('');
  };

  const triggerToggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="p-6 bg-[#000] border border-stone-850 rounded-3xl text-stone-101 shadow-2xl max-w-lg mx-auto font-sans">
      <div className="flex items-center justify-between mb-6 border-b border-stone-900 pb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-400" />
          <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">ZENITH_HUB.io</span>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
          {tasks.filter(t => !t.completed).length} DEFERRALS REMAINING
        </span>
      </div>

      <form onSubmit={commitTask} className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="New system goal..." 
          value={inputTitle} 
          onChange={e => setInputTitle(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-505"
        />
        <button type="submit" className="p-2.5 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition cursor-pointer">
          <Plus className="w-4 h-4" />
        </button>
      </form>

      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between p-3 bg-zinc-955 rounded-xl border border-zinc-900 hover:border-zinc-800 transition">
            <div className="flex items-center gap-3">
              <button onClick={() => triggerToggle(task.id)} className="text-emerald-400 hover:text-emerald-350 cursor-pointer border-none bg-transparent p-0">
                {task.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-zinc-650" />}
              </button>
              <span className={\`text-xs transition-all \${task.completed ? 'line-through text-zinc-550 opacity-60' : 'text-zinc-100'}\`}>
                {task.title}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={\`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase \${
                task.priority === 'high' ? 'bg-rose-950/40 text-rose-400 border border-rose-900/30' :
                task.priority === 'medium' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' :
                'bg-slate-900 text-slate-400'
              }\`}>
                {task.priority}
              </span>
              <button onClick={() => removeTask(task.id)} className="text-zinc-500 hover:text-rose-400 transition border-none bg-transparent">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;

    featuresMarkdown = `### Zenith Command Hub Checklist Architecture
To execute your custom prompt: **"${prompt}"**, I have loaded the **Zenith Command Hub** architecture structure.

This system facilitates active workflow scheduling, goal hierarchies, and dynamic checklist updates under high productivity contexts. It provides a compact, minimal dashboard containing beautiful lists and priority tags.

#### 🌌 Key Interactive Features:
- **High-Velocity State Reducer**: Manages item toggles and deletions instantly with flawless UI feedback.
- **Priority Quadrant Matrix**: Tags tasks under active tiers (**high**, **medium**, **low**) with responsive indicator styles.
- **Lazy Counter Display**: Automatically recalculates completion goals and live task statistics.`;

    technicalBulletPoints = `- **Fluid Action Dispatchers**: Hooks up click listener handlers to commit new text inputs into the store.
- **Priority Indicator Labels**: Formats task difficulty indicators cleanly in light or dark modes.
- **Garbage-Collector Removal Button**: Safely handles array filtering so removed tasks leave standard React render pathways smoothly.`;

    checklistArr = [
      'Initialized responsive task lists state structures',
      'Completed focus keypress hooks enabling Enter key submissions',
      'Formatted priority badge indicators with high contrast text styles',
      'Validated data models preventing empty string array leaks'
    ];

  } else {
    // SaaS / Default fallbacks
    title = 'Nebula SaaS Portal';
    concept = 'active cluster microservices, cloud telemetry pipelines, and real-time network throughput graphs';
    fileAttachedName = 'NebulaTelemetryMonitor.tsx';
    fileAttachedContent = `import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Database, Network, Shield, AlertTriangle } from 'lucide-react';

export function NebulaTelemetryMonitor() {
  const [metrics, setMetrics] = useState({ cpu: 42, memory: 68, latencyMs: 14 });
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[system] Loaded microserver clustering successfully',
    '[database] Persistent connection established with Cloud SQL pg_pool_12',
    '[security] TLS 1.3 handshakes authenticated on ports: [3000]'
  ]);

  useEffect(() => {
    const handle = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 30) + 30,
        memory: Math.floor(Math.random() * 10) + 65,
        latencyMs: Math.floor(Math.random() * 8) + 12
      });

      setTerminalLogs(prev => {
        const msgs = [
          \`[telemetry] Latency stabilized around \${Math.floor(Math.random() * 5) + 12}ms\`,
          \`[traffic] Ingestion payload matched \${(Math.random() * 4).toFixed(2)} MB/s\`,
          \`[infra] CPU allocation scaled to re-route requests\`
        ];
        const added = msgs[Math.floor(Math.random() * msgs.length)];
        return [...prev.slice(-3), added];
      });
    }, 4000);

    return () => clearInterval(handle);
  }, []);

  return (
    <div className="p-6 bg-stone-900 border border-stone-850 rounded-3xl text-slate-101 shadow-2xl max-w-lg mx-auto font-mono">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h3 className="text-xs tracking-widest text-[#94a3b8] uppercase">NEBULA_STREAM.v21</h3>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> CLOCK SYNCED
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="p-3 bg-stone-950 rounded-xl border border-stone-850">
          <p className="text-[8px] text-stone-450 uppercase tracking-widest">CPU LOAD</p>
          <p className="text-lg font-black text-white mt-0.5">{metrics.cpu}%</p>
        </div>
        <div className="p-3 bg-stone-950 rounded-xl border border-stone-850">
          <p className="text-[8px] text-stone-450 uppercase tracking-widest">RAM USE</p>
          <p className="text-lg font-black text-white mt-0.5">{metrics.memory}%</p>
        </div>
        <div className="p-3 bg-stone-950 rounded-xl border border-stone-850">
          <p className="text-[8px] text-stone-450 uppercase tracking-widest">LATENCY</p>
          <p className="text-lg font-black text-emerald-400 mt-0.5">{metrics.latencyMs}ms</p>
        </div>
      </div>

      <div className="bg-stone-950 p-3 rounded-xl border border-stone-850">
        <p className="text-[8px] text-stone-500 uppercase tracking-widest mb-2 border-b border-stone-900 pb-1 flex items-center gap-1">
          <Database className="w-3 h-3 text-emerald-400" /> Active Terminal Ingress Logs
        </p>
        <div className="space-y-1 max-h-24 overflow-y-auto font-mono text-[9.5px]">
          {terminalLogs.map((log, index) => (
            <p key={index} className="text-[#34d399] leading-tight select-text">{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
}`;

    featuresMarkdown = `### Nebula SaaS Cluster Portal Architecture
To structure your custom task: **"${prompt}"**, I have mounted the **Nebula SaaS Telemetry Dashboard** mockup inside our device sandbox.

This layout compiles cloud server status displays, active memory usage gauges, and real-time terminal network monitoring logs. It uses continuous polling simulation effects to showcase metric changes organically.

#### 🌌 Portals and Core Interfaces Configured:
- **Cloud Metrics Telemetry Monitor**: Tracks continuous synthetic resource fluctuations (CPU, memory, latency).
- **Ingress Event Logging Terminal**: Continuously processes simulation message arrays via reactive intervals.
- **Network Pipeline Diagnostics Indicator**: Animates network nodes demonstrating cluster stability coordinates.`;

    technicalBulletPoints = `- **Continuous State Engine Poller**: Uses secure native \`setInterval\` hooks cleanly disposed on component unmount.
- **Log Stream Buffer Matrix**: Limits log items capacity dynamically preventing client memory bloating.
- **Telemetric Display Micro-cards**: Uses rich monospaced styling to emphasize status reporting fields.`;

    checklistArr = [
      'Configured interval telemetry dispatch schedulers',
      'Designed memory leak prevention buffers on log arrays',
      'Configured microservice load tag dashboards',
      'Finished responsive UI indicators matching server metrics'
    ];
  }

  return res.json({
    text: `${featuresMarkdown}

#### ⚡ Technical Implementations:
${technicalBulletPoints}

Type other customized rules or feature designs below to update the in-memory store models instantly!`,
    screen,
    checklist: checklistArr,
    fileName: fileAttachedName,
    fileContent: fileAttachedContent
  });
});

// Configure Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in Development Mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in Production Mode serving static compiled files...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Erere Platform server booted on port ${PORT}`);
  });
}

setupServer().catch(err => {
  console.error("Failed to start full-stack server:", err);
});
