import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Paperclip, 
  Palette, 
  GitFork, 
  Database, 
  ChevronRight,
  Sparkles,
  Layers,
  FileImage,
  Cpu,
  Bookmark
} from 'lucide-react';

interface PlusMenuProps {
  onSelectOption: (optionText: string) => void;
  onClose: () => void;
  themeMode?: string;
}

export default function PlusMenu({ onSelectOption, onClose, themeMode = 'afternoon' }: PlusMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'root' | 'attach' | 'design' | 'connectors' | 'databases'>('root');

  const menuItems = [
    {
      id: 'attach',
      label: 'Attach',
      icon: Paperclip,
      description: 'Upload local source files, styling specs, and visual layouts',
      subOptions: [
        { label: 'Mockup Wireframe (PNG/JPG)', text: 'with visual branding mockup uploaded as a UI baseline' },
        { label: 'Code File / Schema Definitions', text: 'using clean database models defined in prisma schemas' },
        { label: 'JSON Dataset Payload', text: 'backed by real-world mock JSON array records' }
      ]
    },
    {
      id: 'design',
      label: 'Design',
      icon: Palette,
      description: 'Define exact visual directions, themes, and branding aesthetics',
      subOptions: [
        { label: 'Warm Obsidian Dark Mode', text: 'featuring luxurious absolute blacks (#000) and amber accents' },
        { label: 'Minimalist Apple-style Paper', text: 'focusing on pristine off-whites, heavy borders, and Inter font' },
        { label: 'High-contrast Cyberpunk Terminal', text: 'infused with emerald-green glowing text blocks and black containers' },
        { label: 'Brutalist Editorial Swiss Layout', text: 'featuring bold grotesque display sans-serif fonts and solid thick borders' }
      ]
    },
    {
      id: 'connectors',
      label: 'Connectors',
      icon: GitFork,
      description: 'Integrate external services and cloud capabilities',
      subOptions: [
        { label: 'Google Workspace Sync', text: 'real-time integrations with Gmail, Sheets, Calendar, APIs' },
        { label: 'Stripe Payment Gateway', text: 'incorporating instant transactional checkout flows' },
        { label: 'Firebase Cloud Storage', text: 'using Google Firestore for real-time state durability' },
        { label: 'Gemini Agent Intelligence', text: 'with smart semantic auto-summarization capabilities' }
      ]
    },
    {
      id: 'databases',
      label: 'Databases',
      icon: Database,
      description: 'Instantiate stable database entities and schema constraints',
      subOptions: [
        { label: 'Firestore Document Collection', text: 'using lightning-fast document keys' },
        { label: 'Relational Cloud SQL (Postgres)', text: 'with structured high-integrity relational links' },
        { label: 'Local Encrypted SQLite Cache', text: 'using device-local secure key-value stores' }
      ]
    }
  ];

  const filteredItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 10 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`absolute bottom-full left-0 mb-3 w-[340px] border rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-[40] transition-colors duration-1000 ${
        themeMode === 'night' 
          ? 'bg-[#0f1411]/95 border-[#1b2b21]' 
          : themeMode === 'sunset' 
          ? 'bg-[#fdf3e9]/95 border-[#eed4c5]' 
          : 'bg-[#fcfdfc]/95 border border-[#c8dec8]'
      }`}
    >
      {/* Dynamic Animated Menu State */}
      <AnimatePresence mode="wait">
        {activeTab === 'root' ? (
          <motion.div
            key="root-menu"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="p-3 space-y-2.5"
          >
            {/* Search Input exactly mimicking the layout */}
            <div className={`relative flex items-center rounded-xl px-3 py-2 border transition ${
              themeMode === 'night' 
                ? 'bg-zinc-950/50 border-emerald-950/40 focus-within:border-emerald-500' 
                : themeMode === 'sunset'
                ? 'bg-[#feeadd]/60 border-[#f3cfb6] focus-within:border-[#ca5a27]'
                : 'bg-[#f4f7f4] border border-[#c8dec8]/70 focus-within:border-[#244b3c]'
            }`}>
              <Search className="w-4 h-4 text-[#5e7166] mr-2 shrink-0" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent font-sans text-[13.5px] focus:outline-none ${
                  themeMode === 'night' 
                    ? 'text-zinc-100 placeholder-zinc-500/80' 
                    : themeMode === 'sunset'
                    ? 'text-orange-950 placeholder-orange-900/40'
                    : 'text-[#1e3d30] placeholder-[#5e7166]/50'
                }`}
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')} 
                  className={`text-[10px] ${
                    themeMode === 'night' 
                      ? 'text-zinc-450 hover:text-emerald-400' 
                      : themeMode === 'sunset'
                      ? 'text-[#ca5a27] hover:text-orange-950'
                      : 'text-[#5e7166] hover:text-[#1e3d30]'
                  }`}
                >
                  Clear
                </button>
              )}
            </div>

            {/* List items with exact styling */}
            <div className="space-y-1">
              {filteredItems.map((item) => {
                const IconComponent = item.icon;
                
                // Attach has the spectacular highlighted modern brand design as in reference (vibrant royal blue)
                const isAttach = item.id === 'attach';
                let itemClass = '';
                if (isAttach) {
                  itemClass = themeMode === 'night'
                    ? "flex items-center justify-between w-full p-2.5 rounded-xl bg-emerald-900 text-zinc-100 shadow-lg shadow-emerald-950/30 cursor-pointer hover:bg-emerald-800 transition-all active:scale-[0.99]"
                    : themeMode === 'sunset'
                    ? "flex items-center justify-between w-full p-2.5 rounded-xl bg-[#ca5a27] text-white shadow-lg shadow-orange-900/10 cursor-pointer hover:bg-[#b04b1e] transition-all active:scale-[0.99]"
                    : "flex items-center justify-between w-full p-2.5 rounded-xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/10 cursor-pointer hover:bg-emerald-800 transition-all active:scale-[0.99]";
                } else {
                  itemClass = themeMode === 'night'
                    ? "flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-emerald-950/20 text-zinc-300 hover:text-emerald-400 cursor-pointer transition-all active:scale-[0.99] group"
                    : themeMode === 'sunset'
                    ? "flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-[#f3cfb6]/35 text-orange-950 hover:text-[#4c2409] cursor-pointer transition-all active:scale-[0.99] group"
                    : "flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-[#e1efe8]/50 text-[#2c5341] hover:text-[#1e3d30] cursor-pointer transition-all active:scale-[0.99] group";
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as any)}
                    className={itemClass}
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className={`p-1.5 rounded-lg ${
                        isAttach 
                          ? 'bg-[#ffffff]/15 text-white' 
                          : themeMode === 'night'
                          ? 'bg-zinc-900 text-emerald-400 group-hover:bg-[#152a1e]' 
                          : themeMode === 'sunset'
                          ? 'bg-[#feeadd] text-[#ca5a27]'
                          : 'bg-[#f4f7f4] text-emerald-700 group-hover:bg-[#e1efe8]'
                      } transition`}>
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="font-sans font-medium text-[13.5px]">{item.label}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${
                      isAttach 
                        ? 'text-emerald-100' 
                        : themeMode === 'night'
                        ? 'text-zinc-550 group-hover:text-emerald-400'
                        : 'text-[#5e7166] group-hover:text-[#1e3d30]'
                    } transition`} />
                  </button>
                );
              })}

              {filteredItems.length === 0 && (
                <div className={`text-center py-6 text-xs ${
                  themeMode === 'night' ? 'text-zinc-500' : themeMode === 'sunset' ? 'text-orange-950/50' : 'text-[#5e7166]'
                }`}>
                  No attributes found for "{searchQuery}"
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // Submenus with nesting capabilities
          <motion.div
            key="submenu"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            className="p-3"
          >
            {/* Header of submenu */}
            <div className={`flex items-center justify-between border-b pb-3 mb-2.5 ${
              themeMode === 'night' ? 'border-[#1b2b21]' : themeMode === 'sunset' ? 'border-[#eed4c5]/55' : 'border-[#c8dec8]/50'
            }`}>
              <button 
                type="button"
                onClick={() => setActiveTab('root')}
                className={`text-xs font-medium flex items-center space-x-1 ${
                  themeMode === 'night' 
                    ? 'text-emerald-450 hover:text-emerald-350' 
                    : themeMode === 'sunset'
                    ? 'text-[#ca5a27] hover:text-[#4c2409]'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <span>← Back to Menu</span>
              </button>
              <span className={`text-xs font-mono tracking-wider uppercase font-semibold ${
                themeMode === 'night' ? 'text-zinc-500' : themeMode === 'sunset' ? 'text-orange-950/60' : 'text-[#5e7166]'
              }`}>
                {activeTab}
              </span>
            </div>

            {/* List options inside category to merge onto prompt */}
            <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
              {menuItems.find(item => item.id === activeTab)?.subOptions.map((opt, key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onSelectOption(opt.text);
                    setActiveTab('root');
                    onClose();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border border-transparent transition group flex items-start space-x-2.5 ${
                    themeMode === 'night'
                      ? 'hover:bg-emerald-950/20 hover:border-emerald-500/10 text-zinc-300 hover:text-emerald-400'
                      : themeMode === 'sunset'
                      ? 'hover:bg-[#feeadd]/50 hover:border-orange-500/15 text-orange-950 hover:text-orange-700'
                      : 'hover:bg-[#e1efe8]/40 hover:border-[#244b3c]/15 text-[#2c5341] hover:text-[#1e3d30]'
                  }`}
                >
                  <div className={`p-1.5 rounded mt-0.5 transition-colors ${
                    themeMode === 'night'
                      ? 'bg-emerald-950 text-emerald-450 group-hover:bg-emerald-900 group-hover:text-emerald-300'
                      : themeMode === 'sunset'
                      ? 'bg-[#feeadd] text-[#ca5a27] group-hover:bg-[#f3cfb6] group-hover:text-orange-900'
                      : 'bg-[#e1efe8] text-emerald-700 group-hover:bg-[#def5ea]'
                  }`}>
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="font-sans text-[12.5px] font-medium leading-snug">{opt.label}</div>
                    <div className={`text-[10px] mt-0.5 font-mono line-clamp-1 transition-colors ${
                      themeMode === 'night'
                        ? 'text-zinc-500 group-hover:text-emerald-450'
                        : themeMode === 'sunset'
                        ? 'text-orange-900/60 group-hover:text-orange-850'
                        : 'text-[#5e7166] group-hover:text-[#2c5341]'
                    }`}>
                      {opt.text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer hint */}
      <div className={`px-3.5 py-2 border-t flex items-center justify-between text-[10px] ${
        themeMode === 'night' 
          ? 'bg-[#0a0e0b] border-[#1b2b21] text-zinc-500' 
          : themeMode === 'sunset'
          ? 'bg-[#feeadd]/35 border-[#eed4c5]/50 text-orange-950/70'
          : 'bg-[#f4f7f4] border-[#c8dec8]/50 text-[#5e7166]'
      }`}>
        <span>Erere Blueprint Assistant</span>
        <button type="button" onClick={onClose} className="hover:text-emerald-450 font-medium">Close</button>
      </div>
    </motion.div>
  );
}
