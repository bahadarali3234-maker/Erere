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

export default function ShowcaseSection() {
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Content */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 mb-4 cursor-default">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[10.5px] font-mono tracking-widest text-emerald-300 uppercase font-semibold">
            Built with Erere Studio
          </span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-white leading-[1.15]">
          Discover blueprints brought to <br /> life by global creators
        </h2>
        <p className="mt-4 text-zinc-400 text-sm font-light leading-relaxed">
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
}

function Glass3DCard({ project, index, isHovered, onHoverActive, onHoverInactive, onLike }: Glass3DCardProps) {
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
      className="relative bg-zinc-950/45 hover:bg-zinc-900/60 border border-white/10 hover:border-emerald-500/20 rounded-[24px] p-5 flex flex-col justify-between min-h-[380px] shadow-[0_12px_24px_-10px_rgba(0,0,0,0.5)] transition-colors duration-300 cursor-pointer overflow-hidden group select-none"
    >
      
      {/* Glossy sheen swipe element traveling across the card when hovered. Highly GPU-efficient */}
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[120%] group-hover:translate-x-[120%] transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none z-10" />

      {/* Background radial highlight gradient tracking mouse rotation */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 12%, ${project.glowColor} 0%, rgba(0,0,0,0) 65%)`
        }}
      />

      {/* Embedded top brand header */}
      <div style={{ transform: 'translateZ(40px)' }} className="flex justify-between items-center mb-4">
        <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-500 bg-white/5 py-1 px-2.5 rounded-full border border-white/5">
          {project.category}
        </span>
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onLike(project.id);
          }}
          className="flex items-center space-x-1.5 opacity-60 hover:opacity-100 group-hover:opacity-100 transition-all bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 px-2.5 py-1 rounded-full border border-white/5 cursor-pointer active:scale-95"
          title="Vote for this design blueprint"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 group-hover:text-emerald-400" />
          <span className="font-mono text-[10px] font-bold">{project.likes}</span>
        </div>
      </div>

      {/* Main info text wrapper to maintain spatial integrity */}
      <div style={{ transform: 'translateZ(20px)' }} className="my-auto space-y-3">
        <h4 className="font-display font-semibold text-lg text-white group-hover:text-emerald-300 transition-colors tracking-tight">
          {project.title}
        </h4>
        <p className="text-zinc-400 text-xs font-light leading-relaxed min-h-[64px] line-clamp-3">
          {project.description}
        </p>

        {/* Technology/Attribute badge list */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {project.techBadge.map((tech, key) => (
            <span key={key} className="text-[9px] font-mono font-medium text-zinc-400 bg-zinc-900/80 border border-zinc-800/60 py-0.5 px-2 rounded-md">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Card footer details */}
      <div style={{ transform: 'translateZ(30px)' }} className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 text-[11px]">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[8.5px] text-zinc-300 font-bold border border-white/10">
            {project.author[0]}
          </div>
          <span className="text-zinc-400 font-medium">by {project.author}</span>
        </div>

        <div className="flex items-center space-x-1 font-mono text-zinc-500 group-hover:text-white transition-colors duration-250">
          <Eye className="w-3.5 h-3.5" />
          <span>{project.views}</span>
          <ChevronAction />
        </div>
      </div>

    </motion.div>
  );
}

function ChevronAction() {
  return (
    <div className="w-5 h-5 rounded-full bg-white/5 group-hover:bg-emerald-500 group-hover:text-zinc-950 flex items-center justify-center ml-1.5 transition-all">
      <ExternalLink className="w-2.5 h-2.5" />
    </div>
  );
}
