import React, { useState, FormEvent, useEffect, useRef, TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Play, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Search, 
  ChevronRight, 
  Bot, 
  User as UserIcon, 
  Layers, 
  Database, 
  Cpu, 
  Settings, 
  MessageSquare,
  RotateCcw,
  Copy,
  Edit2,
  Square,
  Network,
  Bell,
  Check,
  Send,
  MoreVertical,
  Download,
  AlertCircle,
  Code,
  Info,
  Layers3,
  ListTodo,
  TrendingDown,
  DollarSign,
  PlusCircle,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Wifi,
  History,
  CheckSquare,
  ChevronDown,
  Globe,
  Activity,
  Contrast,
  Sun,
  Moon,
  CloudSun,
  Sunset,
  Clock,
  Brain,
  Mic,
  Boxes,
  Zap,
  ArrowUp
} from 'lucide-react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import LoginModal from './components/LoginModal';
import PlusMenu from './components/PlusMenu';
import VoiceSTT from './components/VoiceSTT';
import ShowcaseSection from './components/ShowcaseSection';
import MyProjectsDrawer, { UserProject } from './components/MyProjectsDrawer';
import { ThemeMode, themes, getThemeForHour } from './theme';
// @ts-expect-error - image asset import declaration suppression for Vite
import bgImage from './assets/images/sand_cave_background_1780675270963.png';
// @ts-expect-error - image asset import declaration suppression for Vite
import nightBgImage from './assets/images/cave_moon_background_1780298528427.png';
import { 
  seedDefaultDbData, 
  getUserProjectsFromDb, 
  createUserProjectInDb, 
  deleteUserProjectFromDb 
} from './lib/projectsService';

// Shared Interface Types
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  checklist?: string[];
  fileAttachment?: { name: string; size: string };
  isCustomLovableCard?: boolean;
}

interface ToDoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Expense {
  id: string;
  text: string;
  amount: number;
  type: 'income' | 'expense';
}

interface Workout {
  id: string;
  type: string;
  detail: string;
  icon: string;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'Chat' | 'Dashboard' | 'Screens' | 'Components' | 'Database' | 'Logic' | 'Settings'>('Chat');
  const [activeScreen, setActiveScreen] = useState<'fitness' | 'expenses' | 'todo' | 'saas'>('fitness');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time AI architect and Toast state metrics
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };
  
  // Mobile responsive layout states
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileSubTab, setMobileSubTab] = useState<'chat' | 'preview'>('chat');
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem('hideWelcomeScreen') !== 'true';
  });
  
  // Custom metadata variables
  const [appTitle, setAppTitle] = useState('BuildCraft');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState('');
  
  // Auth states
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Custom interactive system parameters from Erere-main
  const [themeMode, setThemeMode] = useState<ThemeMode>('afternoon');
  const [isAutoTheme, setIsAutoTheme] = useState(true);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPromptFocused, setIsPromptFocused] = useState(false);
  
  // Custom workspace parameters matching exact design requests
  const [isChatPlusMenuOpen, setIsChatPlusMenuOpen] = useState(false);
  const [isChatVoiceActive, setIsChatVoiceActive] = useState(false);
  const [isChatPromptFocused, setIsChatPromptFocused] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isUiMirrorDropdownOpen, setIsUiMirrorDropdownOpen] = useState(false);
  const [isThoughtsExpanded, setIsThoughtsExpanded] = useState(true);
  
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  // Touch swipe gesture states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Local storage persisted portfolio state
  const [projects, setProjects] = useState<UserProject[]>([]);

  // Search filter query indicator
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  // Chat message feed system
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'I want to build a fitness activity dashboard. Can you generate the UI with a circular progress indicator for steps and a list for recent workouts?',
      time: '10:42 AM'
    },
    {
      id: 'msg-2',
      sender: 'ai',
      text: "Generating your fitness dashboard mockup now. I've designed a clean, high-contrast interface using the Activity-V2 template.",
      time: '10:43 AM',
      checklist: [
        'Circular SVG step progress implemented.',
        'Dynamic workout list components mapped.'
      ],
      fileAttachment: {
        name: 'logic_engine_fitness.js',
        size: '12.4 KB'
      }
    },
    {
      id: 'msg-3',
      sender: 'ai',
      text: 'You can see the live preview on the left. Should we add a detailed heart-rate chart or social sharing functionality next?',
      time: '10:43 AM'
    },
    {
      id: 'msg-lovable-demo',
      sender: 'ai',
      text: 'मैं पहले upload flow और data source देखूंगा, फिर image gallery upload + real DB/analytics के हिसाब से fix करूंगा।',
      time: '12:40 PM',
      isCustomLovableCard: true
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const [promptInput, setPromptInput] = useState('');
  const [landingPrompt, setLandingPrompt] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [compilationMessage, setCompilationMessage] = useState('');

  // 1. Fitness App States
  const [fitnessSteps, setFitnessSteps] = useState(8432);
  const [fitnessWorkouts, setFitnessWorkouts] = useState<Workout[]>([
    { id: 'w-1', type: 'Morning Run', detail: '5.2 km • 32 min', icon: 'directions_run' },
    { id: 'w-2', type: 'Yoga Class', detail: '45 min • Calm breathing', icon: 'self_improvement' }
  ]);
  const [newWorkoutType, setNewWorkoutType] = useState('Morning Run');
  const [newWorkoutDetail, setNewWorkoutDetail] = useState('4.0 km • 25 min');

  // 2. Expense App States
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 'e-1', text: 'Freelance Design', amount: 480, type: 'income' },
    { id: 'e-2', text: 'Amazon Web Server', amount: 32, type: 'expense' },
    { id: 'e-3', text: 'Indie Coffee Shop', amount: 4.5, type: 'expense' }
  ]);
  const [newExpenseText, setNewExpenseText] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseType, setNewExpenseType] = useState<'income' | 'expense'>('expense');

  // 3. To Do App States
  const [todos, setTodos] = useState<ToDoItem[]>([
    { id: 't-1', text: 'Set up Google Console', completed: true },
    { id: 't-2', text: 'Wireframe steps controller', completed: false },
    { id: 't-3', text: 'Connect real-time feedback loop', completed: false }
  ]);
  const [newTodoText, setNewTodoText] = useState('');

  // 4. SaaS Monitor States
  const [cpuUsage, setCpuUsage] = useState(42);
  const [isServerActive, setIsServerActive] = useState(true);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    'System initialization successful.',
    'Port 3000 mapping routed for production.',
    'Internal cache warmed up successfully.',
    'Connected to persistent storage engine.'
  ]);

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

  const saveProjects = (updatedList: UserProject[]) => {
    setProjects(updatedList);
    localStorage.setItem('erere_studio_blueprints', JSON.stringify(updatedList));
  };

  // Update telemetry simulation periodically
  useEffect(() => {
    const timer = setInterval(() => {
      if (isServerActive) {
        setCpuUsage(prev => {
          const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
          const next = Math.max(10, Math.min(95, prev + delta));
          return next;
        });

        if (Math.random() > 0.7) {
          const endpoints = ['/api/health', '/api/generate', '/v1/users', '/ws/telemetry'];
          const chosen = endpoints[Math.floor(Math.random() * endpoints.length)];
          const resp = Math.random() > 0.95 ? '500 ERR' : '200 OK';
          setTelemetryLogs(prev => [
            `Request received: GET ${chosen} [${resp}]`,
            ...prev.slice(0, 7)
          ]);
        }
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [isServerActive]);

  // Dynamic search filtering
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  // Helper trigger dynamic compiling simulation
  const startSimulation = (targetScreen: 'fitness' | 'expenses' | 'todo' | 'saas', textInput: string) => {
    setIsCompiling(true);
    setCompilationProgress(5);
    setCompilationMessage('Analyzing prompt semantics and components mapping...');

    const interval = setInterval(() => {
      setCompilationProgress(prev => {
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsCompiling(false);
            setActiveScreen(targetScreen);
            
            // Push AI answer back to conversation
            let appName = '';
            let fileToAttach = '';
            if (targetScreen === 'fitness') {
              appName = 'Fitness Tracker';
              fileToAttach = 'fitness_controller.ts';
            } else if (targetScreen === 'expenses') {
              appName = 'Ledger Ledger';
              fileToAttach = 'expense_matrix.ts';
            } else if (targetScreen === 'todo') {
              appName = 'Task Checklist Core';
              fileToAttach = 'todo_reducer.ts';
            } else {
              appName = 'Cloud Monitor System';
              fileToAttach = 'telemetry_broker.ts';
            }

            setMessages(prevMsgs => [
              ...prevMsgs,
              {
                id: `msg-${Date.now()}-ai-1`,
                sender: 'ai',
                text: `I have compiled the ${appName} mockup inside your live sandbox panel. It implements fully interactive actions to modify application state.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                checklist: [
                  `Configured dynamic state and schema models for ${appName}.`,
                  `Integrated responsive Tailwind layouts into Phone frame.`,
                  'Ready for live deployment test.'
                ],
                fileAttachment: {
                  name: fileToAttach,
                  size: '8.2 KB'
                }
              }
            ]);
          }, 600);
          return 100;
        }

        if (next > 75) {
          setCompilationMessage('Binding React state hooks and event handlers...');
        } else if (next > 40) {
          setCompilationMessage('Generating high-fidelity SVG graphs and list containers...');
        } else if (next > 20) {
          setCompilationMessage('Running production layout optimization compilers...');
        }

        return next;
      });
    }, 250);
  };

  // Core AI architecture executor interacting with backend
  const handlePromptExecution = async (queryText: string, customHistory?: Message[]) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setIsCompiling(true);
    setCompilationProgress(10);
    setCompilationMessage('Analyzing prompt and syncing workspace templates...');

    // Progress bar simulation in parallel to the real async backend request
    const mockProgressInterval = setInterval(() => {
      setCompilationProgress(p => {
        if (p < 85) return p + Math.floor(Math.random() * 8) + 2;
        return p;
      });
    }, 450);

    // AbortController setup for prompt cancel/stop generation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentHistoryList = customHistory || messages;

    try {
      showToast('Contacting BuildCraft AI Core...', 'info');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          history: currentHistoryList.map(m => ({ sender: m.sender, text: m.text })),
          deepThinking: isDeepThinking
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const data = await response.json();
      
      clearInterval(mockProgressInterval);
      setCompilationProgress(100);
      setCompilationMessage('Binding React state hooks and compiling schema...');

      setTimeout(() => {
        setIsCompiling(false);
        // Toggle phone simulator screen if returned
        if (data.screen && ['fitness', 'expenses', 'todo', 'saas'].includes(data.screen)) {
          setActiveScreen(data.screen as any);
        }

        // Setup the generated interactive properties if applicable
        const aiMessageId = `msg-${Date.now()}-ai-reply`;
        const finalAiMessage: Message = {
          id: aiMessageId,
          sender: 'ai',
          text: data.text || 'Process completed successfully.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          checklist: data.checklist || [],
          fileAttachment: data.fileName ? { name: data.fileName, size: `${Math.round((data.fileContent?.length || 0) / 102) / 10} KB` } : undefined
        };

        setMessages(prev => [...prev, finalAiMessage]);
        setIsGenerating(false);
        showToast('AI schema compiled successfully!', 'success');
      }, 500);

    } catch (err: any) {
      clearInterval(mockProgressInterval);
      setIsCompiling(false);
      setIsGenerating(false);

      if (err.name === 'AbortError') {
        showToast('AI response generation stopped by user.', 'info');
        setMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}-ai-stopped`,
            sender: 'ai',
            text: 'System: AI Generation text sequence successfully stopped by architect client query.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        console.error('AI compilation failed: ', err);
        showToast('Failed to reach AI compiler. Click Retry to try again.', 'error');
        setMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}-ai-error`,
            sender: 'ai',
            text: `### AI Generation Error\n\nFailed to sync with the backend construction server because of high-traffic or offline connection.\n\n**Error details:** ${err.message || err.toString()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerateResponse = () => {
    const userMsgs = messages.filter(m => m.sender === 'user');
    if (userMsgs.length === 0) return;
    const lastUserMsg = userMsgs[userMsgs.length - 1];
    
    // Filter out messages after the last user message, so we regenerate from that query
    const lastUserIdx = messages.lastIndexOf(lastUserMsg);
    if (lastUserIdx !== -1) {
      const truncatedHistory = messages.slice(0, lastUserIdx + 1);
      setMessages(truncatedHistory);
      handlePromptExecution(lastUserMsg.text, truncatedHistory);
    }
  };

  const handleStartEditMessage = (id: string, text: string) => {
    setEditingMessageId(id);
    setEditingText(text);
  };

  const handleSaveEditMessage = (id: string) => {
    if (!editingText.trim()) return;
    
    const msgIndex = messages.findIndex(m => m.id === id);
    if (msgIndex !== -1) {
      const updated = [...messages];
      updated[msgIndex] = { ...updated[msgIndex], text: editingText };
      
      const truncated = updated.slice(0, msgIndex + 1);
      setMessages(truncated);
      setEditingMessageId(null);
      handlePromptExecution(editingText, truncated);
    }
  };

  // Chat message submission
  const handleGenerateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isGenerating) return;

    const queryText = promptInput.trim();
    setPromptInput('');

    // Append user message
    const formattedUserMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...messages, formattedUserMsg];
    setMessages(updatedMessages);

    // Run real-time structured prompt compilation via Gemini proxy
    handlePromptExecution(queryText, updatedMessages);
  };

  // Submits the welcome prompt and switches to standard chat space
  const handleLandingSubmitWithPrompt = (promptText: string) => {
    if (!promptText.trim() || isGenerating) return;

    const queryText = promptText.trim();
    setLandingPrompt('');

    // Switch to Chat tab
    setCurrentTab('Chat');
    // Dismiss landing welcome screen overlay
    setShowWelcome(false);

    // Append user message to active feed
    const formattedUserMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...messages, formattedUserMsg];
    setMessages(updatedMessages);

    // Run real-time structured prompt compilation via Gemini proxy
    handlePromptExecution(queryText, updatedMessages);
  };

  // Welcome screen prompt submit button hook wrapper
  const handleLandingSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleLandingSubmitWithPrompt(landingPrompt);
  };

  // Welcome screen select recent/created project
  const handleSelectRecentProject = (projectName: string) => {
    // Switch to Chat tab
    setCurrentTab('Chat');
    // Dismiss landing welcome screen
    setShowWelcome(false);

    // Route mockup screen and add simulated message
    let targetScreen: 'fitness' | 'expenses' | 'todo' | 'saas' = 'fitness';
    
    if (projectName === 'Acme Corp') {
      targetScreen = 'saas';
    } else if (projectName === 'BuildingBlocks') {
      targetScreen = 'saas';
    } else if (projectName === 'AlphaWave') {
      targetScreen = 'fitness';
    } else if (projectName === 'ContrastAI') {
      targetScreen = 'todo';
    } else if (projectName === 'Euphoria') {
      targetScreen = 'expenses';
    }

    setActiveScreen(targetScreen);

    // Append greeting message indicating this project was successfully loaded from database
    setMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}-project-greeting`,
        sender: 'ai',
        text: `Successfully fetched and loaded your project **${projectName}** from the persistent Firestore storage. Its high-fidelity mockup is now rendering live inside the device simulation window!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checklist: [
          `Synced layout components with database document key 'projects/${projectName.toLowerCase().replace(' ', '_')}'`,
          'Connected live interactive state variables inside the sandbox controller.',
          'Ready for additional real-time updates.'
        ]
      }
    ]);
  };

  // Mobile swipes for sliding drawer control
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
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

  // Deploy simulation click
  const triggerDeploy = () => {
    setAlertText('Your application has been compiled successfully and dispatched to production Cloud Run! Live deployment complete.');
    setIsAlertOpen(true);
    setNotificationCount(prev => prev + 1);
  };

  // Reset demo databases
  const handleResetDatabases = () => {
    setFitnessSteps(8432);
    setFitnessWorkouts([
      { id: 'w-1', type: 'Morning Run', detail: '5.2 km • 32 min', icon: 'directions_run' },
      { id: 'w-2', type: 'Yoga Class', detail: '45 min • Calm breathing', icon: 'self_improvement' }
    ]);
    setExpenses([
      { id: 'e-1', text: 'Freelance Design', amount: 480, type: 'income' },
      { id: 'e-2', text: 'Amazon Web Server', amount: 32, type: 'expense' },
      { id: 'e-3', text: 'Indie Coffee Shop', amount: 4.5, type: 'expense' }
    ]);
    setTodos([
      { id: 't-1', text: 'Set up Google Console', completed: true },
      { id: 't-2', text: 'Wireframe steps controller', completed: false },
      { id: 't-3', text: 'Connect real-time feedback loop', completed: false }
    ]);
    setCpuUsage(42);
    setTelemetryLogs(['Re-initialized virtual databases to clean state. Ready.']);
  };

  // Add Item actions directly for responsive mockup
  const handleAddWorkout = () => {
    if (!newWorkoutDetail.trim()) return;
    const item: Workout = {
      id: `w-${Date.now()}`,
      type: newWorkoutType,
      detail: newWorkoutDetail,
      icon: newWorkoutType === 'Morning Run' ? 'directions_run' : newWorkoutType === 'Yoga Class' ? 'self_improvement' : 'directions_bike'
    };
    setFitnessWorkouts(prev => [...prev, item]);
    setNewWorkoutDetail('');
  };

  const handleAddExpense = () => {
    if (!newExpenseText.trim() || !newExpenseAmount.trim()) return;
    const amountNum = parseFloat(newExpenseAmount);
    if (isNaN(amountNum)) return;
    const item: Expense = {
      id: `e-${Date.now()}`,
      text: newExpenseText,
      amount: amountNum,
      type: newExpenseType
    };
    setExpenses(prev => [...prev, item]);
    setNewExpenseText('');
    setNewExpenseAmount('');
  };

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    const item: ToDoItem = {
      id: `t-${Date.now()}`,
      text: newTodoText,
      completed: false
    };
    setTodos(prev => [...prev, item]);
    setNewTodoText('');
  };

  return (
    <div className="font-body-sm text-on-surface bg-background min-h-screen relative overflow-x-hidden">
      
      {/* Toast Alert Modal */}
      <AnimatePresence>
        {isAlertOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-outline-variant/60 relative"
            >
              <div className="flex items-center gap-3 text-primary mb-4">
                <span className="material-symbols-outlined text-3xl">cloud_done</span>
                <h3 className="font-headline-md text-lg font-bold">Workspace Alert</h3>
              </div>
              <p className="text-body-sm text-on-surface-variant leading-relaxed mb-6">{alertText}</p>
              <div className="flex justify-end">
                <button 
                  onClick={() => setIsAlertOpen(false)}
                  className="bg-primary hover:opacity-90 transition-all font-label-code text-xs text-white px-5 py-2.5 rounded-lg font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Compilation Overlay */}
      <AnimatePresence>
        {isCompiling && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-outline-variant rounded-2xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-container to-primary" />
              
              <div className="flex items-center space-x-3.5 mb-6">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-primary text-2xl animate-spin">sync</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-base font-bold text-on-surface">BuildCraft Engine</h4>
                  <p className="text-xs text-on-surface-variant/80">Processing local blueprints modifications</p>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/50 font-mono text-xs text-on-surface-variant min-h-[140px] flex flex-col justify-between">
                <div>
                  <div className="text-outline text-[10px] uppercase font-bold tracking-wider mb-1">// Active Compiler Process:</div>
                  <div className="text-primary font-semibold line-clamp-2">"Deploying real-time updates"</div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center text-[10px] font-bold text-outline">
                    <span>COMPILING: ACTIVE</span>
                    <span>{compilationProgress}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      style={{ width: `${compilationProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>

                  <p className="text-xs text-primary font-medium animate-pulse flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 animate-ping" />
                    {compilationMessage}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)} 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-all duration-300"
        />
      )}

      {/* SideNavBar (Responsive Mobile Drawer + Desktop Persistent) */}
      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-surface-container-low border-r border-outline-variant flex flex-col py-6 z-50 transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-primary">terminal</span>
              {appTitle}
            </h1>
            <p className="font-label-code text-label-code text-on-surface-variant opacity-70">v1.2.0-beta</p>
          </div>
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-surface-container-high rounded text-outline hover:text-on-surface transition"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto chat-scroll">
          <button 
            onClick={() => {
              setCurrentTab('Dashboard');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left duration-200 rounded-lg ${currentTab === 'Dashboard' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="font-label-code text-label-code uppercase tracking-wider text-xs">Dashboard</span>
          </button>

          <button 
            onClick={() => {
              setCurrentTab('Screens');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left duration-200 rounded-lg ${currentTab === 'Screens' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-[20px]">layers</span>
            <span className="font-label-code text-label-code uppercase tracking-wider text-xs">Screens</span>
          </button>

          <button 
            onClick={() => {
              setCurrentTab('Components');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left duration-200 rounded-lg ${currentTab === 'Components' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-[20px]">extension</span>
            <span className="font-label-code text-label-code uppercase tracking-wider text-xs">Components</span>
          </button>

          <button 
            onClick={() => {
              setCurrentTab('Database');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left duration-200 rounded-lg ${currentTab === 'Database' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-[20px]">database</span>
            <span className="font-label-code text-label-code uppercase tracking-wider text-xs">Database</span>
          </button>

          <button 
            onClick={() => {
              setCurrentTab('Logic');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left duration-200 rounded-lg ${currentTab === 'Logic' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-[20px]">terminal</span>
            <span className="font-label-code text-label-code uppercase tracking-wider text-xs">Logic</span>
          </button>

          <button 
            onClick={() => {
              setCurrentTab('Settings');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left duration-200 rounded-lg ${currentTab === 'Settings' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="font-label-code text-label-code uppercase tracking-wider text-xs">Settings</span>
          </button>

          <div className="h-[1px] bg-outline-variant/60 my-3" />

          <button 
            onClick={() => {
              setCurrentTab('Chat');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left duration-200 rounded-lg ${currentTab === 'Chat' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            <span className="font-label-code text-label-code font-bold uppercase tracking-wider text-xs">Chat Space</span>
          </button>

          <div className="h-[1px] bg-outline-variant/60 my-3" />

          <button 
            onClick={() => {
              setShowWelcome(true);
              setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 text-primary rounded-lg transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-label-code text-label-code font-bold uppercase tracking-wider text-xs">Welcome Guide</span>
          </button>
        </nav>

        <div className="px-4 mt-auto space-y-2.5">
          <button 
            onClick={() => {
              triggerDeploy();
              setIsMobileSidebarOpen(false);
            }}
            className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-label-code text-[#fff] text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined text-sm">cloud_upload</span>
            Deploy App
          </button>

          <button
            onClick={() => {
              handleResetDatabases();
              setIsMobileSidebarOpen(false);
            }}
            className="w-full border border-outline hover:bg-surface-container-high text-on-surface py-2 rounded-lg font-label-code text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">refresh</span>
            Reset Sandbox Data
          </button>
        </div>
      </aside>

      {/* TopAppBar */}
      <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-4 md:px-8 z-40">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger Button */}
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          
          {/* Mobile Logo Title */}
          <div className="lg:hidden flex items-center gap-1 select-none">
            <span className="material-symbols-outlined text-primary text-xl font-bold">terminal</span>
            <span className="font-bold text-sm tracking-tight text-on-surface truncate max-w-[110px]">{appTitle}</span>
          </div>

          <div className="hidden sm:flex items-center bg-surface-container-low px-4 py-1.5 rounded-full border border-outline-variant w-44 md:w-96">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-2">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-transparent border-none outline-none text-body-sm w-full focus:ring-0 placeholder:text-outline border-transparent focus:border-transparent focus:outline-none" 
              placeholder="Search sandbox components, logs, screens..."
            />
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-surface-container-highest rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="font-label-code text-[10px] uppercase tracking-wider text-on-surface-variant">Production Sandbox</span>
          </div>

          <div className="flex items-center gap-4 text-on-surface-variant">
            {/* Notifications badge */}
            <div className="relative">
              <span 
                onClick={() => {
                  setShowNotificationToast(true);
                  setTimeout(() => setShowNotificationToast(false), 4000);
                  setNotificationCount(0);
                }}
                className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors text-2xl"
              >
                notifications
              </span>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {notificationCount}
                </span>
              )}
            </div>

            {/* Profile Avatar & Login trigger */}
            {userEmail ? (
              <div 
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2 hover:bg-surface-container-low px-2 py-1 rounded-lg cursor-pointer transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold uppercase">
                  {userEmail[0]}
                </div>
                <div className="hidden sm:block text-left text-xs text-on-surface font-semibold max-w-[100px] truncate">
                  {userEmail.split('@')[0]}
                </div>
              </div>
            ) : (
              <span 
                onClick={() => setIsLoginOpen(true)}
                className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors text-3xl"
              >
                account_circle
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="lg:ml-[280px] ml-0 pt-16 h-screen flex overflow-hidden bg-background">
        
        {/* Render based oncurrentTab */}
        <AnimatePresence mode="wait">
          {currentTab === 'Chat' && (
            <div className="flex flex-1 flex-col lg:flex-row overflow-hidden w-full h-full">
              {/* Mobile sub-tab switches */}
              <div className="flex lg:hidden bg-surface border-b border-outline-variant w-full p-2.5 gap-2 shrink-0 z-20 select-none">
                <button
                  type="button"
                  onClick={() => setMobileSubTab('chat')}
                  className={`flex-1 py-2 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${mobileSubTab === 'chat' ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  Architect Chat
                </button>
                <button
                  type="button"
                  onClick={() => setMobileSubTab('preview')}
                  className={`flex-1 py-2 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${mobileSubTab === 'preview' ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">smartphone</span>
                  App Preview
                </button>
              </div>

              {/* Left Panel: Device Mockup (Responsive Mobile vs Desktop) */}
              <section className={`flex-1 h-full flex flex-col items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden min-h-0 ${mobileSubTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
                {/* Decorative Background Element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary opacity-5 rounded-full blur-[100px]"></div>

                {/* Device Mode Switcher floating nicely at the top of the container */}
                <div className="mb-4 flex items-center justify-between w-full max-w-[340px] md:max-w-md bg-stone-100 select-none dark:bg-stone-900 px-3.5 py-1.5 rounded-full border border-[#2d3a34]/10 dark:border-white/10 shadow-sm relative z-30 transition-all">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-[#2d3a34] dark:text-stone-300 font-sans tracking-wide uppercase">App Simulator</span>
                  </div>
                  <div className="flex bg-stone-200/50 dark:bg-stone-800 rounded-full p-0.5 border border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('mobile')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        previewMode === 'mobile'
                          ? 'bg-[#244b3c] text-white shadow-xs font-semibold'
                          : 'text-[#2d3a34]/65 hover:bg-black/5 dark:text-stone-300 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">smartphone</span>
                      <span>Mobile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('desktop')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        previewMode === 'desktop'
                          ? 'bg-[#244b3c] text-white shadow-xs font-semibold'
                          : 'text-[#2d3a34]/65 hover:bg-black/5 dark:text-stone-300 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">laptop</span>
                      <span>Desktop</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 w-full flex items-center justify-center min-h-0 relative z-10">
                  {previewMode === 'mobile' ? (
                    /* Phone Mockup Frame (Original Preserved Exactly) */
                    <div className="relative w-full max-w-[325px] sm:max-w-[340px] h-full max-h-[610px] lg:max-h-[690px] bg-on-surface rounded-[40px] lg:rounded-[50px] p-2.5 lg:p-3 shadow-2xl border-4 border-surface-container-highest transition-all duration-300 flex flex-col">
                      <div className="bg-white w-full h-full rounded-[32px] lg:rounded-[40px] overflow-hidden flex flex-col relative text-[13px] text-[#191c1e] min-h-0">
                        {/* Status Bar */}
                        <div className="h-10 flex justify-between items-center px-8 z-20 shrink-0">
                          <span className="text-[12px] font-bold">9:41</span>
                          <div className="flex gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
                            <span className="material-symbols-outlined text-[14px]">wifi</span>
                            <span className="material-symbols-outlined text-[14px]">battery_full</span>
                          </div>
                        </div>

                        {/* App Container Dynamic Core screens */}
                        <div className="flex-1 px-5 pt-2 pb-4 overflow-y-auto chat-scroll flex flex-col min-h-0 bg-slate-50">
                          {/* 1. fitness Tracker template */}
                          {activeScreen === 'fitness' && (
                            <div className="flex-1 flex flex-col h-full space-y-4">
                              <div className="flex justify-between items-center shrink-0">
                                <div>
                                  <p className="text-[11px] text-outline font-medium">Monday, May 15</p>
                                  <h2 className="font-headline-md text-[21px] text-on-surface leading-tight font-black animate-fade-in">Today's Activity</h2>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                                  <span className="material-symbols-outlined text-primary text-base">person</span>
                                </div>
                              </div>

                              {/* Steps Donut Chart inside mobile layout */}
                              <div 
                                onClick={() => setFitnessSteps(steps => steps + 500)}
                                className="relative w-36 h-36 mx-auto flex items-center justify-center cursor-pointer group shrink-0"
                                title="Click to simulation log 500 steps!"
                              >
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle cx="72" cy="72" fill="transparent" r="58" stroke="#f1f5f9" strokeWidth="10"></circle>
                                  <circle 
                                    cx="72" 
                                    cy="72" 
                                    fill="transparent" 
                                    r="58" 
                                    stroke="#006875" 
                                    strokeDasharray="364" 
                                    strokeDashoffset={Math.max(0, 364 - (fitnessSteps / 12000) * 364)} 
                                    strokeLinecap="round" 
                                    strokeWidth="10"
                                    className="transition-all duration-700"
                                  ></circle>
                                </svg>
                                <div className="absolute text-center select-none">
                                  <p className="text-xl font-black text-on-surface group-hover:scale-110 transition-transform">{fitnessSteps.toLocaleString()}</p>
                                  <p className="text-[8px] text-outline uppercase font-bold tracking-wider">Steps Target</p>
                                  <p className="text-[8px] text-primary font-bold mt-0.5">+500 steps tap</p>
                                </div>
                              </div>

                              {/* Stats cards */}
                              <div className="grid grid-cols-2 gap-3 shrink-0">
                                <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant flex flex-col justify-between">
                                  <span className="material-symbols-outlined text-primary text-[16px] mb-0.5">local_fire_department</span>
                                  <div>
                                    <p className="text-xs font-bold text-on-surface">{Math.round(fitnessSteps * 0.043)}</p>
                                    <p className="text-[8.5px] text-outline">Kcal Burned</p>
                                  </div>
                                </div>
                                <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant flex flex-col justify-between">
                                  <span className="material-symbols-outlined text-primary text-[16px] mb-0.5">timer</span>
                                  <div>
                                    <p className="text-xs font-bold text-on-surface">{Math.round(fitnessSteps / 180)}</p>
                                    <p className="text-[8.5px] text-outline">Active Min</p>
                                  </div>
                                </div>
                              </div>

                              {/* Workouts checklist */}
                              <div className="space-y-1.5 mt-1 flex-1 flex flex-col min-h-0">
                                <h3 className="font-bold text-[12px] text-on-surface">Recent Workouts</h3>
                                <div className="space-y-2 max-h-[110px] overflow-y-auto chat-scroll pr-1 flex-1">
                                  {fitnessWorkouts.map(w => (
                                    <div key={w.id} className="flex items-center p-2 bg-white border border-outline-variant/60 rounded-xl shadow-xs">
                                      <div className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center mr-2 shrink-0">
                                        <span className="material-symbols-outlined text-on-primary-container text-sm">{w.icon}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-semibold text-on-surface leading-tight truncate">{w.type}</p>
                                        <p className="text-[9px] text-outline leading-tight truncate">{w.detail}</p>
                                      </div>
                                      <button 
                                        onClick={() => setFitnessWorkouts(prev => prev.filter(p => p.id !== w.id))}
                                        className="text-on-surface-variant hover:text-error transition shrink-0 ml-1"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {/* Easy workout logger widget */}
                                <div className="bg-surface-container-low border border-outline-variant/60 p-2 rounded-xl space-y-1.5 shrink-0 mt-1">
                                  <div className="grid grid-cols-2 gap-1 mt-0.5">
                                    <select 
                                      value={newWorkoutType} 
                                      onChange={(e) => setNewWorkoutType(e.target.value)}
                                      className="text-[10px] bg-slate-50 border border-outline-variant rounded p-1 outline-none font-medium"
                                    >
                                      <option value="Morning Run">Morning Run</option>
                                      <option value="Yoga Class">Yoga Class</option>
                                      <option value="Cyclist Session">Cycling</option>
                                    </select>
                                    <input 
                                      type="text" 
                                      value={newWorkoutDetail}
                                      onChange={(e) => setNewWorkoutDetail(e.target.value)}
                                      placeholder="4.0 km • 25m"
                                      className="text-[10px] bg-slate-50 border border-outline-variant rounded px-1.5 outline-none font-medium text-center"
                                    />
                                  </div>
                                  <button 
                                    onClick={handleAddWorkout}
                                    className="w-full bg-primary text-white text-[10px] py-1 rounded font-bold hover:opacity-95 cursor-pointer text-center"
                                  >
                                    Add Log Entry
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. expense Ledger template */}
                          {activeScreen === 'expenses' && (
                            <div className="flex-1 flex flex-col h-full space-y-3">
                              <div className="flex justify-between items-center shrink-0">
                                <div>
                                  <p className="text-[11px] text-outline font-medium">Expense Tracker</p>
                                  <h2 className="font-headline-md text-[21px] text-on-surface leading-tight font-black">My Ledger</h2>
                                </div>
                                <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
                              </div>

                              {/* Calculated metrics */}
                              <div className="p-3 bg-gradient-to-br from-[#122c21] to-[#244b3c] text-white rounded-2xl shadow-sm shrink-0">
                                <p className="text-[9px] text-[#def5ea]/80 font-bold uppercase tracking-wider">Estimated Cash Flow</p>
                                <p className="text-2xl font-black mt-0.5">
                                  ${expenses.reduce((sum, item) => item.type === 'income' ? sum + item.amount : sum - item.amount, 0).toLocaleString()}
                                </p>
                                <div className="flex justify-between mt-2.5 pt-2 border-t border-white/10 text-[9px] text-[#def5ea]/90">
                                  <span>Income: ${expenses.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0)}</span>
                                  <span>Bills: ${expenses.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0)}</span>
                                </div>
                              </div>

                              {/* List of expenses journal */}
                              <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                                <h3 className="font-bold text-[12px] text-on-surface">Transactions Feed</h3>
                                <div className="space-y-1.5 max-h-[160px] overflow-y-auto chat-scroll pr-1 flex-1">
                                  {expenses.map(e => (
                                    <div key={e.id} className="flex justify-between items-center p-2.5 bg-white border border-outline-variant/60 rounded-xl shadow-xs">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className={`w-6 h-6 rounded-lg ${e.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center justify-center shrink-0`}>
                                          <span className="material-symbols-outlined text-sm">{e.type === 'income' ? 'add' : 'remove'}</span>
                                        </div>
                                        <span className="font-semibold text-xs text-on-surface truncate">{e.text}</span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className={`font-bold text-xs ${e.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {e.type === 'income' ? '+' : '-'}${e.amount}
                                        </span>
                                        <button 
                                          onClick={() => setExpenses(prev => prev.filter(x => x.id !== e.id))}
                                          className="text-on-surface-variant hover:text-error"
                                        >
                                          <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Ledger Fast Adder Form */}
                                <div className="bg-surface-container-low border border-outline-variant/60 p-2 rounded-xl space-y-1.5 shrink-0 mt-1">
                                  <div className="flex gap-1.5">
                                    <input 
                                      type="text" 
                                      value={newExpenseText}
                                      onChange={(e) => setNewExpenseText(e.target.value)}
                                      placeholder="Coffee..."
                                      className="text-[10px] bg-slate-50 border border-outline-variant rounded p-1 outline-none font-medium flex-1 text-[#191c1e]"
                                    />
                                    <input 
                                      type="number" 
                                      value={newExpenseAmount}
                                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                                      placeholder="$15"
                                      className="text-[10px] bg-slate-50 border border-outline-variant rounded p-1 outline-none font-medium w-14 text-center text-[#191c1e]"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button 
                                      type="button"
                                      onClick={() => setNewExpenseType('expense')}
                                      className={`flex-1 py-1 rounded text-[9px] font-bold border transition ${newExpenseType === 'expense' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'border-outline-variant text-outline bg-white'}`}
                                    >
                                      Spend
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => setNewExpenseType('income')}
                                      className={`flex-1 py-1 rounded text-[9px] font-bold border transition ${newExpenseType === 'income' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-outline-variant text-outline bg-white'}`}
                                    >
                                      Earn
                                    </button>
                                  </div>
                                  <button 
                                    onClick={handleAddExpense}
                                    className="w-full bg-[#244b3c] text-white text-[10px] py-1 rounded font-bold hover:opacity-95 cursor-pointer text-center"
                                  >
                                    Save Transaction
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. to-do list Planner checklist */}
                          {activeScreen === 'todo' && (
                            <div className="flex-1 flex flex-col h-full space-y-3">
                              <div className="flex justify-between items-center shrink-0">
                                <div>
                                  <p className="text-[11px] text-outline font-medium">Task Management</p>
                                  <h2 className="font-headline-md text-[21px] text-on-surface leading-tight font-black">Plan & Deliver</h2>
                                </div>
                                <span className="material-symbols-outlined text-primary text-xl">playlist_add_check</span>
                              </div>

                              {/* Progress bar info inside mobile checklist screen */}
                              <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl shrink-0">
                                <div className="flex justify-between text-[11px] font-bold text-teal-800 mb-1">
                                  <span>Completion Rate</span>
                                  <span>
                                    {Math.round((todos.filter(t => t.completed).length / Math.max(1, todos.length)) * 100)}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-teal-600 h-full transition-all duration-500" 
                                    style={{ width: `${(todos.filter(t => t.completed).length / Math.max(1, todos.length)) * 100}%` }}
                                  />
                                </div>
                              </div>

                              {/* Task scrolling area */}
                              <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                                <h3 className="font-bold text-[12px] text-on-surface">Active Backlog</h3>
                                <div className="space-y-1.5 max-h-[160px] overflow-y-auto chat-scroll pr-1 flex-1">
                                  {todos.map(t => (
                                    <div 
                                      key={t.id} 
                                      onClick={() => {
                                        setTodos(prev => prev.map(item => item.id === t.id ? { ...item, completed: !item.completed } : item));
                                      }}
                                      className="flex items-center p-2.5 bg-white border border-outline-variant/60 rounded-xl hover:bg-slate-50 cursor-pointer shadow-xs select-none transition"
                                    >
                                      <span className="material-symbols-outlined text-[18px] text-primary mr-2.5 shrink-0">
                                        {t.completed ? 'check_box' : 'check_box_outline_blank'}
                                      </span>
                                      <span className={`flex-1 text-xs font-semibold text-on-surface leading-normal truncate ${t.completed ? 'line-through text-outline' : ''}`}>
                                        {t.text}
                                      </span>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTodos(prev => prev.filter(x => x.id !== t.id));
                                        }}
                                        className="text-on-surface-variant hover:text-error transition shrink-0 ml-1"
                                      >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {/* Task Quick Form */}
                                <div className="bg-surface-container-low border border-outline-variant/60 p-2 rounded-xl flex gap-1.5 shrink-0 mt-1">
                                  <input 
                                    type="text" 
                                    value={newTodoText}
                                    onChange={(e) => setNewTodoText(e.target.value)}
                                    placeholder="Add new high-priority issue..."
                                    className="text-[10px] bg-slate-50 border border-outline-variant rounded px-2 outline-none font-medium flex-1 h-8 text-[#191c1e]"
                                  />
                                  <button 
                                    onClick={handleAddTodo}
                                    className="bg-[#244b3c] text-white text-[10px] px-3 rounded font-bold hover:opacity-95 shrink-0 h-8 flex items-center justify-center cursor-pointer"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. saas analytics Cloud performance screen layout */}
                          {activeScreen === 'saas' && (
                            <div className="flex-1 flex flex-col h-full space-y-3 text-left">
                              <div className="flex justify-between items-center shrink-0">
                                <div>
                                  <p className="text-[11px] text-outline font-medium">Cluster Operations</p>
                                  <h2 className="font-headline-md text-[21px] text-on-surface leading-tight font-black">Brokers Admin</h2>
                                </div>
                                <span className={`w-3.5 h-3.5 rounded-full ${isServerActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              </div>

                              {/* Interactive controls and state toggles */}
                              <div className="p-3 bg-surface-container-low border border-outline-variant rounded-xl space-y-2 shrink-0">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-on-surface-variant">Cluster Engine Server</span>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setIsServerActive(!isServerActive);
                                      if(!isServerActive) {
                                        setTelemetryLogs(prev => [`Cluster startup event dispatched to zone-a`, `Handshake succeeded. REST API Online.`, ...prev]);
                                      } else {
                                        setTelemetryLogs(prev => [`Cluster offline command authenticated`, ...prev]);
                                      }
                                    }}
                                    className={`px-2.5 py-1 rounded text-[9px] font-bold text-white transition ${isServerActive ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                                  >
                                    {isServerActive ? 'Shutdown' : 'Boot Server'}
                                  </button>
                                </div>

                                <div className="space-y-1 pt-1 border-t border-outline-variant/30 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-outline">Broker Node CPU:</span>
                                    <span className="font-semibold text-on-surface">{cpuUsage}%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all duration-300 ${cpuUsage > 80 ? 'bg-rose-500' : 'bg-primary'}`}
                                      style={{ width: `${cpuUsage}%` }}
                                    />
                                  </div>
                                  <input 
                                    type="range" 
                                    min="10" 
                                    max="100" 
                                    value={cpuUsage}
                                    onChange={(e) => setCpuUsage(Number(e.target.value))}
                                    className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer"
                                  />
                                </div>
                              </div>

                              {/* Telemetry stream logs */}
                              {isServerActive && (
                                <div className="flex-1 flex flex-col min-h-0 space-y-1 mt-1">
                                  <div className="flex justify-between items-center shrink-0">
                                    <p className="text-[11px] font-bold text-outline">Cluster Telemetry Logs</p>
                                    <span className="text-[8px] bg-primary/10 text-primary font-mono px-1 rounded">streaming</span>
                                  </div>

                                  <div className="flex-1 bg-[#191c1e] text-emerald-400 font-mono text-[10px] p-2.5 rounded-xl overflow-y-auto chat-scroll max-h-[170px] space-y-1">
                                    {telemetryLogs.map((log, index) => (
                                      <p key={index} className="leading-relaxed truncate">
                                        <span className="text-outline">[$]</span> {log}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bottom Nav bar inside device mockup */}
                        <div className="h-16 border-t border-[#f1f5f9] flex justify-around items-center px-4 bg-white shrink-0 z-20 rounded-b-[32px] lg:rounded-b-[40px]">
                          <span 
                            onClick={() => setActiveScreen('fitness')}
                            className={`material-symbols-outlined text-[20px] cursor-pointer transition ${activeScreen === 'fitness' ? 'text-primary scale-115 font-bold' : 'text-outline hover:text-primary'}`}
                            style={{ fontVariationSettings: activeScreen === 'fitness' ? "'FILL' 1" : "'FILL' 0" }}
                            title="Fitness App screen"
                          >
                            home
                          </span>
                          <span 
                            onClick={() => setActiveScreen('expenses')}
                            className={`material-symbols-outlined text-[20px] cursor-pointer transition ${activeScreen === 'expenses' ? 'text-primary scale-115 font-bold' : 'text-outline hover:text-primary'}`}
                            style={{ fontVariationSettings: activeScreen === 'expenses' ? "'FILL' 1" : "'FILL' 0" }}
                            title="Expense app screen"
                          >
                            explore
                          </span>
                          <span 
                            onClick={() => setActiveScreen('todo')}
                            className={`material-symbols-outlined text-[20px] cursor-pointer transition ${activeScreen === 'todo' ? 'text-primary scale-115 font-bold' : 'text-outline hover:text-primary'}`}
                            style={{ fontVariationSettings: activeScreen === 'todo' ? "'FILL' 1" : "'FILL' 0" }}
                            title="Checklist App screen"
                          >
                            leaderboard
                          </span>
                          <span 
                            onClick={() => setActiveScreen('saas')}
                            className={`material-symbols-outlined text-[20px] cursor-pointer transition ${activeScreen === 'saas' ? 'text-primary scale-115 font-bold' : 'text-outline hover:text-primary'}`}
                            style={{ fontVariationSettings: activeScreen === 'saas' ? "'FILL' 1" : "'FILL' 0" }}
                            title="SaaS cloud Server screen"
                          >
                            settings
                          </span>
                        </div>

                        {/* iPhone Display Dynamic notch bar element */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-on-surface rounded-full z-[30] flex items-center justify-center">
                          <div className="w-12 h-1 bg-white/20 rounded-full" />
                          <div className="w-2.5 h-2.5 bg-slate-900 border border-slate-700 rounded-full ml-2" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Widescreen Desktop Browser Mockup Frame (User requested) */
                    <div className="relative w-full max-w-[500px] md:max-w-[580px] lg:max-w-[700px] xl:max-w-[800px] h-full max-h-[610px] lg:max-h-[690px] bg-white rounded-2xl flex flex-col shadow-2xl border border-[#2d3a34]/15 overflow-hidden transition-all duration-300">
                      {/* Browser top header title bar */}
                      <div className="bg-stone-100 dark:bg-stone-900/90 border-b border-black/5 dark:border-white/5 px-4 py-3 flex items-center justify-between shrink-0 select-none">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>
                        
                        {/* Address bar mocking current route */}
                        <div className="flex-1 max-w-[280px] sm:max-w-md mx-auto bg-white dark:bg-stone-800 border border-black/5 dark:border-white/10 rounded-lg px-3 py-1 flex items-center justify-between text-[11px] text-[#2d3a34]/70 dark:text-stone-300 font-mono">
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="material-symbols-outlined text-[12px] text-emerald-600">lock</span>
                            <span className="truncate">https://buildcraft.preview/{activeScreen}</span>
                          </div>
                          <span className="material-symbols-outlined text-[12px] hover:text-[#2d3a34] cursor-pointer shrink-0">refresh</span>
                        </div>
                        
                        {/* Mock sidebar responsive indicator */}
                        <div className="flex items-center space-x-3 text-stone-400 select-none">
                          <span className="material-symbols-outlined text-[15px] cursor-pointer hover:text-[#2d3a34]">grid_view</span>
                          <span className="material-symbols-outlined text-[15px] cursor-pointer hover:text-[#2d3a34]">account_circle</span>
                        </div>
                      </div>

                      {/* Desktop Live Application layout builder dependent on active screen */}
                      <div className="flex-1 bg-stone-50/50 min-h-0 overflow-y-auto chat-scroll p-4 sm:p-5 text-[13px] text-[#191c1e] text-left flex flex-col">
                        {/* 1. Desktop Fitness Tracker Screen */}
                        {activeScreen === 'fitness' && (
                          <div className="flex-1 flex flex-col h-full space-y-4">
                            {/* Dashboard header */}
                            <div className="flex justify-between items-center border-b border-[#2d3a34]/5 pb-3">
                              <div>
                                <h3 className="font-extrabold text-[#2d3a34] text-base leading-tight">Corporate Wellbeing Monitor</h3>
                                <p className="text-[10px] text-outline">Real-Time Team steps synched with active local databases</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold bg-[#def5ea] text-[#1e4634] px-2.5 py-1 rounded-full">Zone Central A</span>
                                <span className="material-symbols-outlined text-[18px] text-primary">analytics</span>
                              </div>
                            </div>

                            {/* Bento elements layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 flex-1">
                              {/* Left Progress column */}
                              <div className="md:col-span-1 lg:col-span-5 bg-white p-4 rounded-xl border border-[#2d3a34]/10 shadow-sm flex flex-col justify-between items-center text-center">
                                <h4 className="text-xs font-bold text-outline-variant self-start uppercase tracking-wider">Metrics Circle</h4>
                                
                                <div 
                                  onClick={() => setFitnessSteps(s => s + 500)}
                                  className="my-3 relative w-32 h-32 flex items-center justify-center cursor-pointer group"
                                  title="Simulate step log"
                                >
                                  <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" fill="transparent" r="50" stroke="#f1f5f9" strokeWidth="10"></circle>
                                    <circle 
                                      cx="64" 
                                      cy="64" 
                                      fill="transparent" 
                                      r="50" 
                                      stroke="#0284c7" 
                                      strokeDasharray="314" 
                                      strokeDashoffset={Math.max(0, 314 - (fitnessSteps / 12000) * 314)} 
                                      strokeLinecap="round" 
                                      strokeWidth="10"
                                      className="transition-all duration-700"
                                    />
                                  </svg>
                                  <div className="absolute text-center select-none">
                                    <p className="text-lg font-black text-on-surface group-hover:scale-110 transition-transform">{fitnessSteps.toLocaleString()}</p>
                                    <p className="text-[8px] text-outline font-bold">Goal: 12k</p>
                                  </div>
                                </div>

                                <div className="text-[10px] text-primary font-bold bg-[#def5ea] px-3 py-1 rounded-full self-stretch mt-1 pointer-events-none">
                                  Goal Completion: {Math.round((fitnessSteps/12000)*100)}%
                                </div>
                              </div>

                              {/* Middle statistics items */}
                              <div className="md:col-span-1 lg:col-span-7 flex flex-col space-y-4">
                                <div className="grid grid-cols-2 gap-3 shrink-0">
                                  <div className="p-3 bg-white rounded-xl border border-outline-variant flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                      <span className="material-symbols-outlined text-orange-600 text-[18px]">local_fire_department</span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-on-surface">{Math.round(fitnessSteps * 0.043)} kcal</p>
                                      <p className="text-[9px] text-outline font-bold">Energy Expended</p>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-white rounded-xl border border-outline-variant flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                      <span className="material-symbols-outlined text-blue-600 text-[18px]">timer</span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-on-surface">{Math.round(fitnessSteps / 180)} min</p>
                                      <p className="text-[9px] text-outline font-bold">Exercise Session</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Desktop Workout logger and lists */}
                                <div className="bg-white p-4 rounded-xl border border-[#2d3a34]/10 shadow-sm flex-1 flex flex-col min-h-0">
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="text-[11px] font-black uppercase tracking-wider text-outline">Recent Workout Feed</h5>
                                    <span className="text-[9px] text-[#244b3c] font-bold">Count: {fitnessWorkouts.length}</span>
                                  </div>

                                  <div className="space-y-1.5 overflow-y-auto chat-scroll flex-1 max-h-[140px] pr-1">
                                    {fitnessWorkouts.map(w => (
                                      <div key={w.id} className="flex items-center justify-between p-2 bg-stone-50 rounded-lg hover:border-primary transition duration-150 border border-transparent">
                                        <div className="flex items-center gap-2">
                                          <span className="material-symbols-outlined text-primary text-sm">{w.icon}</span>
                                          <div>
                                            <p className="text-[11px] font-bold text-on-surface">{w.type}</p>
                                            <p className="text-[9px] text-outline">{w.detail}</p>
                                          </div>
                                        </div>
                                        <button 
                                          onClick={() => setFitnessWorkouts(prev => prev.filter(x => x.id !== w.id))}
                                          className="text-on-surface-variant hover:text-error transition"
                                        >
                                          <span className="material-symbols-outlined text-xs">close</span>
                                        </button>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Easy fitness workout adder inside desktop screen */}
                                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dotted border-outline-variant/60">
                                    <select 
                                      value={newWorkoutType} 
                                      onChange={(e) => setNewWorkoutType(e.target.value)}
                                      className="text-[10px] bg-stone-50 border border-outline-variant rounded p-1 outline-none font-bold text-[#191c1e]"
                                    >
                                      <option value="Morning Run">Morning Run</option>
                                      <option value="Yoga Class">Yoga Class</option>
                                      <option value="Cyclist Session">Cycling</option>
                                    </select>
                                    <input 
                                      type="text" 
                                      value={newWorkoutDetail}
                                      onChange={(e) => setNewWorkoutDetail(e.target.value)}
                                      placeholder="4.0 km • 25m"
                                      className="text-[10px] bg-stone-50 border border-outline-variant rounded p-1 outline-none font-medium flex-1 text-[#191c1e]"
                                    />
                                    <button 
                                      onClick={handleAddWorkout}
                                      className="bg-primary text-white text-[10px] px-3.5 py-1.5 rounded font-black hover:opacity-95 cursor-pointer shrink-0"
                                    >
                                      Log Workout
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. Desktop Cash Ledger Screen */}
                        {activeScreen === 'expenses' && (
                          <div className="flex-1 flex flex-col h-full space-y-4">
                            {/* Header */}
                            <div className="flex justify-between items-center border-b border-[#2d3a34]/5 pb-3">
                              <div>
                                <h3 className="font-extrabold text-[#2d3a34] text-base leading-tight">Corporate Cash Ledger Portal</h3>
                                <p className="text-[10px] text-outline">Monitor instant ledger and financial transactions below</p>
                              </div>
                              <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                                Active Vault Account
                              </span>
                            </div>

                            {/* Ledger cash summary banner */}
                            <div className="bg-gradient-to-r from-[#122c21] to-[#244b3c] p-4.5 rounded-xl text-white flex justify-between items-center">
                              <div>
                                <p className="text-[10px] text-[#def5ea]/80 font-bold uppercase tracking-wider">Available Vault Balance</p>
                                <p className="text-2xl font-black mt-1">
                                  ${expenses.reduce((sum, item) => item.type === 'income' ? sum + item.amount : sum - item.amount, 0).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex space-x-4 text-right text-[10.5px]">
                                <div>
                                  <p className="text-emerald-400 font-bold">Total Raised</p>
                                  <p className="font-black">${expenses.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0)}</p>
                                </div>
                                <div className="border-l border-white/10 pl-4">
                                  <p className="text-rose-400 font-bold">Total Spent</p>
                                  <p className="font-black">${expenses.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Two Columns Ledger details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                              {/* Left Transactions Journal */}
                              <div className="bg-white p-4 rounded-xl border border-outline-variant flex flex-col min-h-0">
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-outline mb-2">Ledger Journal List ({expenses.length})</h4>
                                <div className="space-y-1.5 overflow-y-auto chat-scroll flex-1 max-h-[150px] pr-1">
                                  {expenses.map(e => (
                                    <div key={e.id} className="flex justify-between items-center p-2 bg-stone-50 rounded-lg hover:bg-stone-100 transition border border-[#2d3a34]/5">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className={`w-1.5 h-1.5 rounded-full ${e.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <p className="text-xs font-bold text-on-surface truncate">{e.text}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`font-mono text-xs font-black ${e.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {e.type === 'income' ? '+' : '-'}${e.amount}
                                        </span>
                                        <button 
                                          onClick={() => setExpenses(prev => prev.filter(x => x.id !== e.id))}
                                          className="text-on-surface-variant hover:text-error"
                                        >
                                          <span className="material-symbols-outlined text-[15px]">delete</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Transaction log creator */}
                              <div className="bg-white p-4 rounded-xl border border-outline-variant flex flex-col justify-between">
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-outline mb-2">Book Entry Log</h4>
                                
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <input 
                                      type="text" 
                                      value={newExpenseText}
                                      onChange={(e) => setNewExpenseText(e.target.value)}
                                      placeholder="Description..."
                                      className="text-xs bg-stone-50 border border-outline-variant rounded p-2 outline-none font-medium text-[#2d3a34]"
                                    />
                                    <input 
                                      type="number" 
                                      value={newExpenseAmount}
                                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                                      placeholder="Amount..."
                                      className="text-xs bg-stone-50 border border-outline-variant rounded p-2 outline-none font-medium text-center text-[#2d3a34]"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <button 
                                      type="button"
                                      onClick={() => setNewExpenseType('expense')}
                                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition ${newExpenseType === 'expense' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'border-outline-variant text-[#2d3a34] bg-stone-50'}`}
                                    >
                                      Debit / Expense
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => setNewExpenseType('income')}
                                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition ${newExpenseType === 'income' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-outline-variant text-[#2d3a34] bg-stone-50'}`}
                                    >
                                      Credit / Income
                                    </button>
                                  </div>
                                </div>

                                <button 
                                  onClick={handleAddExpense}
                                  className="w-full bg-[#244b3c] text-white text-xs py-2 rounded-lg font-black hover:opacity-95 cursor-pointer mt-3 text-center"
                                >
                                  Save Vault Ledger Entry
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. Desktop To Do List Checklist Screen */}
                        {activeScreen === 'todo' && (
                          <div className="flex-1 flex flex-col h-full space-y-4">
                            {/* Dashboard header */}
                            <div className="flex justify-between items-center border-b border-[#2d3a34]/5 pb-3">
                              <div>
                                <h3 className="font-extrabold text-[#2d3a34] text-base leading-tight">Agile Milestones Tracker Board</h3>
                                <p className="text-[10px] text-outline">Manage team sprints and high-priority roadblocks below</p>
                              </div>
                              <span className="text-[11px] font-bold bg-[#def5ea] text-[#1e4634] px-2.5 py-1 rounded-full">
                                Sprint 12 Ready
                              </span>
                            </div>

                            {/* Split Checklist Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                              {/* Left Side: Completion and adder form */}
                              <div className="bg-white p-4.5 rounded-xl border border-[#2d3a34]/10 shadow-sm flex flex-col justify-between">
                                <div>
                                  <h4 className="text-[11px] font-black uppercase tracking-wider text-outline mb-1">Sprint Accomplishments</h4>
                                  
                                  {/* Progress gauge card */}
                                  <div className="p-3.5 bg-[#f7f9fb] border border-outline-variant rounded-xl my-2.5">
                                    <div className="flex justify-between items-center text-[11px] font-bold text-sky-800 mb-1.5">
                                      <span>Milestones Reached</span>
                                      <span>
                                        {Math.round((todos.filter(t => t.completed).length / Math.max(1, todos.length)) * 100)}% Complete
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-[#244b3c] h-full transition-all duration-500" 
                                        style={{ width: `${(todos.filter(t => t.completed).length / Math.max(1, todos.length)) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Task Quick Form */}
                                <div className="space-y-2 pt-2 border-t border-dashed border-outline-variant/60">
                                  <label className="text-[10px] font-black text-[#2d3a34] uppercase tracking-wide">Publish New Roadblock</label>
                                  <div className="flex gap-1.5">
                                    <input 
                                      type="text" 
                                      value={newTodoText}
                                      onChange={(e) => setNewTodoText(e.target.value)}
                                      placeholder="Refactor REST validation..."
                                      className="text-xs bg-stone-50 border border-[#2d3a34]/15 rounded px-2.5 outline-none font-medium flex-1 h-9 text-[#2d3a34]"
                                    />
                                    <button 
                                      onClick={handleAddTodo}
                                      className="bg-[#244b3c] text-white text-[11px] px-4 rounded-lg font-black hover:opacity-95 shrink-0 h-9 flex items-center justify-center cursor-pointer"
                                    >
                                      Create
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Right Side: Backlog Tasks Feed */}
                              <div className="bg-white p-4.5 rounded-xl border border-[#2d3a34]/10 shadow-sm flex flex-col min-h-0">
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-outline mb-2">Backlog Feed ({todos.length})</h4>
                                <div className="space-y-1.5 overflow-y-auto chat-scroll flex-1 max-h-[160px] pr-1">
                                  {todos.map(t => (
                                    <div 
                                      key={t.id} 
                                      onClick={() => {
                                        setTodos(prev => prev.map(item => item.id === t.id ? { ...item, completed: !item.completed } : item));
                                      }}
                                      className="flex items-center justify-between p-2.5 bg-stone-50 rounded-lg hover:bg-stone-100 transition border border-[#2d3a34]/5 cursor-pointer select-none"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="material-symbols-outlined text-primary text-[18px]">
                                          {t.completed ? 'check_box' : 'check_box_outline_blank'}
                                        </span>
                                        <span className={`text-xs font-semibold text-on-surface truncate ${t.completed ? 'line-through text-outline' : ''}`}>
                                          {t.text}
                                        </span>
                                      </div>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTodos(prev => prev.filter(x => x.id !== t.id));
                                        }}
                                        className="text-on-surface-variant hover:text-error shrink-0"
                                      >
                                        <span className="material-symbols-outlined text-base">close</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. Desktop SaaS Service Performance App Screen */}
                        {activeScreen === 'saas' && (
                          <div className="flex-1 flex flex-col h-full space-y-4">
                            {/* Dashboard header */}
                            <div className="flex justify-between items-center border-b border-[#2d3a34]/5 pb-3">
                              <div>
                                <h3 className="font-extrabold text-[#2d3a34] text-base leading-tight">High-Frequency Broker Logs Console</h3>
                                <p className="text-[10px] text-outline">Manage active broker micro-nodes and inspect core logs below</p>
                              </div>
                              <span className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${isServerActive ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-rose-100 text-rose-800'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {isServerActive ? 'ONLINE' : 'STOPPED'}
                              </span>
                            </div>

                            {/* Dual Panel Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1 min-h-0">
                              {/* Left Controls column */}
                              <div className="md:col-span-2 bg-white p-4 rounded-xl border border-[#2d3a34]/10 shadow-sm flex flex-col justify-between">
                                <div>
                                  <h4 className="text-[11px] font-black uppercase tracking-wider text-outline mb-2">Cluster Hardware Controller</h4>
                                  
                                  <div className="flex justify-between items-center text-xs bg-stone-50 p-2.5 border border-outline-variant rounded-lg mt-2">
                                    <span className="font-black text-[#2d3a34]">Broker Broker Stack</span>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        setIsServerActive(!isServerActive);
                                        if(!isServerActive) {
                                          setTelemetryLogs(prev => [`Cluster startup event dispatched to zone-a`, `Handshake succeeded. REST API Online.`, ...prev]);
                                        } else {
                                          setTelemetryLogs(prev => [`Cluster offline command authenticated`, ...prev]);
                                        }
                                      }}
                                      className={`px-3 py-1 bg-[#244b3c] rounded-lg text-[10px] font-black text-white hover:opacity-90 cursor-pointer transition`}
                                    >
                                      {isServerActive ? 'Shutdown' : 'Power On'}
                                    </button>
                                  </div>

                                  <div className="space-y-1 mt-4 pt-3 border-t border-[#2d3a34]/5 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-outline">CPU Core Broker Usage:</span>
                                      <span className="font-bold text-on-surface">{cpuUsage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden my-1">
                                      <div 
                                        className={`h-full transition-all duration-300 ${cpuUsage > 80 ? 'bg-rose-500' : 'bg-primary'}`}
                                        style={{ width: `${cpuUsage}%` }}
                                      />
                                    </div>
                                    <input 
                                      type="range" 
                                      min="10" 
                                      max="100" 
                                      value={cpuUsage}
                                      onChange={(e) => setCpuUsage(Number(e.target.value))}
                                      className="w-full accent-[#244b3c] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                                    />
                                  </div>
                                </div>

                                <div className="text-[9px] text-[#2d3a34]/65 pt-2 border-t border-dotted border-outline-variant/60 font-medium">
                                  Server ID: node-727bf075-14ef-zone-a
                                </div>
                              </div>

                              {/* Right Telemetry Column */}
                              <div className="md:col-span-3 bg-white p-4 rounded-xl border border-[#2d3a34]/10 flex flex-col min-h-0">
                                <div className="flex justify-between items-center mb-1.5">
                                  <h4 className="text-[11px] font-black uppercase tracking-wider text-outline">Pristine Command log Terminal</h4>
                                  {isServerActive && <span className="text-[8px] bg-sky-100 text-sky-800 font-bold font-mono px-1.5 py-0.5 rounded animate-pulse">STREAMING</span>}
                                </div>

                                <div className="flex-1 bg-[#111827] text-emerald-400 font-mono text-[10.5px] p-3 rounded-lg overflow-y-auto chat-scroll max-h-[150px] space-y-1.5 shadow-inner">
                                  {isServerActive ? (
                                    telemetryLogs.map((log, index) => (
                                      <p key={index} className="leading-relaxed truncate">
                                        <span className="text-stone-500 select-none">[$]</span> {log}
                                      </p>
                                    ))
                                  ) : (
                                    <p className="text-stone-500 italic text-center py-6 select-none">[Nodes Offline - Power on to view logs]</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Browser Footer Navigation Mock bar */}
                      <div className="h-14 bg-stone-100 dark:bg-stone-900 border-t border-black/5 dark:border-white/5 flex justify-center items-center gap-8 px-6 shrink-0 select-none">
                        <button 
                          onClick={() => setActiveScreen('fitness')}
                          className={`flex items-center gap-1.5 text-xs font-bold transition px-4 py-2 rounded-lg ${activeScreen === 'fitness' ? 'bg-[#244b3c]/10 text-primary' : 'text-stone-500 hover:text-stone-800'}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">home</span>
                          <span className="hidden sm:inline font-bold">Fitness Center</span>
                        </button>
                        <button 
                          onClick={() => setActiveScreen('expenses')}
                          className={`flex items-center gap-1.5 text-xs font-bold transition px-4 py-2 rounded-lg ${activeScreen === 'expenses' ? 'bg-[#244b3c]/10 text-primary' : 'text-stone-500 hover:text-stone-800'}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">explore</span>
                          <span className="hidden sm:inline font-bold">Finance Ledger</span>
                        </button>
                        <button 
                          onClick={() => setActiveScreen('todo')}
                          className={`flex items-center gap-1.5 text-xs font-bold transition px-4 py-2 rounded-lg ${activeScreen === 'todo' ? 'bg-[#244b3c]/10 text-primary' : 'text-stone-500 hover:text-stone-800'}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">leaderboard</span>
                          <span className="hidden sm:inline font-bold">Sprint Tasks</span>
                        </button>
                        <button 
                          onClick={() => setActiveScreen('saas')}
                          className={`flex items-center gap-1.5 text-xs font-bold transition px-4 py-2 rounded-lg ${activeScreen === 'saas' ? 'bg-[#244b3c]/10 text-primary' : 'text-stone-500 hover:text-stone-800'}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">settings</span>
                          <span className="hidden sm:inline font-bold">SaaS Console</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </section>

              {/* Right Panel: Chat Interface precisely mirroring HTML structure */}
              <section className={`w-full lg:w-[500px] h-full border-l border-outline-variant bg-surface-container-lowest flex flex-col ${mobileSubTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-outline-variant hidden lg:flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-primary text-[18px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    </div>
                    <div>
                      <h2 className="font-headline-md text-body-lg font-bold">Prompt Architect</h2>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Ready to build</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-1.5 hover:bg-surface-container rounded-md transition-colors text-outline">
                      <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 chat-scroll">
                  {messages.map(msg => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full"
                    >
                      {msg.sender === 'user' ? (
                        /* User Message alignment with edit option built-in */
                        <div className="flex flex-col items-end gap-2 text-right">
                          <div className="max-w-[85%] bg-[#244b3c] select-text text-white p-4 rounded-2xl rounded-tr-none shadow-lg text-left relative group">
                            {editingMessageId === msg.id ? (
                              <div className="flex flex-col gap-2.5 w-72 md:w-80">
                                <textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="w-full text-xs p-2 bg-stone-900 border border-emerald-500 rounded-lg text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                  rows={3}
                                />
                                <div className="flex justify-end gap-2 text-[10px]">
                                  <button
                                    onClick={() => setEditingMessageId(null)}
                                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded cursor-pointer transition font-bold"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEditMessage(msg.id)}
                                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold rounded cursor-pointer transition"
                                  >
                                    Save & Regenerate
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-body-sm leading-relaxed text-slate-100 pr-5 select-text">{msg.text}</p>
                                <button
                                  onClick={() => handleStartEditMessage(msg.id, msg.text)}
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-emerald-200 hover:text-white transition cursor-pointer"
                                  title="Edit Prompt"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                          <span className="text-[10px] text-outline px-1">{msg.time}</span>
                        </div>
                      ) : msg.isCustomLovableCard ? (
                        /* Ultra fidelity Lovable card representation based on second image */
                        <div className="flex flex-col items-start gap-4 w-full select-none mt-2">
                          {/* Chat Sender Header */}
                          <div className="flex items-center gap-2 select-none">
                            <span className="w-5.5 h-4.5 text-[10px] font-bold text-white bg-zinc-800 rounded-full flex items-center justify-center p-2.5">
                              L
                            </span>
                            <span className="font-sans text-[11.5px] font-bold text-zinc-400">Lovable AI</span>
                          </div>

                          {/* 1. Thoughts dropdown accordion wrapper */}
                          <div className="w-full bg-[#18181b]/35 border border-zinc-800/60 rounded-2xl p-4 text-left transition-all">
                            <button 
                              type="button"
                              onClick={() => setIsThoughtsExpanded(!isThoughtsExpanded)}
                              className="w-full flex items-center gap-1.5 text-zinc-400 text-xs font-semibold cursor-pointer border-none bg-transparent"
                            >
                              <span className={`material-symbols-outlined text-[15px] font-bold transition-transform duration-250 ${isThoughtsExpanded ? 'rotate-90 text-white' : ''}`}>chevron_right</span>
                              <span className="font-sans">Thought for 8s</span>
                            </button>

                            {isThoughtsExpanded && (
                              <div className="mt-2.5 text-zinc-300 font-sans text-xs leading-relaxed border-l-2 border-emerald-500/85 pl-3 italic">
                                "{msg.text}"
                              </div>
                            )}
                          </div>

                          {/* 2. Beautiful Dark Task Checklist Card (Blue bordered border-blue-500/30) */}
                          <div className="w-full bg-[#121214] border border-blue-500/35 rounded-[22px] p-5 shadow-2xl flex flex-col space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="font-sans text-[14.5px] font-bold text-white tracking-tight">Gallery upload + real analytics</h3>
                              <span className="material-symbols-outlined text-zinc-400 text-[18px] cursor-pointer hover:text-white transition">bookmark</span>
                            </div>

                            <div className="space-y-3.5">
                              {/* Task item 1 (Fix publish flow - with warning icon) */}
                              <div className="flex items-start gap-2.5 text-xs text-zinc-200">
                                <span className="material-symbols-outlined text-[17px] text-amber-500 font-bold shrink-0 mt-0.5">error</span>
                                <span className="font-medium">Fix publish flow</span>
                              </div>

                              {/* Task item 2 (Add image uploads - unchecked circle) */}
                              <div className="flex items-start gap-2.5 text-xs text-zinc-400 select-none">
                                <span className="material-symbols-outlined text-[17.5px] text-zinc-600 shrink-0 mt-0.5">radio_button_unchecked</span>
                                <span className="font-medium">Add image uploads</span>
                              </div>

                              {/* Task item 3 (Real counts and analytics - unchecked circle) */}
                              <div className="flex items-start gap-2.5 text-xs text-zinc-400 select-none">
                                <span className="material-symbols-outlined text-[17.5px] text-zinc-600 shrink-0 mt-0.5">radio_button_unchecked</span>
                                <span className="font-medium">Real counts and analytics</span>
                              </div>
                            </div>

                            {/* Dual card triggers */}
                            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-zinc-850/60">
                              <button 
                                type="button"
                                onClick={() => {
                                  setAlertText("Detailed dashboard checklist analytics: all mock metrics sync logs loaded below.");
                                  setIsAlertOpen(true);
                                }}
                                className="bg-[#1b1b1f] border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold py-2 rounded-xl text-center transition duration-150 text-[11.5px] cursor-pointer"
                              >
                                Details
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  setMobileSubTab('preview');
                                }}
                                className="bg-zinc-800 hover:bg-zinc-750 text-white font-black py-2 rounded-xl text-center transition duration-150 text-[11.5px] cursor-pointer border-none"
                              >
                                Preview
                              </button>
                            </div>
                          </div>

                          {/* 3. Lovable Hindi Output text */}
                          <div className="text-left">
                            <p className="text-zinc-300 font-sans text-xs leading-relaxed font-medium">
                              हो गया—game publish/upload अब real है, logo/icon/screenshots gallery से upload होंगे, fake downloads zero/real counts पर हैं और analytics real events से चलेगी।
                            </p>
                          </div>

                          <div className="flex items-center gap-2 select-none">
                            <span className="text-[10px] text-outline">{msg.time}</span>
                            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-950/40 px-1.5 py-0.5 rounded">Deployed</span>
                          </div>
                        </div>
                      ) : (
                        /* AI Assistant Dialog align mapping */
                        <div className="flex flex-col items-start gap-3 w-full">
                          <div className="flex items-center justify-between w-full select-none">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-[#244b3c] flex items-center justify-center text-white shadow-emerald-500/10 shadow-sm border border-emerald-500/20">
                                <span className="material-symbols-outlined text-[13px] text-white">auto_awesome</span>
                              </div>
                              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#244b3c] dark:text-emerald-400">BuildCraft Architect</span>
                            </div>
                            
                            {/* Action Row: Copy response */}
                            <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.text);
                                  showToast('Response text copied to clipboard!', 'success');
                                }}
                                className="p-1 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold border-none"
                                title="Copy Response"
                              >
                                <Copy className="w-3 h-3 text-current" />
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>
                          
                          <div className="max-w-[95%] w-full bg-white dark:bg-zinc-900 border border-[#2d3a34]/15 dark:border-zinc-800 shadow-sm select-text p-5 rounded-2xl rounded-tl-none space-y-4 text-left">
                            {/* Standard Rich Markdown Rendering */}
                            <div className="markdown-body text-body-sm text-[#1e3d30] dark:text-zinc-200 select-text">
                              <Markdown>{msg.text}</Markdown>
                            </div>
                            
                            {/* Checklist mapping if exists */}
                            {msg.checklist && msg.checklist.length > 0 && (
                              <div className="border-t border-slate-100 dark:border-zinc-800/60 pt-3 mt-3">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider mb-2 select-none">Implementation Checklist</h4>
                                <ul className="space-y-2 text-body-sm select-none">
                                  {msg.checklist.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-zinc-400">
                                      <span className="material-symbols-outlined text-[15px] text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">check_circle</span>
                                      <span className="font-medium text-xs leading-tight">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Download Attachment trigger if exists */}
                            {msg.fileAttachment && (
                              <div 
                                onClick={() => {
                                  showToast(`Downloading file "${msg.fileAttachment?.name}" completed successfully!`, 'success');
                                  setAlertText(`Exported source file "${msg.fileAttachment?.name}" code templates to local download queue.`);
                                  setIsAlertOpen(true);
                                }}
                                className="p-3 bg-stone-50 dark:bg-zinc-800/40 hover:bg-emerald-50/45 dark:hover:bg-zinc-800/45 rounded-xl border border-black/5 dark:border-zinc-800 flex items-center justify-between group cursor-pointer hover:border-emerald-600 transition-all select-none"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">analytics</span>
                                  <span className="text-[11.5px] font-bold text-slate-700 dark:text-zinc-300 leading-none">{msg.fileAttachment.name} ({msg.fileAttachment.size})</span>
                                </div>
                                <span className="material-symbols-outlined text-outline group-hover:text-emerald-600 transition-colors">download</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Render custom Regenerate Response option but ONLY for the last AI reply! */}
                          {messages[messages.length - 1].id === msg.id && (
                            <div className="pl-1 select-none">
                              <button
                                onClick={handleRegenerateResponse}
                                className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider text-slate-450 hover:text-slate-800 dark:hover:text-white transition cursor-pointer border-none"
                                title="Regenerate Last Prompt Response"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Regenerate Response</span>
                              </button>
                            </div>
                          )}
                          
                          <span className="text-[10px] text-outline px-1">{msg.time}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {isGenerating && (
                    <div className="flex flex-col items-start gap-3 w-full animate-pulse select-none">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#244b3c] flex items-center justify-center text-white border border-emerald-500/20">
                          <span className="material-symbols-outlined text-[13px] text-emerald-400">auto_awesome</span>
                        </div>
                        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#244b3c] dark:text-emerald-400">Architect is designing...</span>
                      </div>
                      
                      <div className="max-w-[90%] w-full bg-stone-50 dark:bg-zinc-900 border border-dotted border-[#2d3a34]/15 dark:border-zinc-805 p-5 rounded-2xl rounded-tl-none space-y-3.5">
                        <div className="h-3 bg-stone-250 dark:bg-zinc-750 rounded w-1/3" />
                        <div className="space-y-2">
                          <div className="h-3.5 bg-stone-200 dark:bg-zinc-800 rounded w-full" />
                          <div className="h-3.5 bg-stone-200 dark:bg-zinc-800 rounded w-11/12" />
                          <div className="h-3.5 bg-stone-200 dark:bg-zinc-800 rounded w-2/3" />
                        </div>
                        <div className="pt-2 flex gap-1.5 opacity-65">
                          <div className="h-6 bg-stone-300 dark:bg-zinc-700 rounded-full w-20" />
                          <div className="h-6 bg-stone-300 dark:bg-zinc-700 rounded-full w-24" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Anchor scroll point */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Prompt Chat inputs */}
                <div className="p-4 border-t border-outline-variant/40 bg-surface">
                  <AnimatePresence mode="wait">
                    {isChatVoiceActive ? (
                      <VoiceSTT 
                        onCancel={() => setIsChatVoiceActive(false)}
                        onConfirm={(transcriptText) => {
                          setPromptInput((prev) => prev ? `${prev} ${transcriptText}` : transcriptText);
                          setIsChatVoiceActive(false);
                        }}
                      />
                    ) : (
                      <motion.form 
                        onSubmit={handleGenerateSubmit}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                        }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className={`w-full bg-[#18181b] border rounded-[28px] p-3 flex items-center justify-between gap-2.5 relative transition-all duration-300 ${
                          isChatPromptFocused 
                            ? 'border-zinc-700 shadow-[0_4px_24px_rgba(0,0,0,0.4)]' 
                            : 'border-zinc-800/85 shadow-[0_2px_12px_rgba(0,0,0,0.1)]'
                        }`}
                      >
                        {/* Left Side Buttons: Plus Icon and Options Icon */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* 1. Styled Circular Attach Plus button */}
                          <div className="relative">
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setIsChatPlusMenuOpen(!isChatPlusMenuOpen);
                              }}
                              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-350 flex items-center justify-center transition border-none cursor-pointer"
                              title="Attach file"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            <AnimatePresence>
                              {isChatPlusMenuOpen && (
                                <div className="absolute bottom-10 left-0 z-50">
                                  <PlusMenu 
                                    onSelectOption={(textOption) => {
                                      setPromptInput((prev) => prev ? `${prev} & ${textOption}` : `Refine layout ${textOption}`);
                                    }}
                                    onClose={() => setIsChatPlusMenuOpen(false)}
                                    themeMode={themeMode}
                                  />
                                </div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* 2. Styled Deep Thinking Toggle button  */}
                          <button 
                            type="button"
                            onClick={() => setIsDeepThinking(!isDeepThinking)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer border-none ${isDeepThinking ? 'bg-emerald-950/75 text-emerald-400' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'}`}
                            title="Toggle Deep Thinking mode"
                          >
                            <Brain className={`w-3.5 h-3.5 ${isDeepThinking ? 'animate-pulse text-emerald-400' : ''}`} />
                          </button>
                        </div>

                        {/* Input Area */}
                        <div className="flex-1 flex items-center relative min-w-0">
                          <input
                            type="text"
                            value={promptInput}
                            onChange={(e) => setPromptInput(e.target.value)}
                            onFocus={() => setIsChatPromptFocused(true)}
                            onBlur={() => setIsChatPromptFocused(false)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleGenerateSubmit(e);
                              }
                            }}
                            placeholder="Ask Lovable..."
                            className="w-full bg-transparent text-white placeholder-zinc-500 font-sans text-[13.5px] leading-none focus:outline-none focus:ring-0 border-none outline-none py-1.5"
                          />
                          {promptInput && (
                            <button 
                              type="button" 
                              onClick={() => setPromptInput('')} 
                              className="absolute right-0 text-xs text-zinc-500 hover:text-white transition px-2 py-1 bg-transparent border-none cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px] font-bold">cancel</span>
                            </button>
                          )}
                        </div>

                        {/* Right Side Buttons: Mic Activator / Submit Arrow icon */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setIsChatVoiceActive(true)}
                            title="Toggle voice activation"
                            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 flex items-center justify-center border-none cursor-pointer"
                          >
                            <Mic className="w-3.5 h-3.5 text-zinc-350" />
                          </button>

                          {isGenerating ? (
                            <button 
                              type="button"
                              onClick={handleStopGeneration}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition shrink-0 border-none bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer"
                              title="Stop Generation"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                            </button>
                          ) : (
                            <button 
                              type="submit"
                              disabled={!promptInput.trim()}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition shrink-0 border-none ${
                                promptInput.trim() 
                                  ? 'bg-[#282830] text-white hover:bg-zinc-700 shadow-sm' 
                                  : 'bg-[#1a1a20] text-zinc-600 cursor-not-allowed'
                              }`}
                              title="Submit prompt request"
                            >
                              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          )}
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            </div>
          )}

          {/* Tab 2: Dashboard Overview */}
          {currentTab === 'Dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto p-8 space-y-8 text-left"
            >
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Cloud Infrastructure Dashboard</h2>
                <p className="text-body-sm text-on-surface-variant">Review live performance telemetry stats and deployment statuses.</p>
              </div>

              {/* Matrix general summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-3xl mb-1">cloud_done</span>
                  <p className="text-xs text-outline font-bold uppercase mt-2">Active Deployment</p>
                  <p className="text-2xl font-black mt-1 text-on-surface">Live Online</p>
                  <span className="text-[10px] text-primary font-bold">Synced with Firestore DB</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-3xl mb-1">speed</span>
                  <p className="text-xs text-outline font-bold uppercase mt-2">System Response Latency</p>
                  <p className="text-2xl font-black mt-1 text-on-surface">1.2 seconds</p>
                  <span className="text-[10px] text-primary font-bold">Excellent response index</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-3xl mb-1">view_carousel</span>
                  <p className="text-xs text-outline font-bold uppercase mt-2">Compiled Layout Screens</p>
                  <p className="text-2xl font-black mt-1 text-on-surface">4 Screens</p>
                  <span className="text-[10px] text-primary font-bold">Fitness, Expenses, Todo, SaaS</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-3xl mb-1">terminal</span>
                  <p className="text-xs text-outline font-bold uppercase mt-2">Workspace Build Logs</p>
                  <p className="text-2xl font-black mt-1 text-on-surface">Ready state</p>
                  <span className="text-[10px] text-primary font-bold">0 deployment warnings</span>
                </div>
              </div>

              {/* Table listing current active mock views */}
              <div className="bg-white p-6 border border-outline-variant/70 rounded-2xl space-y-4">
                <h3 className="font-headline-md text-base font-bold text-on-surface">Available Sandboxed App Modules</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-on-surface-variant">
                    <thead className="text-[11px] font-bold uppercase bg-surface-container-low text-outline">
                      <tr>
                        <th className="p-3">Module Indicator</th>
                        <th className="p-3">Primary Tech Stack</th>
                        <th className="p-3">Total Components</th>
                        <th className="p-3">Cloud Persistence</th>
                        <th className="p-3">Workspace Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/60 text-xs">
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-on-surface">Fitness & Daily Steps Tracker</td>
                        <td className="p-3">React 19, SVG Circular metrics</td>
                        <td className="p-3">5 Modules</td>
                        <td className="p-3 text-primary font-bold">Enabled</td>
                        <td className="p-3"><span className="bg-primary/10 text-primary font-bold px-2.5 py-1 rounded">Fully Functional</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-on-surface">Interactive Expenses Account Ledger</td>
                        <td className="p-3">D3 Micro-tally, Budget calculations</td>
                        <td className="p-3">4 Modules</td>
                        <td className="p-3 text-primary font-bold">Enabled</td>
                        <td className="p-3"><span className="bg-primary/10 text-primary font-bold px-2.5 py-1 rounded">Fully Functional</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-on-surface">Milestones Checklist & Todo Map</td>
                        <td className="p-3">Dynamic toggle reducers, UI checklist</td>
                        <td className="p-3">3 Modules</td>
                        <td className="p-3 text-outline">Disabled (Local rules cache)</td>
                        <td className="p-3"><span className="bg-primary/10 text-primary font-bold px-2.5 py-1 rounded">Fully Functional</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-on-surface">SaaS Server Cockpit & CPU Telemetry</td>
                        <td className="p-3">Pulsing telemetry graphs, API sockets</td>
                        <td className="p-3">6 Modules</td>
                        <td className="p-3 text-primary font-bold">Active Stream</td>
                        <td className="p-3"><span className="bg-primary/10 text-primary font-bold px-2.5 py-1 rounded">Fully Functional</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Console system alerts block */}
              <div className="p-6 bg-[#191c1e] text-emerald-400 rounded-2xl border border-outline-variant/40 font-mono text-xs space-y-2">
                <p className="text-outline uppercase text-[10px] tracking-wider font-bold mb-2">// System Live Compilation output logs</p>
                <p><span className="text-outline">INFO</span> [Vite Compiler Host] Hot Module Reload server established successfully inside isolated container sandbox.</p>
                <p><span className="text-outline">INFO</span> [Firestore Auth] Session authentication tokens refreshed with zero warnings.</p>
                <p><span className="text-outline">INFO</span> [Cloud Run Host] Provisioned server listening beautifully on port 3000.</p>
                <p><span className="text-outline">SUCCESS</span> [BuildCraft Core] A to Z dashboard components synchronized.</p>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Screens choosing platform */}
          {currentTab === 'Screens' && (
            <motion.div 
              key="screens"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto p-8 space-y-6 text-left"
            >
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-1">Sandbox Templates & Screens Library</h2>
                <p className="text-body-sm text-on-surface-variant">Click any preview card to instantly activate and boot up that application inside the phone frame mockup!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Screen 1 */}
                <div 
                  onClick={() => {
                    setActiveScreen('fitness');
                    setCurrentTab('Chat');
                  }}
                  className={`bg-white border rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition duration-300 relative group flex flex-col justify-between h-[200px] ${activeScreen === 'fitness' ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/60 hover:border-primary/50'}`}
                >
                  <div>
                    <span className="material-symbols-outlined text-primary text-4xl mb-2">directions_run</span>
                    <h3 className="font-bold text-sm text-on-surface">Fitness Tracker App</h3>
                    <p className="text-[11px] text-on-surface-variant mt-1">Circular step target percentages, recent workout log additions and caloric burn math modules.</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary group-hover:underline flex items-center gap-1">
                    Activate Screen <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Screen 2 */}
                <div 
                  onClick={() => {
                    setActiveScreen('expenses');
                    setCurrentTab('Chat');
                  }}
                  className={`bg-white border rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition duration-300 relative group flex flex-col justify-between h-[200px] ${activeScreen === 'expenses' ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/60 hover:border-primary/50'}`}
                >
                  <div>
                    <span className="material-symbols-outlined text-primary text-4xl mb-2">payments</span>
                    <h3 className="font-bold text-sm text-on-surface">Expenses Ledger App</h3>
                    <p className="text-[11px] text-on-surface-variant mt-1">Live calculated balances, interactive ledger rows, type tags, and transaction deletes.</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary group-hover:underline flex items-center gap-1">
                    Activate Screen <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Screen 3 */}
                <div 
                  onClick={() => {
                    setActiveScreen('todo');
                    setCurrentTab('Chat');
                  }}
                  className={`bg-white border rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition duration-300 relative group flex flex-col justify-between h-[200px] ${activeScreen === 'todo' ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/60 hover:border-primary/50'}`}
                >
                  <div>
                    <span className="material-symbols-outlined text-primary text-4xl mb-2">checklist</span>
                    <h3 className="font-bold text-sm text-on-surface">To-Do Milestone Planner</h3>
                    <p className="text-[11px] text-on-surface-variant mt-1">Completed task ratios index, interactive checkbox toggles, and new milestone addition forms.</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary group-hover:underline flex items-center gap-1">
                    Activate Screen <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Screen 4 */}
                <div 
                  onClick={() => {
                    setActiveScreen('saas');
                    setCurrentTab('Chat');
                  }}
                  className={`bg-white border rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition duration-300 relative group flex flex-col justify-between h-[200px] ${activeScreen === 'saas' ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/60 hover:border-primary/50'}`}
                >
                  <div>
                    <span className="material-symbols-outlined text-primary text-4xl mb-2">terminal</span>
                    <h3 className="font-bold text-sm text-on-surface">SaaS Server Cockpit</h3>
                    <p className="text-[11px] text-on-surface-variant mt-1">Active CPU loading bars, switch toggles, streaming telemetry checks, and online status beacons.</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary group-hover:underline flex items-center gap-1">
                    Activate Screen <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 4: Components overview code list */}
          {currentTab === 'Components' && (
            <motion.div 
              key="components"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto p-8 space-y-6 text-left"
            >
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-1">Reusable UI Components Suite</h2>
                <p className="text-body-sm text-on-surface-variant">Access and view clean implementation codes for our modular React & Tailwind components.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 border border-outline-variant/60 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50">
                    <span className="text-xs font-bold font-mono text-primary">CircularSvgStepsDonut.tsx</span>
                    <button 
                      onClick={() => {
                        setAlertText('Raw code of Steps Donut component successfully copied to system clipboard!');
                        setIsAlertOpen(true);
                      }}
                      className="text-xs text-primary font-bold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">file_copy</span> Copy Code
                    </button>
                  </div>
                  <pre className="bg-[#191c1e] text-slate-100 font-mono text-[10.5px] p-4 rounded-xl overflow-x-auto h-44 border border-outline-variant/25">
{`export function SvgStepsDonut({ steps = 8432 }) {
  const target = 12000;
  const percentage = (steps / target) * 100;
  return (
    <svg className="w-44 h-44">
      <circle cx="88" cy="88" r="70" stroke="#f1f5f9" strokeWidth="12" fill="none" />
      <circle cx="88" cy="88" r="70" stroke="#006875" strokeWidth="12" fill="none"
        strokeDasharray="440" strokeDashoffset={440 - (percentage/100)*440} />
    </svg>
  );
}`}
                  </pre>
                </div>

                <div className="bg-white p-6 border border-outline-variant/60 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50">
                    <span className="text-xs font-bold font-mono text-primary">ExpenseLedgerForm.tsx</span>
                    <button 
                      onClick={() => {
                        setAlertText('Raw code of Expense Ledger form successfully copied to system clipboard!');
                        setIsAlertOpen(true);
                      }}
                      className="text-xs text-primary font-bold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">file_copy</span> Copy Code
                    </button>
                  </div>
                  <pre className="bg-[#191c1e] text-slate-100 font-mono text-[10.5px] p-4 rounded-xl overflow-x-auto h-44 border border-outline-variant/25">
{`export function ExpenseLogger({ onSave }) {
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  return (
    <div className="p-3 bg-slate-50 border rounded-xl">
      <input type="text" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
      <input type="number" placeholder="Amount" value={amt} onChange={e => setAmt(e.target.value)} />
      <button onClick={() => onSave({ desc, amt: parseFloat(amt) })}>Save Log</button>
    </div>
  );
}`}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 5: Database Schema explorer */}
          {currentTab === 'Database' && (
            <motion.div 
              key="database"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto p-8 space-y-6 text-left"
            >
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-1">Sandbox Live Firestore Database</h2>
                <p className="text-body-sm text-on-surface-variant">Examine current state structures populated from active mockup operations in real time.</p>
              </div>

              {/* Steps database table */}
              <div className="bg-white p-6 border border-outline-variant/70 rounded-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
                  <h3 className="font-bold text-sm text-on-surface font-headline-md">Collection: steps_stats</h3>
                  <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">2 active documents</span>
                </div>
                <div className="bg-[#191c1e] text-emerald-400 font-mono text-xs p-4 rounded-xl">
{`{
  "document_id": "current_account_steps",
  "steps_total": ${fitnessSteps},
  "kcal_burned": ${Math.round(fitnessSteps * 0.043)},
  "active_minutes": ${Math.round(fitnessSteps / 180)},
  "last_synchronized": "${new Date().toISOString()}"
}`}
                </div>
              </div>

              {/* Transactions list schema */}
              <div className="bg-white p-6 border border-outline-variant/70 rounded-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
                  <h3 className="font-bold text-sm text-on-surface font-headline-md">Collection: transaction_entries</h3>
                  <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{expenses.length} documents</span>
                </div>
                <div className="bg-[#191c1e] text-emerald-400 font-mono text-xs p-4 rounded-xl max-h-[170px] overflow-y-auto chat-scroll">
                  <pre>{JSON.stringify(expenses, null, 2)}</pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 6: Logic Graph Editor */}
          {currentTab === 'Logic' && (
            <motion.div 
              key="logic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto p-8 space-y-6 text-left"
            >
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-1">BuildCraft Logic Graph Workflow</h2>
                <p className="text-body-sm text-on-surface-variant font-medium">Model API processes, state hooks, and action routers inside a node diagram.</p>
              </div>

              {/* Workflow SVG chart or node preview */}
              <div className="p-8 bg-surface-container-low border border-outline-variant rounded-2xl min-h-[400px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#bac9cc_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                  
                  {/* Node 1 */}
                  <div className="bg-white p-4.5 rounded-xl border border-outline-variant/85 shadow-sm min-w-[200px] text-left">
                    <span className="text-[10px] bg-primary/10 text-primary uppercase font-bold px-2 py-0.5 rounded inline-block mb-2">TRIGGER</span>
                    <h4 className="font-bold text-xs">On Workout Logged</h4>
                    <p className="text-[10.5px] text-outline mt-1 leading-normal">Fires when user logs steps or clicks Add Workout button inside the mockup.</p>
                  </div>

                  <span className="material-symbols-outlined text-outline text-3xl">arrow_forward</span>

                  {/* Node 2 */}
                  <div className="bg-white p-4.5 rounded-xl border border-outline-variant/85 shadow-sm min-w-[200px] text-left">
                    <span className="text-[10px] bg-secondary-container text-on-secondary-container uppercase font-bold px-2 py-0.5 rounded inline-block mb-2">COMPUTE</span>
                    <h4 className="font-bold text-xs">Calculate Caloric Metric</h4>
                    <p className="text-[10.5px] text-outline mt-1 leading-normal">Runs multiplier "steps * 0.043" to compute total Calories lost instantly.</p>
                  </div>

                  <span className="material-symbols-outlined text-outline text-3xl">arrow_forward</span>

                  {/* Node 3 */}
                  <div className="bg-white p-4.5 rounded-xl border border-outline-variant/85 shadow-sm min-w-[200px] text-left">
                    <span className="text-[10px] bg-primary/10 text-primary uppercase font-bold px-2 py-0.5 rounded inline-block mb-2">ACTION</span>
                    <h4 className="font-bold text-xs">Update Firestore Record</h4>
                    <p className="text-[10.5px] text-outline mt-1 leading-normal">Locks down computed steps and state directly to cash ledger schema document.</p>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 7: Settings Custom workspace edit */}
          {currentTab === 'Settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto p-8 space-y-6 text-left"
            >
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-1">Sandbox Master Settings</h2>
                <p className="text-body-sm text-on-surface-variant font-medium">Configure active branding metadata, mock database resets, and workspace options.</p>
              </div>

              <div className="bg-white p-6 border border-outline-variant/60 rounded-2xl space-y-6 max-w-2xl">
                {/* App Name input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider">Workspace Application Title</label>
                  <input 
                    type="text" 
                    value={appTitle}
                    onChange={(e) => setAppTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-outline-variant/80 focus:border-primary focus:ring-0 rounded-xl p-3 text-sm text-on-surface outline-none"
                    placeholder="Enter Custom Workspace Title"
                  />
                  <p className="text-[10px] text-outline font-semibold">Editing this instantly updates the BuildCraft persistent branding logo on the SideNavBar.</p>
                </div>

                {/* Simulated API Secret details */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider">GEMINI_API_KEY Indicator</label>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      value="AI_Studio_Server_Secured_Token_Proxy_Verified"
                      disabled
                      className="w-full bg-surface-container-low border border-outline-variant text-[#00626e] rounded-xl p-3 text-xs tracking-widest outline-none opacity-80"
                    />
                    <span className="bg-primary/10 border border-primary/25 text-primary text-[10px] px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-center">
                      SECURED
                    </span>
                  </div>
                  <p className="text-[10px] text-outline font-semibold">API key managed via sandbox container secret store to keep keys invisible to browser diagnostics.</p>
                </div>

                {/* Firestore credentials setup help list */}
                <div className="bg-surface-container-low border border-outline-variant/60 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold font-headline-md text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">shield_check</span>
                    Active Firestore Connection Rules Status
                  </h4>
                  <ul className="space-y-1 text-[11px] text-on-surface-variant font-medium">
                    <li>- Collection path: "projects" & "showcase" fully mapped on project database config</li>
                    <li>- Auth fallback initialized seamlessly under safe local storage sandbox logic</li>
                    <li>- Secure Firestore Rules cached successfully</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Login modal portal wrapper */}
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={(email) => {
          setUserEmail(email);
          setNotificationCount(prev => prev + 1);
        }}
      />

      {/* Onboarding Welcome Screen Guide overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ 
              opacity: 0, 
              y: -50, 
              scale: 0.98,
              transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } 
            }}
            className={`fixed inset-0 z-[200] flex flex-col overflow-y-auto select-none font-sans transition-colors duration-1000 ${activeTheme.bg} ${activeTheme.textMain}`}
          >
            
            {/* Background images for immersive visual feeling */}
            <div className="absolute top-0 left-0 w-full h-[95vh] md:h-[110vh] overflow-hidden pointer-events-none z-0">
              <div className={`absolute inset-0 bg-gradient-to-b ${activeTheme.bgOverlay} z-10 transition-all duration-1000`} />
              
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
            <div className="absolute top-0 left-0 w-full h-[100vh] bg-gradient-to-t from-transparent via-emerald-50/10 to-transparent z-1 pointer-events-none" />

            {/* Top Toolbar controls */}
            {/* Top Toolbar Navigation Header */}
            <header className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between z-30 shrink-0">
              {/* Logo */}
              <div className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative w-7 h-7 flex items-center justify-center">
                  <span className={`absolute inset-0 ${themeMode === 'night' ? 'bg-emerald-500/20' : 'bg-emerald-500/10'} rounded-full blur-sm group-hover:bg-emerald-500/20 transition-all duration-300`} />
                  <div className={`relative w-5 h-5 border-2 ${themeMode === 'night' ? 'border-emerald-400' : 'border-emerald-700/80'} rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300`}>
                    <div className={`w-1.5 h-1.5 ${themeMode === 'night' ? 'bg-emerald-400' : 'bg-emerald-700'} rounded-full`} />
                  </div>
                </div>
                <span className={`font-display font-semibold text-lg tracking-tight transition-colors duration-1000 ${themeMode === 'night' ? 'text-[#e9f2ec]' : 'text-[#1e3d30]'}`}>Erere</span>
              </div>

              {/* Navigation links - Auto hidden on small screens */}
              <nav className={`hidden md:flex items-center space-x-1 lg:space-x-2 text-[13.5px] font-medium transition-colors duration-1000 ${themeMode === 'night' ? 'text-zinc-300' : 'text-[#2c5341]'}`}>
                {['Products', 'For work', 'Resources', 'Pricing', 'Careers'].map((lbl, idx) => (
                  <button key={idx} className={`px-3 py-1.5 rounded-lg transition duration-150 ${themeMode === 'night' ? 'hover:text-white hover:bg-zinc-850/80' : 'hover:text-emerald-950 hover:bg-[#e1efe8]/60'}`}>
                    {lbl}
                  </button>
                ))}
              </nav>

              {/* Header Right controllers */}
              <div className="flex items-center space-x-3.5 sm:space-x-4">
                {/* Dynamically active time atmosphere syncer widget built beautifully */}
                <div 
                  onClick={() => {
                    setIsAutoTheme(false);
                    const list: ThemeMode[] = ['morning', 'afternoon', 'sunset', 'night'];
                    const nextIdx = (list.indexOf(themeMode) + 1) % list.length;
                    setThemeMode(list[nextIdx]);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[11.5px] font-semibold select-none transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 ${
                    themeMode === 'night' 
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400 shadow-lg shadow-emerald-900/10' 
                      : themeMode === 'sunset'
                      ? 'bg-[#feeadd]/70 border-[#f3cfb6] text-[#ca5a27]'
                      : 'bg-[#def5ea]/80 border-[#b2e5cc]/55 text-emerald-800'
                  }`}
                  title="Atmosphere Syncer"
                >
                  {themeMode === 'morning' ? <CloudSun className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> :
                   themeMode === 'afternoon' ? <Sun className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" /> :
                   themeMode === 'sunset' ? <Sunset className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> :
                   <Moon className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
                  <span className="hidden sm:inline-block capitalize">
                    {themeMode} Environment
                  </span>
                </div>

                <button 
                  onClick={() => setShowWelcome(false)}
                  className={`px-4 py-1.5 rounded-full border text-sans text-[13.5px] font-medium transition-all active:scale-95 cursor-pointer ${
                    themeMode === 'night' 
                      ? 'bg-emerald-500 text-black border-transparent hover:bg-emerald-400' 
                      : 'border-emerald-950/15 hover:border-emerald-950/35 text-emerald-900 bg-[#def5ea]/40 hover:bg-[#def5ea]/80'
                  }`}
                >
                  Enter Workspace
                </button>
              </div>

            </header>

            {/* Main Center Content Section */}
            <main className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-10 sm:pt-16 pb-8 flex flex-col items-center justify-center text-center shrink-0">
              
              <h1 className={`text-3xl sm:text-5xl md:text-6xl font-sans font-semibold tracking-tight leading-[1.2] ${activeTheme.textMain} select-none max-w-3xl transition-colors duration-1000`}>
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

              <motion.p 
                initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.1, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={`mt-6 ${activeTheme.textMuted} font-sans font-light text-base sm:text-lg max-w-xl transition-colors duration-1000`}
              >
                Turn ideas into functional apps — in minutes — no coding experience needed
              </motion.p>

              {/* Dynamic Interactive Input wrapper based on Active states */}
              <AnimatePresence mode="wait">
                {isVoiceActive ? (
                  <VoiceSTT 
                    onCancel={() => setIsVoiceActive(false)}
                    onConfirm={(transcriptText) => {
                      setLandingPrompt((prev) => prev ? `${prev} ${transcriptText}` : transcriptText);
                      setIsVoiceActive(false);
                    }}
                  />
                ) : (
                  <motion.form 
                    onSubmit={handleLandingSubmit}
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
                    className={`w-full max-w-3xl mt-10 mb-8 ${activeTheme.cardBg} border p-5 rounded-[28px] sm:rounded-[32px] backdrop-blur-xl flex flex-col justify-between relative z-30 transition-all duration-1000 ${
                      isPromptFocused ? (themeMode === 'night' ? 'border-emerald-500/40' : 'border-[#2d3a34]/30') : activeTheme.cardBorder
                    }`}
                  >
                    
                    {/* Textarea container */}
                    <div className="relative w-full text-left">
                      <textarea
                        value={landingPrompt}
                        onChange={(e) => setLandingPrompt(e.target.value)}
                        onFocus={() => setIsPromptFocused(true)}
                        onBlur={() => setIsPromptFocused(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleLandingSubmit(e);
                          }
                        }}
                        placeholder="Ask a question or make a request..."
                        rows={3}
                        className={`w-full bg-transparent ${activeTheme.textMain} placeholder-zinc-500/40 font-sans text-[15px] sm:text-base leading-relaxed resize-none focus:outline-none focus:ring-0 pr-10 border-none outline-none`}
                        style={{ caretColor: themeMode === 'night' ? '#10b981' : '#244b3c' }}
                      />
                      {landingPrompt && (
                        <button 
                          type="button" 
                          onClick={() => setLandingPrompt('')} 
                          className={`absolute right-0 top-1 text-xs px-2.5 py-1 rounded transition-colors ${
                            themeMode === 'night' ? 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300' : 'text-[#2c5341] hover:text-emerald-950 hover:bg-black/5'
                          }`}
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Bottom controls row */}
                    <div className="flex items-center justify-between mt-3 pt-2">
                      <div className="flex items-center space-x-2">
                        
                        {/* Attach button with drop popover */}
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
                              <div className="absolute bottom-11 left-0 z-50">
                                <PlusMenu 
                                  onSelectOption={(textOption) => {
                                    setLandingPrompt((prev) => prev ? `${prev} & ${textOption}` : `Build ${textOption}`);
                                  }}
                                  onClose={() => setIsPlusMenuOpen(false)}
                                  themeMode={themeMode}
                                />
                              </div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Deep thinking capability model switch */}
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
                              ? 'bg-[#242c27]/40 border-[#112318] text-zinc-400 hover:text-zinc-200 hover:bg-[#242c27]/70'
                              : themeMode === 'sunset'
                              ? 'bg-[#feeadd]/30 border-[#eed4c5]/40 text-orange-950/60 hover:text-[#ca5a27] hover:bg-[#feeadd]/50'
                              : 'bg-[#e2ebe2]/30 border-[#c8dec8]/35 text-[#2c5341]/60 hover:text-emerald-950 hover:bg-[#e2ebe2]/60'
                          }`}
                        >
                          <Brain className={`w-3.5 h-3.5 transition-transform duration-300 ${isDeepThinking ? 'scale-110 animate-pulse text-emerald-500' : 'text-zinc-400'}`} />
                          <span>Deep Thinking</span>
                        </button>

                      </div>

                      {/* Right input controllers */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsVoiceActive(true)}
                          title="Voice Search Activation"
                          className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                            themeMode === 'night'
                              ? 'text-zinc-400 hover:text-emerald-400 hover:bg-[#152a1e]/40'
                              : themeMode === 'sunset'
                              ? 'text-orange-950/50 hover:text-[#ca5a27] hover:bg-[#feeadd]/40'
                              : 'text-[#2c5341]/60 hover:text-[#112318] hover:bg-[#e1efe8]/50'
                          }`}
                        >
                          <Mic className="w-4.5 h-4.5 stroke-[1.8]" />
                        </button>

                        <button 
                          type="submit"
                          disabled={!landingPrompt.trim()}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shrink-0 ${
                            landingPrompt.trim() 
                              ? themeMode === 'night'
                                ? 'bg-emerald-500 text-black shadow-md hover:bg-emerald-400 font-bold'
                                : themeMode === 'sunset'
                                ? 'bg-[#ca5a27] text-white shadow-md hover:bg-[#b04b1e] font-bold'
                                : 'bg-[#244b3c] text-white hover:bg-[#122c21] font-bold' 
                              : 'bg-zinc-200/40 text-zinc-400 cursor-not-allowed'
                          }`}
                        >
                          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>

                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Central sponsorship logos row perfectly matching layout */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`w-full max-w-3xl flex flex-wrap items-center justify-center gap-x-10 gap-y-4 font-medium text-[13px] mt-4 pb-8 select-none ${
                  themeMode === 'night' ? 'text-[#84a38e]/80' : 'text-[#2c5341]/85'
                }`}
              >
                {[
                  { label: 'Acme Corp', icon: Sparkles },
                  { label: 'BuildingBlocks', icon: Boxes },
                  { label: 'AlphaWave', icon: Cpu },
                  { label: 'ContrastAI', icon: Contrast },
                  { label: 'Euphoria', icon: Zap }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button 
                      key={idx}
                      type="button"
                      onClick={() => handleSelectRecentProject(item.label)}
                      className={`flex items-center space-x-1.5 transition duration-200 hover:scale-105 ${
                        themeMode === 'night' ? 'hover:text-emerald-300' : 'hover:text-emerald-950 text-[#2c5341]'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </motion.div>

            </main>

            {/* Slider pill helper for mobile swipe right drawer indication */}
            <div 
              onClick={() => setIsDrawerOpen(true)}
              className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 w-8 h-16 flex flex-col items-center justify-center rounded-r-xl border-y border-r shadow-[3px_0_15px_rgba(25,50,35,0.06)] cursor-pointer group transition-all duration-200 select-none hover:w-9.5 ${
                themeMode === 'night' 
                  ? 'bg-[#0f1411]/95 border-[#1b2b21] hover:bg-[#152a1e]' 
                  : themeMode === 'sunset'
                  ? 'bg-[#fdf3e9]/95 border-[#eed4c5] hover:bg-[#feeadd]'
                  : 'bg-white/95 border-[#c8dec8]/70 hover:bg-[#ebf1ec]'
              }`}
              title="Open Project Base Drawer"
            >
              <div className="flex flex-col space-y-1 items-center shrink-0">
                <span className={`h-[1.5px] w-3 rounded-full transition-all group-hover:w-3.5 ${themeMode === 'night' ? 'bg-emerald-400' : 'bg-[#2c5341]'}`} />
                <span className={`h-[1.5px] w-2.5 rounded-full transition-all group-hover:w-3.5 ${themeMode === 'night' ? 'bg-emerald-400' : 'bg-[#2c5341]'}`} />
                <span className={`h-[1.5px] w-3 rounded-full transition-all group-hover:w-3.5 ${themeMode === 'night' ? 'bg-emerald-400' : 'bg-[#2c5341]'}`} />
              </div>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mt-2 shrink-0" />
            </div>

            {/* Showcase gallery section representing standard templates */}
            <ShowcaseSection themeMode={themeMode} />

            {/* Bottom page layout styling divider footer */}
            <footer className={`w-full py-8 mt-auto text-center border-t text-xs z-10 relative bg-transparent ${
              themeMode === 'night' ? 'border-emerald-950/20 text-[#617e6a]' : 'border-[#c8dec8]/25 text-[#5e7166]'
            }`}>
              <div className="max-w-7xl mx-auto flex items-center justify-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Erere Studio • Built in Cloud Environment Workspace</span>
              </div>
            </footer>

            {/* Complete sliding portfolio drawers from firebase */}
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
                handleLandingSubmitWithPrompt(selectedPrompt);
              }}
            />

          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Animated Status Toast Alerts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none select-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
              className={`p-4 rounded-xl shadow-xl border flex items-center gap-3 pointer-events-auto ${
                toast.type === 'success'
                  ? 'bg-[#e8f5e9] dark:bg-[#111c15] border-emerald-500/20 text-[#1b5e20] dark:text-emerald-400'
                  : toast.type === 'error'
                  ? 'bg-[#ffebee] dark:bg-[#201012] border-rose-500/25 text-[#b71c1c] dark:text-rose-400'
                  : 'bg-[#f5f5f5] dark:bg-[#18181b] border-stone-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-300'
              }`}
            >
              <span className="material-symbols-outlined shrink-0 text-[18px]">
                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'info' : 'notifications'}
              </span>
              <p className="text-xs font-bold leading-normal">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
