import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc, 
  query, 
  where,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { UserProject } from '../components/MyProjectsDrawer';

export interface FirebaseProject extends UserProject {
  isTemplate: boolean;
  ownerId: string;
  avatarBg: string;
  iconCode: string;
}

export interface ShowcaseProject {
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

const PROJECTS_PATH = 'projects';
const SHOWCASE_PATH = 'showcase';

// Static template blueprints matching MyProjectsDrawer screenshot expectations
const SCREENSHOT_DEFAULTS = [
  {
    id: 'default-1',
    title: 'Prompt Architect',
    prompt: 'a premium visual prompt builder with live dynamic JSON config output',
    createdAt: '2 hours ago',
    avatarBg: 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500',
    iconCode: 'PA',
    status: 'Ready' as const,
    techStack: ['JSON', 'React', 'Tailwind'],
    viewsCount: 120,
    isTemplate: true,
    ownerId: 'system'
  },
  {
    id: 'default-2',
    title: 'UI Mirror',
    prompt: 'a high-fidelity mirror sync client showing cross-platform devices simultaneously',
    createdAt: '14 hours ago',
    avatarBg: 'bg-gradient-to-tr from-blue-700 via-teal-500 to-emerald-400',
    iconCode: 'UI',
    status: 'Ready' as const,
    techStack: ['Tailwind v4', 'Framer Motion'],
    viewsCount: 89,
    isTemplate: true,
    ownerId: 'system'
  },
  {
    id: 'default-3',
    title: 'Aura Portal',
    prompt: 'a dark cybernetic landing page with responsive audio waveforms and visual telemetry lines',
    createdAt: '14 hours ago',
    avatarBg: 'bg-gradient-to-tr from-amber-500 via-red-500 to-pink-600',
    iconCode: 'AP',
    status: 'Ready' as const,
    techStack: ['Audio API', 'Canvas API'],
    viewsCount: 247,
    isTemplate: true,
    ownerId: 'system'
  },
  {
    id: 'default-4',
    title: 'Cloudburst Launcher',
    prompt: 'an elegant cloud deployment terminal to boot up containers in under 12 seconds with live telemetry log lines',
    createdAt: '1 May 2026',
    avatarBg: 'bg-gradient-to-tr from-[#111] to-[#333]',
    iconCode: 'CL',
    status: 'Maintained' as const,
    techStack: ['React', 'K8s', 'WebSockets'],
    viewsCount: 310,
    isTemplate: true,
    ownerId: 'system'
  },
  {
    id: 'default-5',
    title: 'Cloud Play Launcher',
    prompt: 'a minimalist instant streaming games arcade client with physics simulation engine',
    createdAt: '30 Apr 2026',
    avatarBg: 'bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700',
    iconCode: 'CP',
    status: 'Ready' as const,
    techStack: ['Phaser.js', 'Vite'],
    viewsCount: 154,
    isTemplate: true,
    ownerId: 'system'
  },
  {
    id: 'default-6',
    title: 'Creative Canvas AI',
    prompt: 'a vector sketch editor with background canvas generators and grid layouts',
    createdAt: '1 May 2026',
    avatarBg: 'bg-gradient-to-tr from-white via-zinc-200 to-slate-400 text-zinc-950 font-bold',
    iconCode: 'CC',
    status: 'Ready' as const,
    techStack: ['D3.js', 'Gemini AI'],
    viewsCount: 423,
    isTemplate: true,
    ownerId: 'system'
  },
  {
    id: 'default-7',
    title: 'Aura Nexus',
    prompt: 'a graphical grid overview linking cloud databases with visual query nodes',
    createdAt: '1 May 2026',
    avatarBg: 'bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-950 border border-zinc-700',
    iconCode: 'AN',
    status: 'Ready' as const,
    techStack: ['Graph.js', 'Firebase'],
    viewsCount: 180,
    isTemplate: true,
    ownerId: 'system'
  }
];

// Showcase templates displaying in the landing grid deck
const SHOWCASE_DEFAULTS: ShowcaseProject[] = [
  {
    id: 'fintech-ledger',
    title: 'Ledgers Pro',
    category: 'Fintech Dashboard',
    author: 'Ayesha Khan',
    likes: 342,
    views: '4.8k',
    glowColor: 'rgba(16, 185, 129, 0.2)',
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
    glowColor: 'rgba(59, 130, 246, 0.2)',
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
    glowColor: 'rgba(139, 92, 246, 0.2)',
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
    glowColor: 'rgba(236, 72, 153, 0.2)',
    description: 'An retro-futuristic audio synth sequencer alongside a 60fps canvas space with physics rendering.',
    techBadge: ['HTML5 Canvas', 'Web Audio API', 'Physics.js']
  }
];

/**
 * Seeding helper function to prefill Firestore collections with initial templates to guarantee 
 * the requirement: "The templates that are showing will also be saved. All the data will be saved in Firebase"
 */
export async function seedDefaultDbData() {
  try {
    // 1. Seed global sidebar templates
    const templatesQuery = query(collection(db, PROJECTS_PATH), where('isTemplate', '==', true));
    const querySnapshot = await getDocs(templatesQuery);
    
    if (querySnapshot.empty) {
      console.log('Seeding sidebar templates to Firestore...');
      for (const item of SCREENSHOT_DEFAULTS) {
        const itemDocRef = doc(db, PROJECTS_PATH, item.id);
        await setDoc(itemDocRef, item);
      }
    }

    // 2. Seed landing deck showcase projects
    const showcaseSnap = await getDocs(collection(db, SHOWCASE_PATH));
    if (showcaseSnap.empty) {
      console.log('Seeding landing showcase items to Firestore...');
      for (const item of SHOWCASE_DEFAULTS) {
        const itemDocRef = doc(db, SHOWCASE_PATH, item.id);
        await setDoc(itemDocRef, item);
      }
    }
  } catch (error) {
    // Gracefully report seeding errors during local testing
    console.warn('Seeding failed (expected if rules deny public seeding direct write, or connection issues):', error);
  }
}

/**
 * Load template projects from Firestore (publicly accessible)
 */
export async function getSidebarTemplates(): Promise<FirebaseProject[]> {
  try {
    const templatesQuery = query(collection(db, PROJECTS_PATH), where('isTemplate', '==', true));
    const snap = await getDocs(templatesQuery);
    if (snap.empty) {
      return SCREENSHOT_DEFAULTS.map(t => ({ ...t, isTemplate: true }));
    }
    return snap.docs.map(doc => doc.data() as FirebaseProject);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PROJECTS_PATH);
    return [];
  }
}

/**
 * Load user projects from Firestore
 */
export async function getUserProjectsFromDb(userId: string): Promise<UserProject[]> {
  try {
    const userQuery = query(
      collection(db, PROJECTS_PATH), 
      where('isTemplate', '==', false),
      where('ownerId', '==', userId)
    );
    const snap = await getDocs(userQuery);
    return snap.docs.map(doc => doc.data() as UserProject);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `${PROJECTS_PATH} [ownerId: ${userId}]`);
    return [];
  }
}

/**
 * Save user design as a personal project doc
 */
export async function createUserProjectInDb(project: UserProject, userId: string): Promise<void> {
  const path = `${PROJECTS_PATH}/${project.id}`;
  try {
    const payload: FirebaseProject = {
      ...project,
      isTemplate: false,
      ownerId: userId,
      avatarBg: 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400',
      iconCode: project.title.substring(0, 2).toUpperCase()
    };
    await setDoc(doc(db, PROJECTS_PATH, project.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Update project viewsCount or metadata in Firestore
 */
export async function updateProjectInDb(projectId: string, updateData: Partial<UserProject>, userId: string): Promise<void> {
  const path = `${PROJECTS_PATH}/${projectId}`;
  try {
    const docRef = doc(db, PROJECTS_PATH, projectId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete a custom project from Firebase Firestore
 */
export async function deleteUserProjectFromDb(projectId: string, userId: string): Promise<void> {
  const path = `${PROJECTS_PATH}/${projectId}`;
  try {
    await deleteDoc(doc(db, PROJECTS_PATH, projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Get dynamic landing deck showcase cards
 */
export async function getShowcaseCardsFromDb(): Promise<ShowcaseProject[]> {
  try {
    const snap = await getDocs(collection(db, SHOWCASE_PATH));
    if (snap.empty) {
      return SHOWCASE_DEFAULTS;
    }
    return snap.docs.map(doc => doc.data() as ShowcaseProject);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, SHOWCASE_PATH);
    return [];
  }
}

/**
 * Star or like a showcase item from the deck
 */
export async function incrementLikesInDb(showcaseId: string, newLikesCount: number): Promise<void> {
  const path = `${SHOWCASE_PATH}/${showcaseId}`;
  try {
    const docRef = doc(db, SHOWCASE_PATH, showcaseId);
    await updateDoc(docRef, { likes: newLikesCount });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
