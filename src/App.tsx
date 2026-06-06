/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent, TouchEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Plus, 
  Globe, 
  MoreHorizontal, 
  AudioLines, 
  ArrowUp, 
  Sparkle, 
  Boxes, 
  Activity, 
  Contrast, 
  Sun,
  Laptop,
  Check,
  Search,
  Code2,
  Cpu,
  Zap,
  Play,
  ChevronRight,
  Moon,
  CloudSun,
  Sunset,
  Clock,
  Sparkles,
  Paperclip,
  Brain,
  Mic
} from 'lucide-react';
import PlusMenu from './components/PlusMenu';
import VoiceSTT from './components/VoiceSTT';
import LoginModal from './components/LoginModal';
import ShowcaseSection from './components/ShowcaseSection';
import MyProjectsDrawer, { UserProject } from './components/MyProjectsDrawer';
// @ts-expect-error - image asset import declaration suppression for Vite
import bgImage from './assets/images/sand_cave_background_1780675270963.png';
// @ts-expect-error - image asset import declaration suppression for Vite
import nightBgImage from './assets/images/cave_moon_background_1780298528427.png';
import { ThemeMode, themes, getThemeForHour } from './theme';
import { auth } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  seedDefaultDbData, 
  getUserProjectsFromDb, 
  createUserProjectInDb, 
  deleteUserProjectFromDb 
} from './lib/projectsService';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  // Custom interactive system parameters
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPromptFocused, setIsPromptFocused] = useState(false);
  const [isAtmosOpen, setIsAtmosOpen] = useState(false);

  // Touch swipe gesture states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Local storage persisted portfolio state
  const [projects, setProjects] = useState<UserProject[]>([]);

  // Dynamic Themes variables
  const [themeMode, setThemeMode] = useState<ThemeMode>('afternoon');
  const [isAutoTheme, setIsAutoTheme] = useState(true);

  // Auto-detect theme based on time
  useEffect(() => {
    if (isAutoTheme) {
      const currentHour = new Date().getHours();
      setThemeMode(getThemeForHour(currentHour));
    }
  }, [isAutoTheme]);

  // Periodic clock check to ensure real-time accuracy if they stay on page
  useEffect(() => {
    const clockInterval = setInterval(() => {
      if (isAutoTheme) {
        const currentHour = new Date().getHours();
        const detected = getThemeForHour(currentHour);
        setThemeMode((prev) => (prev !== detected ? detected : prev));
      }
    }, 15000); // Check every 15 seconds
    return () => clearInterval(clockInterval);
  }, [isAutoTheme]);

  const activeTheme = themes[themeMode];

  // Synchronize local state with Firebase Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email || 'guest_architect@erere.io');
        
        // Seed default template blueprints and main landing showcase cards
        await seedDefaultDbData();

        // Retrieve saved user-specific blueprints from Firestore
        try {
          const dbItems = await getUserProjectsFromDb(user.uid);
          if (dbItems.length > 0) {
            setProjects(dbItems);
          } else {
            // First run migration: seed default tracker card
            const initialList: UserProject[] = [
              {
                id: 'fintech-ledger-local',
                title: 'Enterprise Portfolio Tracker',
                prompt: 'a flawless multi-currency transaction tracker featuring responsive custom micro-charts and secure JWT sessions',
                createdAt: 'Jun 1, 2026',
                status: 'Ready',
                techStack: ['React', 'Tailwind', 'Recharts'],
                viewsCount: 16
              }
            ];
            setProjects(initialList);
            await createUserProjectInDb(initialList[0], user.uid);
          }
        } catch (dbErr) {
          console.error("Firestore sync error: ", dbErr);
        }
      } else {
        // Automatically sign in anonymously to satisfy secure firestore rules
        try {
          await signInAnonymously(auth);
        } catch (authErr) {
          console.warn("Firebase anonymous authentication failed: ", authErr);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const saveProjects = (updatedList: UserProject[]) => {
    setProjects(updatedList);
    localStorage.setItem('erere_studio_blueprints', JSON.stringify(updatedList));
  };

  const chips = [
    { label: 'Saas app', promptText: 'a modern SaaS dashboard with analytical real-time data charts' },
    { label: 'E-commerce', promptText: 'a premium minimalist e-commerce clothing store with Apple-like aesthetics' },
    { label: 'Agency', promptText: 'a brutalist agency landing page with rich typing interactions' },
    { label: 'Marketplace', promptText: 'a peer-to-peer equipment rental marketplace with booking schedules' }
  ];

  const handleChipClick = (text: string) => {
    setPrompt((prev) => (prev ? `${prev} & ${text}` : `Build ${text}`));
  };

  const handleGenerate = (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const rawTitle = prompt.length > 30 ? prompt.substring(0, 27) + "..." : prompt;
    const stackOptions: string[] = ['React v19', 'Tailwind v4'];
    if (isDeepThinking) {
      stackOptions.push('Reasoning Core');
    }
    const lp = prompt.toLowerCase();
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
    if (!isDeepThinking && stackOptions.length === 2) {
      stackOptions.push('Web Auth');
    }

    const createdProj: UserProject = {
      id: "user-app-" + Date.now(),
      title: rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1),
      prompt: prompt,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Ready',
      techStack: stackOptions,
      viewsCount: Math.floor(Math.random() * 8) + 1
    };

    const currentList = [createdProj, ...projects];
    saveProjects(currentList);

    // Sync custom blueprint structure to secure Cloud Firestore Database
    if (auth.currentUser) {
      createUserProjectInDb(createdProj, auth.currentUser.uid).catch(err => {
        console.error("Firestore persistence failed:", err);
      });
    }

    setPrompt('');

    // Auto slide-in portfolio drawer from the left panel so they can immediately see their creation inside their personal drawer!
    setTimeout(() => {
      setIsDrawerOpen(true);
    }, 400);
  };

  const currentStepMessage = () => {
    switch (generationStep) {
      case 0: return 'Analyzing prompt semantics and architectural patterns...';
      case 1: return 'Building database schemas and serverless modules...';
      case 2: return 'Generating high-fidelity React frontend components with Tailwind...';
      case 3: return 'App structure successfully compiled! Ready to preview.';
      default: return 'Initializing...';
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isRightSwipe) {
      setIsDrawerOpen(true);
    }
    if (isLeftSwipe) {
      setIsDrawerOpen(false);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div 
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`min-h-screen ${activeTheme.bg} transition-colors duration-1000 ${activeTheme.textMain} font-sans selection:bg-emerald-200 selection:text-emerald-900`}
    >
      
      {/* Dynamic Generation Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-zinc-900 border border-emerald-500/20 max-w-lg w-full rounded-2xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-shimmer" />
              
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-display font-medium text-lg text-white">Erere Generation Engine</h4>
                  <p className="text-xs text-zinc-500">Processing custom blueprint</p>
                </div>
              </div>

              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 font-mono text-xs text-zinc-400 min-h-[140px] flex flex-col justify-between">
                <div>
                  <div className="text-zinc-500 mb-2">// User Prompt:</div>
                  <div className="text-emerald-300 italic mb-4 line-clamp-2">"{prompt}"</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span>STATUS: ACTIVE</span>
                    <span>{Math.round((generationStep + 1) * 25)}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-400"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(generationStep + 1) * 25}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <p className="text-[11px] text-emerald-400 animate-pulse flex items-center">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-ping" />
                    {currentStepMessage()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 text-xs font-medium">
                <button
                  onClick={() => setIsGenerating(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition"
                >
                  Cancel Build
                </button>
                {generationStep === 3 && (
                  <motion.button
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    onClick={() => {
                      setIsGenerating(false);
                      
                      // Process prompt keywords to extract title and dynamic developer badges
                      const rawTitle = prompt.length > 30 ? prompt.substring(0, 27) + "..." : prompt;
                      const stackOptions: string[] = ['React v19', 'Tailwind v4'];
                      const lp = prompt.toLowerCase();
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
                      if (stackOptions.length === 2) {
                        stackOptions.push('Web Auth');
                      }

                      const createdProj: UserProject = {
                        id: "user-app-" + Date.now(),
                        title: rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1),
                        prompt: prompt,
                        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        status: 'Ready',
                        techStack: stackOptions,
                        viewsCount: Math.floor(Math.random() * 8) + 1
                      };

                      const currentList = [createdProj, ...projects];
                      saveProjects(currentList);

                      // Sync custom blueprint structure to secure Cloud Firestore Database
                      if (auth.currentUser) {
                        createUserProjectInDb(createdProj, auth.currentUser.uid).catch(err => {
                          console.error("Firestore persistence failed:", err);
                        });
                      }
                      
                      // Auto slide-in portfolio drawer from the left panel so they can immediately see their creation inside their personal drawer!
                      setTimeout(() => {
                        setIsDrawerOpen(true);
                      }, 400);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-zinc-950 transition flex items-center space-x-1"
                  >
                    <span>Launch App</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="relative w-full overflow-hidden flex flex-col">
        
        {/* Background Artwork - Elegant sand and mint backdrop with slow-motion breath dynamics */}
        <div className="absolute top-0 left-0 w-full h-[95vh] md:h-[110vh] overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent z-10" />
          <div className={`absolute inset-0 bg-gradient-to-b ${activeTheme.bgOverlay} z-10 transition-all duration-1000`} />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent z-10" />
          
          <AnimatePresence mode="popLayout">
            {themeMode === 'night' ? (
              <motion.img 
                key="night-bg"
                src={nightBgImage} 
                alt="Dreamy quiet moon cave overlooking misty night-sky stars coast" 
                className="w-full h-full object-cover origin-top opacity-55 absolute inset-0"
                referrerPolicy="no-referrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0 }}
              />
            ) : (
              <motion.img 
                key="day-bg"
                src={bgImage} 
                alt="Dreamy soft sand cave overlooking misty sunlit coast" 
                className="w-full h-full object-cover origin-top opacity-90 absolute inset-0"
                referrerPolicy="no-referrer"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: themeMode === 'sunset' ? 0.75 : 0.9,
                  filter: themeMode === 'sunset' ? 'sepia(0.2) saturate(1.7) hue-rotate(-12deg)' : 'none'
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Ambient Glow Overlay */}
        <div className={`absolute top-0 left-0 w-full h-[100vh] bg-gradient-to-t from-transparent via-emerald-50/10 to-transparent z-1 pointer-events-none`} />

        {/* --- HEADER --- */}
        <header className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between z-30">
          
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer group">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <span className={`absolute inset-0 ${themeMode === 'night' ? 'bg-emerald-500/20' : 'bg-emerald-500/10'} rounded-full blur-sm group-hover:bg-emerald-500/20 transition-all duration-300`} />
              <div className={`relative w-5 h-5 border-2 ${themeMode === 'night' ? 'border-emerald-400' : 'border-emerald-700/80'} rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300`}>
                <div className={`w-1.5 h-1.5 ${themeMode === 'night' ? 'bg-emerald-400' : 'bg-emerald-700'} rounded-full`} />
                <div className={`absolute w-[3px] h-[3px] ${themeMode === 'night' ? 'bg-emerald-350' : 'bg-emerald-600'} rounded-full -top-1`} />
                <div className={`absolute w-[3px] h-[3px] ${themeMode === 'night' ? 'bg-emerald-350' : 'bg-emerald-600'} rounded-full -bottom-1`} />
              </div>
            </div>
            <span className={`font-display font-semibold text-lg tracking-tight transition-colors duration-1000 ${themeMode === 'night' ? 'text-[#e9f2ec]' : 'text-[#1e3d30]'}`}>Erere</span>
          </div>

          {/* Navigation Links */}
          <nav className={`hidden md:flex items-center space-x-1 lg:space-x-2 text-[13.5px] font-medium transition-colors duration-1000 ${themeMode === 'night' ? 'text-zinc-300' : 'text-[#2c5341]'}`}>
            {[
              { label: 'Products', hasMenu: true },
              { label: 'For work', hasMenu: true },
              { label: 'Resources', hasMenu: true },
              { label: 'Pricing', hasMenu: false },
              { label: 'Careers', hasMenu: false }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="relative"
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <button className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition duration-150 ${themeMode === 'night' ? 'hover:text-white hover:bg-zinc-850/80' : 'hover:text-emerald-950 hover:bg-[#e1efe8]/60'}`}>
                  <span>{item.label}</span>
                  {item.hasMenu && <ChevronDown className={`w-3.5 h-3.5 opacity-80 ${themeMode === 'night' ? 'text-zinc-400' : 'text-[#2c5341]'}`} />}
                </button>
                
                {/* Visual dropdown hint */}
                {hoveredNav === item.label && item.hasMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 rounded-xl p-2 shadow-xl backdrop-blur-md border ${
                      themeMode === 'night' ? 'bg-[#0f1411]/95 border-[#1b2b21] text-zinc-100' : 'bg-white/95 border-emerald-100 text-[#1e3d30]'
                    }`}
                  >
                    <div className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider ${themeMode === 'night' ? 'text-emerald-400' : 'text-emerald-800'}`}>Platform Options</div>
                    <button className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${themeMode === 'night' ? 'hover:bg-[#152a1e] text-zinc-300' : 'hover:bg-emerald-50 text-zinc-700 hover:text-[#1e4634]'}`}>
                      AI Code Generation
                    </button>
                    <button className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${themeMode === 'night' ? 'hover:bg-[#152a1e] text-zinc-300' : 'hover:bg-emerald-50 text-zinc-700 hover:text-[#1e4634]'}`}>
                      Interactive Previews
                    </button>
                    <button className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${themeMode === 'night' ? 'hover:bg-[#152a1e] text-zinc-300' : 'hover:bg-emerald-50 text-zinc-700 hover:text-[#1e4634]'}`}>
                      Instant Deployment
                    </button>
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* Top Actions */}
          <div className="flex items-center space-x-3.5 sm:space-x-4">
            
            {/* AUTOMATIC LIVE THEME STATUS INDICATOR */}
            <div className="relative">
              <div 
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[11.5px] font-semibold select-none transition-all duration-300 ${
                  themeMode === 'night' 
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400 shadow-lg shadow-emerald-900/10' 
                    : themeMode === 'sunset'
                    ? 'bg-[#feeadd]/70 border-[#f3cfb6] text-[#ca5a27]'
                    : 'bg-[#def5ea]/80 border-[#b2e5cc]/55 text-emerald-800'
                }`}
                title="Dynamic Atmosphere synced in real-time"
              >
                {themeMode === 'morning' ? <CloudSun className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> :
                 themeMode === 'afternoon' ? <Sun className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" /> :
                 themeMode === 'sunset' ? <Sunset className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> :
                 <Moon className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
                <span className="hidden sm:inline-block">
                  Live Time-Sync 🔄
                </span>
              </div>
            </div>

            <a href="#contact" className={`hover:text-emerald-950 font-sans text-[13.5px] font-medium transition hidden sm:inline-block ${themeMode === 'night' ? 'text-zinc-300 hover:text-white' : 'text-[#2c5341]'}`}>
              Contact sales
            </a>
            {userEmail ? (
              <div className={`flex items-center space-x-3 px-4 py-1.5 rounded-full border shadow-md shadow-emerald-500/5 ${
                themeMode === 'night' ? 'bg-[#0f1411] border-[#1b2b21]' : 'bg-white/95 border-emerald-500/20'
              }`}>
                <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {userEmail[0]}
                </div>
                <span className={`text-xs font-medium max-w-[110px] truncate ${themeMode === 'night' ? 'text-[#85988b]' : 'text-[#1e4634]'}`}>
                  {userEmail.split('@')[0]}
                </span>
                <div className="h-3 w-[1px] bg-zinc-200" />
                <button 
                  onClick={() => setUserEmail(null)}
                  className="text-[10px] text-zinc-400 hover:text-emerald-950 transition font-mono uppercase tracking-wider"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className={`font-sans text-[13.5px] font-medium transition cursor-pointer ${themeMode === 'night' ? 'text-zinc-300 hover:text-white' : 'text-[#2c5341] hover:text-[#12381e]'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className={`px-4 py-1.5 rounded-full border text-sans text-[13.5px] font-medium transition-all active:scale-95 cursor-pointer ${
                    themeMode === 'night' 
                      ? 'bg-emerald-500 text-black border-transparent hover:bg-emerald-455' 
                      : 'border-emerald-950/15 hover:border-emerald-950/35 text-emerald-900 bg-[#def5ea]/40 hover:bg-[#def5ea]/80'
                  }`}
                >
                  Create account
                </button>
              </>
            )}
          </div>
        </header>

         {/* --- MAIN HERO CONTENT --- */}
        <main className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-16 sm:pt-24 pb-8 flex flex-col items-center justify-center text-center">
          
          {/* Main Title Heading - Premium organic stagger blur reveals */}
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-sans font-semibold tracking-tight leading-[1.2] ${activeTheme.textMain} select-none max-w-3xl transition-colors duration-1000`}>
            <motion.span 
              initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              Build apps and websites
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className={`block ${activeTheme.textMain} mt-1 font-serif-inst`}
            >
              faster with <span className={`italic font-light ${themeMode === 'night' ? 'text-emerald-400 hover:text-emerald-350' : 'text-[#247c51] hover:text-[#1b613e]'} relative inline-block px-1 select-text transition-colors duration-300`}>AI-powered tooling</span>
            </motion.span>
          </h1>

          {/* Subtitle description - Delayed organic blur reveal */}
          <motion.p 
            initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.1, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`mt-6 ${activeTheme.textMuted} font-sans font-light text-base sm:text-lg max-w-xl transition-colors duration-1000`}
          >
            Turn ideas into functional apps — in minutes — no coding experience needed
          </motion.p>

          <AnimatePresence mode="wait">
            {isVoiceActive ? (
              <VoiceSTT 
                onCancel={() => setIsVoiceActive(false)}
                onConfirm={(transcriptText) => {
                  setPrompt((prev) => prev ? `${prev} ${transcriptText}` : transcriptText);
                  setIsVoiceActive(false);
                }}
              />
            ) : (
              /* Prompt Container Input Bar with premium focusing glow states resembling reference layout */
              <motion.form 
                onSubmit={handleGenerate}
                initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  filter: 'blur(0px)',
                  boxShadow: isPromptFocused 
                    ? (themeMode === 'night' ? '0 0px 30px rgba(16, 185, 129, 0.12), 0 10px 25px -5px rgba(0,0,0,0.5)' : '0 0px 30px rgba(36, 75, 60, 0.12), 0 10px 25px -5px rgba(0,0,0,0.06)')
                    : '0 10px 25px -5px rgba(0,0,0,0.04)'
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.9, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full max-w-3xl mt-12 mb-10 ${activeTheme.cardBg} border p-5 rounded-[28px] sm:rounded-[32px] backdrop-blur-xl flex flex-col justify-between relative z-30 transition-all duration-1000 ${
                  isPromptFocused ? (themeMode === 'night' ? 'border-emerald-500/40' : 'border-[#2d3a34]/30') : activeTheme.cardBorder
                }`}
              >
                {/* Input text Row */}
                <div className="relative w-full text-left">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onFocus={() => setIsPromptFocused(true)}
                    onBlur={() => setIsPromptFocused(false)}
                    placeholder="Ask a question or make a request..."
                    rows={3}
                    className={`w-full bg-transparent ${activeTheme.textMain} placeholder-zinc-500/40 font-sans text-[15px] sm:text-base leading-relaxed resize-none focus:outline-none focus:ring-0 pr-10 border-none`}
                    style={{ caretColor: themeMode === 'night' ? '#10b981' : '#244b3c' }}
                  />
                  {prompt && (
                    <button 
                      type="button" 
                      onClick={() => setPrompt('')} 
                      className={`absolute right-0 top-1 text-xs px-2.5 py-1 rounded transition-colors ${
                        themeMode === 'night' ? 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300' : 'text-[#2c5341] hover:text-emerald-950 hover:bg-black/5'
                      }`}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Bottom Actions Row to match the screenshot spacing and details */}
                <div className="flex items-center justify-between mt-3 pt-2">
                  
                  {/* Left Action Buttons: + Attach, Deep Thinking */}
                  <div className="flex items-center space-x-2">
                    
                    {/* Attach Selector */}
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setIsPlusMenuOpen(!isPlusMenuOpen);
                        }}
                        className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 shadow-sm ${
                          isPlusMenuOpen 
                            ? 'bg-[#244b3c] border-[#244b3c] text-white shadow-md' 
                            : themeMode === 'night'
                            ? 'bg-[#152a1e]/40 border-emerald-950/80 text-emerald-400 hover:bg-[#152a1e]/75 hover:border-emerald-800'
                            : themeMode === 'sunset'
                            ? 'bg-[#feeadd]/60 border-[#f3cfb6]/70 text-[#ca5a27] hover:bg-[#fedbcb]/70'
                            : 'bg-[#e2ebe2]/75 border-[#c8dec8]/70 text-[#2c5341] hover:text-[#1a3528] hover:border-[#244b3c] hover:bg-[#d5e4d5]/90'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Attach</span>
                      </button>

                      <AnimatePresence>
                        {isPlusMenuOpen && (
                          <div className="absolute bottom-11 left-0 z-50 min-w-[200px]">
                            <PlusMenu 
                              onSelectOption={(textOption) => {
                                setPrompt((prev) => prev ? `${prev} & ${textOption}` : `Build ${textOption}`);
                              }}
                              onClose={() => setIsPlusMenuOpen(false)}
                              themeMode={themeMode}
                            />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Deep Thinking Mode Toggle Button */}
                    <button 
                      type="button"
                      onClick={() => setIsDeepThinking(!isDeepThinking)}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 shadow-sm ${
                        isDeepThinking 
                          ? themeMode === 'night'
                            ? 'bg-emerald-950/90 border-emerald-500/55 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.22)]'
                            : themeMode === 'sunset'
                            ? 'bg-orange-100 border-orange-400/50 text-[#ca5a27]'
                            : 'bg-[#def5ea] border-emerald-600/40 text-[#1e4634]'
                          : themeMode === 'night'
                          ? 'bg-[#242c27]/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-[#242c27]/70'
                          : themeMode === 'sunset'
                          ? 'bg-orange-50/40 border-orange-200/50 text-orange-950/60 hover:text-[#ca5a27] hover:bg-orange-50/80'
                          : 'bg-[#e2ebe2]/30 border-[#c8dec8]/35 text-[#2c5341]/60 hover:text-emerald-950 hover:bg-[#e2ebe2]/60'
                      }`}
                    >
                      <Brain className={`w-3.5 h-3.5 transition-transform duration-300 ${isDeepThinking ? 'scale-110 animate-pulse text-emerald-500' : 'text-zinc-500'}`} />
                      <span>Deep Thinking</span>
                    </button>

                  </div>

                  {/* Right Action Icons: Speech Mic & Submit arrow */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsVoiceActive(true)}
                      title="Voice Input Mode"
                      className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                        themeMode === 'night'
                          ? 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-950/30'
                          : themeMode === 'sunset'
                          ? 'text-orange-950/50 hover:text-[#ca5a27] hover:bg-orange-50'
                          : 'text-[#2c5341]/60 hover:text-emerald-950 hover:bg-black/5'
                      }`}
                    >
                      <Mic className="w-[18px] h-[18px] stroke-[1.8]" />
                    </button>

                    <button 
                      type="submit"
                      disabled={!prompt.trim()}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
                        prompt.trim() 
                          ? themeMode === 'night'
                            ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/10 hover:bg-emerald-400'
                            : themeMode === 'sunset'
                            ? 'bg-[#ca5a27] text-white shadow-md shadow-orange-600/10 hover:bg-[#a34419]'
                            : 'bg-[#244b3c] text-white hover:bg-[#1a382c]' 
                          : 'bg-zinc-200/40 text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Brand/Sponsor Logos exactly matching reference image */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-3xl flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[#2d3a34] font-medium text-sm mt-8 pb-12 select-none"
          >
            <div className="flex items-center space-x-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <Sparkle className="w-4 h-4 text-[#2c5341] stroke-[2.5]" />
              <span className="font-sans font-semibold tracking-tight text-[#1e3d30]">Acme Corp</span>
            </div>
            <div className="flex items-center space-x-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <Boxes className="w-4 h-4 text-[#2c5341]" />
              <span className="font-sans font-semibold tracking-tight text-[#1e3d30]">BuildingBlocks</span>
            </div>
            <div className="flex items-center space-x-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <Cpu className="w-4 h-4 text-[#2c5341]" />
              <span className="font-sans font-semibold tracking-tight text-[#1e3d30]">AlphaWave</span>
            </div>
            <div className="flex items-center space-x-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <Contrast className="w-4 h-4 text-[#2c5341]" />
              <span className="font-sans font-semibold tracking-tight text-[#1e3d30]">ContrastAI</span>
            </div>
            <div className="flex items-center space-x-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <Zap className="w-4 h-4 text-[#2c5341]" />
              <span className="font-sans font-semibold tracking-tight text-[#1e3d30]">Euphoria</span>
            </div>
          </motion.div>

        </main>

        {/* Compact elegant pull trigger button attached to the left edge of the viewport */}
        <div 
          onClick={() => setIsDrawerOpen(true)}
          className="fixed left-0 top-[40%] -translate-y-1/2 z-40 bg-white/95 hover:bg-[#ebf1ec] border-y border-r border-[#c8dec8]/80 w-7.5 h-14 flex flex-col items-center justify-center rounded-r-xl shadow-[4px_0_15px_rgba(36,75,60,0.06)] cursor-pointer group transition-all duration-200 select-none hover:w-9"
          title="Open Project Base (Swipe Right)"
        >
          {/* Classic minimalist stack bars */}
          <div className="flex flex-col space-y-1 w-3.5 items-center">
            <span className="h-[1.5px] w-3 bg-[#2c5341] group-hover:bg-[#1b613e] group-hover:w-3.5 rounded-full transition-all duration-200"></span>
            <span className="h-[1.5px] w-2.5 bg-[#2c5341] group-hover:bg-[#244b3c] group-hover:w-3.5 rounded-full transition-all duration-200"></span>
            <span className="h-[1.5px] w-3 bg-[#2c5341] group-hover:bg-[#1b613e] group-hover:w-3.5 rounded-full transition-all duration-200"></span>
          </div>
          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse mt-2" />
        </div>

        {/* --- BLUEPRINTS SHOWCASE SECTION --- */}
        <ShowcaseSection themeMode={themeMode} />

        {/* --- FOOTER --- */}
        <footer className="w-full bg-white/30 py-8 px-6 mt-auto text-center border-t border-[#c8dec8]/30 text-xs text-[#5e7166] z-10 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-emerald-600/45 rounded-full animate-pulse" />
          </div>
        </footer>

        {/* --- MODALS AND PORTALS --- */}
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onSuccess={(email) => setUserEmail(email)}
        />

        <MyProjectsDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          projects={projects}
          themeMode={themeMode}
          onDeleteProject={async (id) => {
            const list = projects.filter(p => p.id !== id);
            saveProjects(list);
            
            if (auth.currentUser) {
              try {
                await deleteUserProjectFromDb(id, auth.currentUser.uid);
              } catch (err) {
                console.error("Firestore project deletion failed:", err);
              }
            }
          }}
          onSelectProject={(selectedPrompt) => {
            setPrompt(selectedPrompt);
          }}
        />

      </div>
    </div>
  );
}

