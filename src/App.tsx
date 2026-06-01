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
  ChevronRight
} from 'lucide-react';
import PlusMenu from './components/PlusMenu';
import VoiceSTT from './components/VoiceSTT';
import LoginModal from './components/LoginModal';
import ShowcaseSection from './components/ShowcaseSection';
import MyProjectsDrawer, { UserProject } from './components/MyProjectsDrawer';
// @ts-expect-error - image asset import declaration suppression for Vite
import bgImage from './assets/images/cave_moon_background_1780298528427.png';
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
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPromptFocused, setIsPromptFocused] = useState(false);

  // Touch swipe gesture states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Local storage persisted portfolio state
  const [projects, setProjects] = useState<UserProject[]>([]);

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

    setIsGenerating(true);
    setGenerationStep(0);

    // Simulate AI Generation progression steps! High-fidelity user experience
    const interval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev >= 3) {
          clearInterval(interval);
          return 3;
        }
        return prev + 1;
      });
    }, 1200);
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
      className="min-h-screen bg-[#070e0a] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300"
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
        
        {/* Background Artwork - Perfect replica of the moon-in-cave prompt with slow-motion breath dynamics */}
        <div className="absolute top-0 left-0 w-full h-[95vh] md:h-[110vh] overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#070e0a] via-transparent to-black/45 z-10" />
          <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-black/60 to-transparent z-10" />
          <motion.img 
            src={bgImage} 
            alt="Dreamy cave overlooking starry green moonlit sky" 
            className="w-full h-full object-cover origin-top opacity-85"
            referrerPolicy="no-referrer"
            animate={{
              scale: [1.01, 1.05, 1.01],
              y: [0, -6, 0]
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Ambient Glow Overlay */}
        <div className="absolute top-0 left-0 w-full h-[100vh] ambient-glow z-1 pointer-events-none" />

        {/* --- HEADER --- */}
        <header className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between z-30">
          
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer group">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <span className="absolute inset-0 bg-emerald-500/20 rounded-full blur-sm group-hover:bg-emerald-500/30 transition-all duration-300" />
              <div className="relative w-5 h-5 border-2 border-emerald-400/80 rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full" />
                <div className="absolute w-[3px] h-[3px] bg-emerald-400 rounded-full -top-1" />
                <div className="absolute w-[3px] h-[3px] bg-emerald-400 rounded-full -bottom-1" />
              </div>
            </div>
            <span className="font-display font-semibold text-lg text-white tracking-tight">Erere</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-zinc-300 font-sans text-[13.5px] font-medium">
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
                <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition duration-150">
                  <span>{item.label}</span>
                  {item.hasMenu && <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                </button>
                
                {/* Visual dropdown hint */}
                {hoveredNav === item.label && item.hasMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-zinc-950/95 border border-zinc-800 rounded-lg p-2 shadow-2xl backdrop-blur-md"
                  >
                    <div className="px-3 py-1.5 text-xs text-zinc-500 font-mono">Platform Options</div>
                    <button className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 text-xs hover:text-emerald-300 transition-colors">
                      AI Code Generation
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 text-xs hover:text-emerald-300 transition-colors">
                      Interactive Previews
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 text-xs hover:text-emerald-300 transition-colors">
                      Instant Deployment
                    </button>
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* Top Actions */}
          <div className="flex items-center space-x-4">
            <a href="#contact" className="text-zinc-300 hover:text-white font-sans text-[13.5px] font-medium transition hidden sm:inline-block">
              Contact sales
            </a>
            {userEmail ? (
              <div className="flex items-center space-x-3 bg-zinc-950/70 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center text-[10px] font-bold text-zinc-950 uppercase">
                  {userEmail[0]}
                </div>
                <span className="text-xs text-emerald-300 font-medium max-w-[110px] truncate">
                  {userEmail.split('@')[0]}
                </span>
                <div className="h-3 w-[1px] bg-zinc-800" />
                <button 
                  onClick={() => setUserEmail(null)}
                  className="text-[10px] text-zinc-500 hover:text-white transition font-mono uppercase tracking-wider"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="text-[#a1a1aa] hover:text-white font-sans text-[13.5px] font-medium transition cursor-pointer"
                >
                  Login
                </button>
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="px-4 py-1.5 rounded-full border border-white/20 hover:border-white/40 text-white font-sans text-[13.5px] font-medium transition-all bg-white/5 hover:bg-white/10 active:scale-95 cursor-pointer"
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-semibold tracking-tight leading-[1.2] text-white select-none max-w-3xl">
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
              className="block text-zinc-200 mt-1 font-serif-inst"
            >
              faster with <span className="italic font-light text-emerald-400/90 relative inline-block px-1 select-text transition-colors duration-300 hover:text-emerald-300">AI-powered tooling</span>
            </motion.span>
          </h1>

          {/* Subtitle description - Delayed organic blur reveal */}
          <motion.p 
            initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.1, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-zinc-400 font-sans font-light text-base sm:text-lg max-w-xl"
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
              /* Prompt Container Input Bar with premium focusing glow states */
              <motion.form 
                onSubmit={handleGenerate}
                initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  filter: 'blur(0px)',
                  boxShadow: isPromptFocused 
                    ? '0 0 35px rgba(16, 185, 129, 0.22), 0 15px 35px -5px rgba(0,0,0,0.85)' 
                    : '0 15px 30px -5px rgba(0,0,0,0.6)'
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.9, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full max-w-3xl mt-12 mb-10 bg-zinc-950/85 md:bg-zinc-950/70 border p-5 rounded-[26px] sm:rounded-[32px] backdrop-blur-md flex flex-col justify-between relative z-30 transition-colors duration-300 ${
                  isPromptFocused ? 'border-emerald-500/40' : 'border-white/10'
                }`}
              >
                {/* Input text Row */}
                <div className="relative w-full text-left">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onFocus={() => setIsPromptFocused(true)}
                    onBlur={() => setIsPromptFocused(false)}
                    placeholder="Build anything that..."
                    rows={2}
                    className="w-full bg-transparent text-white placeholder-zinc-500 font-sans text-base leading-relaxed resize-none focus:outline-none focus:ring-0 pr-10 border-none"
                    style={{ caretColor: '#10b981' }}
                  />
                  {prompt && (
                    <button 
                      type="button" 
                      onClick={() => setPrompt('')} 
                      className="absolute right-0 top-1 text-zinc-500 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Bottom Actions Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-white/5 mt-4">
                  
                  {/* Left actions: + and Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto scroller-hidden">
                    
                    {/* Interactive Plus Selector with clean local positioning */}
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setIsPlusMenuOpen(!isPlusMenuOpen);
                        }}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer ${
                          isPlusMenuOpen 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800/40'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <AnimatePresence>
                        {isPlusMenuOpen && (
                          <div className="absolute bottom-9 left-0 z-50">
                            <PlusMenu 
                              onSelectOption={(textOption) => {
                                setPrompt((prev) => prev ? `${prev} & ${textOption}` : `Build ${textOption}`);
                              }}
                              onClose={() => setIsPlusMenuOpen(false)}
                            />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Micro Pills / Suggestion Chips with staggered entrance and spring hover states */}
                    {chips.map((chip, idx) => (
                      <motion.button
                        key={idx}
                        type="button"
                        onClick={() => handleChipClick(chip.promptText)}
                        initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ 
                          duration: 0.6, 
                          delay: 0.35 + (idx * 0.08), 
                          ease: [0.16, 1, 0.3, 1] 
                        }}
                        whileHover={{ 
                          scale: 1.05, 
                          borderColor: 'rgba(16, 185, 129, 0.45)', 
                          backgroundColor: 'rgba(24, 24, 27, 0.8)',
                          boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)'
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="h-7 px-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-sans text-[11.5px] hover:text-white transition-all cursor-pointer shrink-0"
                      >
                        {chip.label}
                      </motion.button>
                    ))}

                    {/* More / Globe Icon */}
                    <div className="flex items-center space-x-1.5 pl-1 shrink-0">
                      <Globe className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 transition cursor-pointer" />
                      <MoreHorizontal className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 transition cursor-pointer" />
                    </div>
                  </div>

                  {/* Right actions: Audio lines and green Arrow Button */}
                  <div className="flex items-center justify-between sm:justify-end space-x-3 gap-2 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => setIsVoiceActive(true)}
                      className="relative flex items-center space-x-2 bg-zinc-900 px-3.5 py-1.5 rounded-lg border border-zinc-800/80 cursor-pointer hover:bg-zinc-800 hover:border-emerald-500/40 transition duration-150 active:scale-95 overflow-hidden group"
                    >
                      {/* Concentric audio pulse background ring wave */}
                      <motion.div
                        className="absolute inset-0 bg-emerald-500/5 rounded-lg pointer-events-none origin-center"
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.3, 0.7, 0.3]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {/* Double active indicator glowing ping dot */}
                      <div className="relative flex items-center justify-center">
                        <span className="absolute w-2 h-2 rounded-full bg-emerald-400/40 animate-ping" />
                        <AudioLines className="w-3.5 h-3.5 text-emerald-400 relative z-10 animate-pulse" />
                      </div>
                      
                      <span className="text-[10px] text-zinc-400 font-mono tracking-wider relative z-10">AUDIO ACTIVE</span>
                    </button>

                    <button 
                      type="submit"
                      disabled={!prompt.trim()}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        prompt.trim() 
                          ? 'bg-emerald-400 text-zinc-950 shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 hover:bg-emerald-300' 
                          : 'bg-zinc-800 text-zinc-650 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                </div>
              </motion.form>
            )}
          </AnimatePresence>

        </main>

        {/* Compact elegant pull trigger button attached to the left edge of the viewport */}
        <div 
          onClick={() => setIsDrawerOpen(true)}
          className="fixed left-0 top-[40%] -translate-y-1/2 z-40 bg-[#121212]/95 hover:bg-[#181818] border-y border-r border-[#242424] w-7.5 h-14 flex flex-col items-center justify-center rounded-r-xl shadow-[4px_0_15px_rgba(0,0,0,0.6)] cursor-pointer group transition-all duration-200 select-none hover:w-9"
          title="Open Project Base (Swipe Right)"
        >
          {/* Classic minimalist stack bars */}
          <div className="flex flex-col space-y-1 w-3.5 items-center">
            <span className="h-[1.5px] w-3 bg-zinc-400 group-hover:bg-emerald-400 group-hover:w-3.5 rounded-full transition-all duration-200"></span>
            <span className="h-[1.5px] w-2.5 bg-zinc-400 group-hover:bg-white group-hover:w-3.5 rounded-full transition-all duration-200"></span>
            <span className="h-[1.5px] w-3 bg-zinc-400 group-hover:bg-emerald-400 group-hover:w-3.5 rounded-full transition-all duration-200"></span>
          </div>
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mt-2" />
        </div>

        {/* --- BLUEPRINTS SHOWCASE SECTION --- */}
        <ShowcaseSection />

        {/* --- FOOTER --- */}
        <footer className="w-full bg-zinc-950/20 py-8 px-6 mt-auto text-center border-t border-zinc-900/60 text-xs text-zinc-500 z-10 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-emerald-500/45 rounded-full animate-pulse" />
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

