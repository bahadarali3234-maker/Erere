import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle,
  ExternalLink,
  Sparkles,
  Zap,
  Globe,
  Cpu,
  Monitor,
  Heart
} from 'lucide-react';
import { getSidebarTemplates } from '../lib/projectsService';

export interface UserProject {
  id: string;
  title: string;
  prompt: string;
  createdAt: string;
  status: 'Ready' | 'Compiling' | 'Maintained';
  techStack: string[];
  viewsCount: number;
}

interface MyProjectsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: UserProject[];
  onDeleteProject: (id: string) => void;
  onSelectProject: (prompt: string) => void;
  themeMode?: string;
}

export default function MyProjectsDrawer({ 
  isOpen, 
  onClose, 
  projects, 
  onDeleteProject,
  onSelectProject,
  themeMode = 'afternoon'
}: MyProjectsDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [dbTemplates, setDbTemplates] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      getSidebarTemplates()
        .then(items => {
          if (items && items.length > 0) {
            setDbTemplates(items.map(t => ({
              id: t.id,
              title: t.title,
              prompt: t.prompt,
              createdAt: t.createdAt,
              avatarBg: t.avatarBg || 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500',
              iconCode: t.iconCode || t.title.substring(0, 2).toUpperCase()
            })));
          }
        })
        .catch(err => {
          console.error("Cloud templates fetch failed:", err);
        });
    }
  }, [isOpen]);

  // High fidelity default items as showcased in client's screenshot
  const screenshotDefaults = [
    {
      id: 'default-1',
      title: 'Prompt Architect',
      prompt: 'a premium visual prompt builder with live dynamic JSON config output',
      createdAt: '2 hours ago',
      avatarBg: 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500',
      iconCode: 'PA'
    },
    {
      id: 'default-2',
      title: 'UI Mirror',
      prompt: 'a high-fidelity mirror sync client showing cross-platform devices simultaneously',
      createdAt: '14 hours ago',
      avatarBg: 'bg-gradient-to-tr from-blue-700 via-teal-500 to-emerald-400',
      iconCode: 'UI'
    },
    {
      id: 'default-3',
      title: 'Aura Portal',
      prompt: 'a dark cybernetic landing page with responsive audio waveforms and visual telemetry lines',
      createdAt: '14 hours ago',
      avatarBg: 'bg-gradient-to-tr from-amber-500 via-red-500 to-pink-600',
      iconCode: 'AP'
    },
    {
      id: 'default-4',
      title: 'Cloudburst Launcher',
      prompt: 'an elegant cloud deployment terminal to boot up containers in under 12 seconds with live telemetry log lines',
      createdAt: '1 May 2026',
      avatarBg: 'bg-gradient-to-tr from-[#111] to-[#333]',
      iconCode: 'CL'
    },
    {
      id: 'default-5',
      title: 'Cloud Play Launcher',
      prompt: 'a minimalist instant streaming games arcade client with physics simulation engine',
      createdAt: '30 Apr 2026',
      avatarBg: 'bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700',
      iconCode: 'CP'
    },
    {
      id: 'default-6',
      title: 'Creative Canvas AI',
      prompt: 'a vector sketch editor with background canvas generators and grid layouts',
      createdAt: '1 May 2026',
      avatarBg: 'bg-gradient-to-tr from-white via-zinc-200 to-slate-400 text-zinc-950 font-bold',
      iconCode: 'CC'
    },
    {
      id: 'default-7',
      title: 'Aura Nexus',
      prompt: 'a graphical grid overview linking cloud databases with visual query nodes',
      createdAt: '1 May 2026',
      avatarBg: 'bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-950 border border-zinc-700',
      iconCode: 'AN'
    }
  ];

  const activeTemplates = dbTemplates.length > 0 ? dbTemplates : screenshotDefaults;

  // Combine customized user created projects with screenshot defaults for maximum fidelity
  const displayUserProjects = projects.map(p => ({
    id: p.id,
    title: p.title,
    prompt: p.prompt,
    createdAt: p.createdAt,
    avatarBg: 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400',
    iconCode: p.title.substring(0, 2).toUpperCase(),
    isUserProject: true
  }));

  const allListItems = [...displayUserProjects, ...activeTemplates];

  // Filter based on search input
  const filteredList = allListItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteProject(id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          />

          {/* Drawer Sidebar Menu matching client screenshot exactly */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 190 }}
            className={`fixed inset-y-0 left-0 w-full max-w-[340px] sm:max-w-[360px] p-5 shadow-[5px_0_30px_rgba(36,75,60,0.08)] flex flex-col z-[50] transition-colors duration-1000 ${
              themeMode === 'night' 
                ? 'bg-[#0f1411] border-r border-[#1b2b21] text-zinc-100' 
                : themeMode === 'sunset'
                ? 'bg-[#fdf3e9] border-r border-[#eed4c5]/75 text-[#4c2409]'
                : 'bg-[#fdfefd] border-r border-[#c8dec8]/60 text-[#1e3d30]'
            }`}
          >
            
            {/* Header / Active controllers row exactly matching screenshot */}
            <div className="flex items-center space-x-2 mb-6">
              
              {/* Search Icon circle button */}
              <button 
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition active:scale-95 shrink-0 ${
                  themeMode === 'night' 
                    ? 'bg-zinc-900 border-[#1b2b21]/40 text-emerald-400 hover:bg-[#152a1e]/20' 
                    : themeMode === 'sunset'
                    ? 'bg-[#f7e6d9] border-[#eed4c5] text-[#ca5a27] hover:bg-[#ebd0be]'
                    : 'bg-[#f4f7f4]/80 border border-[#c8dec8]/70 text-[#2c5341] hover:text-emerald-950 hover:bg-[#ebf1ec]'
                }`}
                title="Search Blueprints"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Filter Dropdown Pill Button */}
              <div className="relative flex-1">
                <button 
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`flex items-center justify-between space-x-2 border px-4 py-2.5 rounded-full text-[13px] font-semibold w-full text-left transition ${
                    themeMode === 'night' 
                      ? 'bg-zinc-900 border-[#1b2b21]/40 text-emerald-400 hover:bg-[#152a1e]/20' 
                      : themeMode === 'sunset'
                      ? 'bg-[#f7e6d9] border-[#eed4c5] text-[#ca5a27] hover:bg-[#ebd0be]'
                      : 'bg-[#f4f7f4]/80 border border-[#c8dec8]/70 text-[#2c5341] hover:text-[#12381e] hover:bg-[#ebf1ec]'
                  }`}
                >
                  <span className="truncate">Created by me</span>
                  <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                </button>

                <AnimatePresence>
                  {filterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className={`absolute left-0 right-0 mt-1 border rounded-xl overflow-hidden z-50 text-[12px] shadow-xl ${
                        themeMode === 'night' 
                          ? 'bg-zinc-950 border-[#1b2b21] text-emerald-400' 
                          : themeMode === 'sunset'
                          ? 'bg-[#fdf3e9] border-[#eed4c5] text-[#ca5a27]'
                          : 'bg-white border-[#c8dec8] text-[#2c5341]'
                      }`}
                    >
                      <button 
                        onClick={() => setFilterOpen(false)}
                        className={`w-full text-left px-4 py-2 font-medium transition ${
                          themeMode === 'night' ? 'hover:bg-[#152a1e] text-emerald-300' : 'hover:bg-[#def5ea]/40 text-emerald-950'
                        }`}
                      >
                        Created by me ({projects.length})
                      </button>
                      <button 
                        onClick={() => setFilterOpen(false)}
                        className={`w-full text-left px-4 py-2 font-medium transition ${
                          themeMode === 'night' ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-[#def5ea]/45 text-[#5e7166]'
                        }`}
                      >
                        All workspace templates
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Close helper button for touch screen exit */}
              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition sm:hidden ${
                  themeMode === 'night' 
                    ? 'bg-zinc-900 border-[#1b2b21] text-zinc-400' 
                    : 'bg-[#f4f7f4] hover:bg-[#e1efe8] text-[#5e7166] hover:text-emerald-950 border-[#c8dec8]/50'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Optional Small Search Input bar that expands under button click (highly responsive addition) */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search prompt database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors ${
                  themeMode === 'night' 
                    ? 'bg-[#152a1e] border border-emerald-950/30 text-zinc-100 placeholder-zinc-500/80 focus:border-emerald-500' 
                    : themeMode === 'sunset'
                    ? 'bg-[#fcfaf9]/90 border border-[#eed4c5]/60 text-orange-950 placeholder-orange-900/40 focus:border-orange-500'
                    : 'bg-[#f4f7f4]/60 border border-[#c8dec8]/60 focus:border-[#244b3c] text-[#1e3d30] placeholder-[#5e7166]/60'
                }`}
              />
            </div>

            {/* SCROLLER LIST CONTAINER */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 -mr-2.5 scroller-hidden">
              
              {/* Create New Project block exactly like screenshot */}
              <button 
                onClick={() => {
                  onSelectProject('');
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl transition group text-left ${
                  themeMode === 'night' ? 'hover:bg-emerald-950/20' : 'hover:bg-[#e1efe8]/35'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl border border-dashed flex items-center justify-center transition shrink-0 bg-transparent ${
                  themeMode === 'night' 
                    ? 'border-emerald-800 text-emerald-400 group-hover:text-emerald-300 group-hover:border-emerald-500' 
                    : 'border-[#c8dec8]/70 text-[#5e7166] group-hover:text-emerald-800 group-hover:border-[#244b3c]/50'
                }`}>
                  <Plus className="w-5 h-5 stroke-[2]" />
                </div>
                <span className={`text-[14px] font-medium tracking-tight transition ${
                  themeMode === 'night' ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-[#2c5341] group-hover:text-[#1e3d30]'
                }`}>
                  Create new project
                </span>
              </button>

              {/* Grid / Loop List of Showcase items */}
              {filteredList.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: idx * 0.04, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    x: 4, 
                    backgroundColor: themeMode === 'night' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(225, 239, 232, 0.45)' 
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelectProject(item.prompt);
                    onClose();
                  }}
                  className="group w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 cursor-pointer text-left relative"
                >
                  
                  {/* Left avatar and Text info */}
                  <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                    
                    {/* Unique gradient design app icon with subtle hover scale */}
                    <div className={`w-12 h-12 rounded-2xl ${item.avatarBg} flex items-center justify-center text-xs font-semibold tracking-wider text-white shadow-inner shrink-0 overflow-hidden`}>
                      <span className="opacity-85 font-mono italic">{item.iconCode}</span>
                    </div>

                    <div className="min-w-0 pr-2">
                      <h4 className={`font-display font-medium text-[14.5px] transition-colors truncate ${
                        themeMode === 'night' ? 'text-zinc-200 group-hover:text-emerald-400' : 'text-[#2c5341]/95 group-hover:text-emerald-900'
                      }`}>
                        {item.title}
                      </h4>
                      <p className={`text-[12px] font-light mt-0.5 ${
                        themeMode === 'night' ? 'text-zinc-450' : 'text-[#5e7166]'
                      }`}>
                        {item.createdAt}
                      </p>
                    </div>
                  </div>

                  {/* Micro Actions overlay visible on hover */}
                  <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleCopy(item.id, item.prompt, e)}
                      className={`p-1.5 rounded-lg border transition ${
                        themeMode === 'night' 
                          ? 'bg-zinc-900 border-[#1b2b21] text-emerald-400 hover:text-emerald-350 hover:bg-zinc-800' 
                          : 'bg-white border-[#c8dec8]/65 text-[#2c5341] hover:text-[#1a3528] hover:bg-[#e1efe8]/60'
                      }`}
                      title="Copy Prompt IP"
                    >
                      {copiedId === item.id ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {'isUserProject' in item && (
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className={`p-1.5 rounded-lg border transition ${
                          themeMode === 'night' 
                            ? 'bg-zinc-900 border-[#1b2b21] text-red-400 hover:bg-red-950/40' 
                            : 'bg-white border-[#c8dec8]/65 text-red-650 hover:text-red-700 hover:bg-red-50'
                        }`}
                        title="Delete Blueprint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </motion.div>
               ))}
            </div>

            {/* --- BOTTOM PROFILE CONTAINER SECURE PILLS --- */}
            <div className={`pt-4 border-t mt-3 flex items-center justify-between ${
              themeMode === 'night' ? 'border-[#112318]' : 'border-[#c8dec8]/40'
            }`}>
              
              {/* "Bahadar's Lovable" Pill Container with arrow */}
              <button className={`flex items-center space-x-2 border px-3.5 py-2 rounded-full transition text-left cursor-pointer active:scale-95 flex-1 max-w-[210px] mr-2 shadow-sm ${
                themeMode === 'night' 
                  ? 'bg-[#152a1e] border-emerald-900/30 text-emerald-400 hover:bg-[#152a1e]/40' 
                  : 'bg-[#f4f7f4] border-[#c8dec8]/60 hover:bg-[#e1efe8]/80 hover:border-[#244b3c]/30 text-[#2c5341]'
              }`}>
                <div className="w-7 h-7 rounded-full bg-pink-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md">
                  B
                </div>
                <span className={`text-[11.5px] font-semibold truncate tracking-tight pr-1 ${
                  themeMode === 'night' ? 'text-emerald-300' : 'text-[#1e4634]'
                }`}>
                  Bahadar's Lovable
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#5e7166] shrink-0 ml-auto" />
              </button>

              {/* Secure gray active secondary profile bubble with live green/red indicator dot */}
              <div className="relative cursor-pointer shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold tracking-wide shadow-sm ${
                  themeMode === 'night' 
                    ? 'bg-[#152a1e] border border-emerald-900/30 text-emerald-400' 
                    : 'bg-[#e1efe8] border border-[#c8dec8]/75 text-[#1e3d30]'
                }`}>
                  B
                </div>
                {/* Active live socket indicator bubble */}
                <div className={`absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 rounded-full ${
                  themeMode === 'night' ? 'border-[#0a0f0d]' : 'border-[#fdfefd]'
                }`} />
              </div>

            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
