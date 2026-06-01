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
}

export default function PlusMenu({ onSelectOption, onClose }: PlusMenuProps) {
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
      className="absolute bottom-full left-0 mb-3 w-[340px] bg-[#121614] border border-[#27352e] rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-[40]"
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
            <div className="relative flex items-center bg-[#1c221f] rounded-xl px-3 py-2 border border-[#27352e] focus-within:border-emerald-500/50 transition">
              <Search className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white font-sans text-[13.5px] focus:outline-none placeholder-zinc-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="text-[10px] text-zinc-500 hover:text-white"
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
                const itemClass = isAttach 
                  ? "flex items-center justify-between w-full p-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/10 cursor-pointer hover:bg-blue-500 transition-all active:scale-[0.99]"
                  : "flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-[#1a221e] text-zinc-300 hover:text-white cursor-pointer transition-all active:scale-[0.99] group";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as any)}
                    className={itemClass}
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className={`p-1.5 rounded-lg ${isAttach ? 'bg-[#ffffff]/15 text-white' : 'bg-zinc-900/40 text-emerald-400 group-hover:text-emerald-300'} transition`}>
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="font-sans font-medium text-[13.5px]">{item.label}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isAttach ? 'text-blue-200' : 'text-zinc-600 group-hover:text-zinc-400'} transition`} />
                  </button>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="text-center py-6 text-zinc-500 text-xs">
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
            <div className="flex items-center justify-between border-b border-[#27352e] pb-3 mb-2.5">
              <button 
                onClick={() => setActiveTab('root')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
              >
                <span>← Back to Menu</span>
              </button>
              <span className="text-xs text-zinc-500 font-mono tracking-wider uppercase font-semibold">
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
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#1a221e] border border-transparent hover:border-emerald-500/15 text-zinc-300 hover:text-white transition group flex items-start space-x-2.5"
                >
                  <div className="bg-emerald-500/5 group-hover:bg-emerald-500/10 p-1.5 rounded text-emerald-400 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="font-sans text-[12.5px] font-medium leading-snug">{opt.label}</div>
                    <div className="text-[10px] text-zinc-500 group-hover:text-zinc-400 mt-0.5 font-mono line-clamp-1">
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
      <div className="bg-[#0b0e0c] px-3.5 py-2 border-t border-[#27352e] flex items-center justify-between text-[10px] text-zinc-500">
        <span>Erere Blueprint Assistant</span>
        <button onClick={onClose} className="hover:text-white">Close</button>
      </div>
    </motion.div>
  );
}
