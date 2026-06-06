import React, { useState, useRef, MouseEvent, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ExternalLink, 
  Sparkles, 
  Users, 
  Heart, 
  Eye, 
  Layers, 
  Workflow, 
  Flame,
  MousePointerClick
} from 'lucide-react';
import { getShowcaseCardsFromDb, incrementLikesInDb } from '../lib/projectsService';

interface AppShowcaseItem {
  id: string;
  title: string;
  category: string;
  author: string;
  likes: number;
  views: string;
  glowColor: string;
  description: string;
  techBadge: string[];
}

export default function ShowcaseSection({ themeMode = 'afternoon' }: { themeMode?: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [cards, setCards] = useState<AppShowcaseItem[]>([]);

  const showcaseProjects: AppShowcaseItem[] = [
    {
      id: 'fintech-ledger',
      title: 'Ledgers Pro',
      category: 'Fintech Dashboard',
      author: 'Ayesha Khan',
      likes: 342,
      views: '4.8k',
      glowColor: 'rgba(16, 185, 129, 0.2)', // Emerald
      description: 'A flawless multi-currency transaction tracker featuring responsive custom micro-charts and secure JWT sessions.',
      techBadge: ['React v19', 'Recharts', 'Prisma Schema']
    },
    {
      id: 'nouveau-chic',
      title: 'Nouveau Chic',
      category: 'E-Commerce Storefront',
      author: 'Liam Miller',
      likes: 512,
      views: '7.2k',
      glowColor: 'rgba(59, 130, 246, 0.2)', // Royal Blue
      description: 'A high-end luxury lifestyle apparel catalog with Apple-inspired grid alignment and staggered visual item reveals.',
      techBadge: ['Tailwind v4', 'Framer Motion', 'Web Auth']
    },
    {
      id: 'quantum-board',
      title: 'Quantum Board',
      category: 'Project Management',
      author: 'DevOnFire',
      likes: 289,
      views: '3.1k',
      glowColor: 'rgba(139, 92, 246, 0.2)', // Purple
      description: 'An immersive Kanban scheduler with nested lists, automated task summaries powered by Gemini API, and SQLite caching.',
      techBadge: ['Gemini SDK', 'SQLite', 'WebSockets']
    },
    {
      id: 'arcade-retro',
      title: 'SynthArcade',
      category: 'Canvas Game Workspace',
      author: 'Bahadar Ali',
      likes: 890,
      views: '12.4k',
      glowColor: 'rgba(236, 72, 153, 0.2)', // Hot Pink
      description: 'An retro-futuristic audio synth sequencer alongside a 60fps canvas space with physics rendering.',
      techBadge: ['HTML5 Canvas', 'Web Audio API', 'Physics.js']
    }
  ];

  useEffect(() => {
    getShowcaseCardsFromDb()
      .then(items => {
        if (items && items.length > 0) {
          setCards(items as AppShowcaseItem[]);
        } else {
          setCards(showcaseProjects);
        }
      })
      .catch(err => {
        console.warn("Firestore showcase fallback active:", err);
        setCards(showcaseProjects);
      });
  }, []);

  const handleLike = async (id: string) => {
    const updated = cards.map(c => {
      if (c.id === id) {
        return { ...c, likes: c.likes + 1 };
      }
      return c;
    });
    setCards(updated);

    const targetProject = updated.find(c => c.id === id);
    if (targetProject) {
      try {
        await incrementLikesInDb(id, targetProject.likes);
      } catch (err) {
        console.error("Failed to persist showcase like count in Firestore:", err);
      }
    }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-20">
      
      {/* Decorative glass glow backdrops */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${
        themeMode === 'night' ? 'bg-emerald-500/5' : 'bg-emerald-700/5'
      } rounded-full blur-[120px] pointer-events-none`} />

      {/* Header Content */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border mb-4 cursor-default transition-all duration-1000 ${
          themeMode === 'night' 
            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300' 
            : themeMode === 'sunset'
            ? 'bg-[#feeadd]/70 border-[#f3cfb6] text-[#ca5a27]'
            : 'bg-[#def5ea]/80 border-[#b2e5cc]/55 text-emerald-800'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="text-[10.5px] font-mono tracking-widest uppercase font-semibold">
            Built with Erere Studio
          </span>
        </div>
        
        <h2 className={`text-3xl sm:text-4xl font-display font-semibold tracking-tight leading-[1.15] transition-colors duration-1000 ${
          themeMode === 'night' ? 'text-zinc-100' : themeMode === 'sunset' ? 'text-[#4c2409]' : 'text-[#1e3d30]'
        }`}>
          Discover blueprints brought to <br /> life by global creators
        </h2>
        <p className={`mt-4 text-sm font-light leading-relaxed transition-colors duration-1000 ${
          themeMode === 'night' ? 'text-zinc-400' : themeMode === 'sunset' ? 'text-orange-900/75' : 'text-[#5e7166]'
        }`}>
          Stunning client-facing web applications generated, compiled, and deployed by users instantly. Check out their 3D layouts below.
        </p>
      </div>

      {/* Interactive 3D Glassmorphic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((project, idx) => (
          <Glass3DCard 
            key={project.id} 
            project={project} 
            index={idx}
            isHovered={hoveredIndex === idx}
            onHoverActive={() => setHoveredIndex(idx)}
            onHoverInactive={() => setHoveredIndex(null)}
            onLike={handleLike}
            themeMode={themeMode}
          />
        ))}
      </div>
    </section>
  );
}

/* Sub-component for individual 3D Parallax Glassmorphism */
interface Glass3DCardProps {
  key?: string;
  project: AppShowcaseItem;
  index: number;
  isHovered: boolean;
  onHoverActive: () => void;
  onHoverInactive: () => void;
  onLike: (id: string) => void;
  themeMode?: string;
}

function Glass3DCard({ project, index, isHovered, onHoverActive, onHoverInactive, onLike, themeMode = 'afternoon' }: Glass3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Center coordinates
    const mx = e.clientX - rect.left - width / 2;
    const my = e.clientY - rect.top - height / 2;

    // Angle limits (max 15 degrees)
    const angleX = -(my / height) * 20;
    const angleY = (mx / width) * 20;

    setRotX(angleX);
    setRotY(angleY);
  };

  const handleMouseLeave = () => {
    setRotX(0);
    setRotY(0);
    onHoverInactive();
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={onHoverActive}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 800,
        transform: `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`
      }}
      className={`relative border rounded-[24px] p-5 flex flex-col justify-between min-h-[380px] transition-all duration-300 cursor-pointer overflow-hidden group select-none ${
        themeMode === 'night'
          ? 'bg-[#0f1411]/90 hover:bg-[#141b17]/95 border-[#1b2b21] hover:border-emerald-500/35 text-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
          : themeMode === 'sunset'
          ? 'bg-[#fff6f1]/90 hover:bg-[#fff9f5]/95 border-[#eed4c5]/70 hover:border-orange-500/25 text-[#4c2409] shadow-[0_8px_20px_-10px_rgba(202,90,39,0.06)]'
          : 'bg-white/85 hover:bg-white/95 border-[#c8dec8]/45 hover:border-[#244b3c]/25 text-[#1e3d30] shadow-[0_8px_20px_-10px_rgba(36,75,60,0.06)] hover:shadow-[0_12px_24px_-10px_rgba(36,75,60,0.12)]'
      }`}
    >
      
      {/* Glossy sheen swipe element traveling across the card when hovered. Highly GPU-efficient */}
      <div className={`absolute inset-0 w-[200%] h-full -translate-x-[120%] group-hover:translate-x-[120%] transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none z-10 ${
        themeMode === 'night' 
          ? 'bg-gradient-to-r from-transparent via-emerald-800/10 to-transparent' 
          : 'bg-gradient-to-r from-transparent via-[#def5ea]/30 to-transparent'
      }`} />

      {/* Background radial highlight gradient tracking mouse rotation */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 12%, ${project.glowColor.replace('0.2', '0.08')} 0%, rgba(0,0,0,0) 65%)`
        }}
      />

      {/* Embedded top brand header */}
      <div style={{ transform: 'translateZ(40px)' }} className="flex justify-between items-center mb-4">
        <span className={`text-[10px] uppercase font-mono tracking-wider font-semibold py-1 px-2.5 rounded-full border ${
          themeMode === 'night'
            ? 'text-emerald-400 bg-emerald-950/40 border-emerald-850/40'
            : themeMode === 'sunset'
            ? 'text-[#ca5a27] bg-[#feeadd]/70 border-[#f3cfb6]'
            : 'text-[#1e4634] bg-[#def5ea]/60 border-[#b2e5cc]/35'
        }`}>
          {project.category}
        </span>
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onLike(project.id);
          }}
          className={`flex items-center space-x-1.5 opacity-80 hover:opacity-100 group-hover:opacity-100 transition-all px-2.5 py-1 rounded-full border cursor-pointer active:scale-95 ${
            themeMode === 'night'
              ? 'bg-emerald-950/30 border-emerald-850/30 text-emerald-400'
              : themeMode === 'sunset'
              ? 'bg-[#feeadd]/50 border-[#f3cfb6]/50 text-[#ca5a27]'
              : 'bg-[#def5ea]/40 hover:bg-[#def5ea]/80 text-[#1e4634] border-[#b2e5cc]/30'
          }`}
          title="Vote for this design blueprint"
        >
          <Flame className={`w-3.5 h-3.5 fill-amber-500/10 ${themeMode === 'night' ? 'text-shadow text-emerald-400' : 'text-amber-600'}`} />
          <span className="font-mono text-[10px] font-bold">{project.likes}</span>
        </div>
      </div>

      {/* Main info text wrapper to maintain spatial integrity */}
      <div style={{ transform: 'translateZ(20px)' }} className="my-auto space-y-3">
        <h4 className={`font-display font-semibold text-lg transition-colors tracking-tight ${
          themeMode === 'night'
            ? 'text-zinc-100 group-hover:text-emerald-400'
            : themeMode === 'sunset'
            ? 'text-[#4c2409] group-hover:text-orange-600'
            : 'text-[#1e3d30] group-hover:text-[#244b3c]'
        }`}>
          {project.title}
        </h4>
        <p className={`text-xs font-light leading-relaxed min-h-[64px] line-clamp-3 ${
          themeMode === 'night' ? 'text-zinc-400' : themeMode === 'sunset' ? 'text-orange-950/70' : 'text-[#5e7166]'
        }`}>
          {project.description}
        </p>

        {/* Technology/Attribute badge list */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {project.techBadge.map((tech, key) => (
            <span key={key} className={`text-[9px] font-mono font-semibold py-0.5 px-2 rounded-md border ${
              themeMode === 'night'
                ? 'text-emerald-300 bg-emerald-950/40 border-emerald-850/40'
                : themeMode === 'sunset'
                ? 'text-[#ca5a27] bg-[#feeadd]/40 border-[#eed4c5]/40'
                : 'text-[#2c5341] bg-[#e1efe8]/60 border-[#c8dec8]/50'
            }`}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Card footer details */}
      <div style={{ transform: 'translateZ(30px)' }} className={`flex items-center justify-between border-t pt-4 mt-4 text-[11px] ${
        themeMode === 'night' ? 'border-emerald-950/40' : themeMode === 'sunset' ? 'border-[#eed4c5]/30' : 'border-[#c8dec8]/25'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8.5px] font-bold border ${
            themeMode === 'night'
              ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
              : themeMode === 'sunset'
              ? 'bg-[#feeadd] border-[#f3cfb6] text-[#ca5a27]'
              : 'bg-[#e1efe8] border-[#c8dec8]/40 text-[#1e4634]'
          }`}>
            {project.author[0]}
          </div>
          <span className={`font-medium font-sans ${
            themeMode === 'night' ? 'text-zinc-400' : themeMode === 'sunset' ? 'text-orange-950/75' : 'text-[#5e7166]'
          }`}>by {project.author}</span>
        </div>

        <div className={`flex items-center space-x-1 font-mono transition-colors duration-250 ${
          themeMode === 'night' ? 'text-zinc-400 group-hover:text-emerald-400' : themeMode === 'sunset' ? 'text-orange-950/70 group-hover:text-orange-600' : 'text-[#5e7166] group-hover:text-[#1e3d30]'
        }`}>
          <Eye className="w-3.5 h-3.5" />
          <span>{project.views}</span>
          <ChevronAction themeMode={themeMode} />
        </div>
      </div>

    </motion.div>
  );
}

function ChevronAction({ themeMode }: { themeMode?: string }) {
  return (
    <div className={`w-5 h-5 rounded-full flex items-center justify-center ml-1.5 transition-all ${
      themeMode === 'night'
        ? 'bg-emerald-950/50 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-zinc-950'
        : themeMode === 'sunset'
        ? 'bg-[#feeadd]/60 text-[#ca5a27] group-hover:bg-[#ca5a27] group-hover:text-white'
        : 'bg-[#def5ea]/60 group-hover:bg-[#244b3c] group-hover:text-white'
    }`}>
      <ExternalLink className="w-2.5 h-2.5" />
    </div>
  );
}
