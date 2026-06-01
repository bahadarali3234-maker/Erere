import { useState, useRef, FormEvent, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  User, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 3D Mouse Parallax Movement Variables
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate custom coordinates relative to center
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Max 12 degrees rotation limits
    const rX = -(mouseY / height) * 16;
    const rY = (mouseX / width) * 16;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password || (isSignUp && !name)) {
      setErrorMsg('Please populate all required fields.');
      return;
    }

    setIsLoading(true);

    // Dynamic simulated loading for high fidelity feel
    setTimeout(() => {
      setIsLoading(false);
      onSuccess(email);
      onClose();
    }, 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
          
          {/* Background Stars / Dust Particles Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Main Animated Modal Body */}
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ 
              opacity: 0, 
              scale: 0.75, 
              rotateY: 45, 
              rotateX: 15,
              z: -200
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotateY: rotateY, 
              rotateX: rotateX,
              z: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              rotateY: -30,
              rotateX: -10,
              transition: { duration: 0.3 }
            }}
            transition={{
              type: 'spring',
              damping: 18,
              stiffness: 90,
              mass: 0.8
            }}
            style={{ 
              transformStyle: 'preserve-3d', 
              perspective: 1200 
            }}
            className="relative w-full max-w-md bg-zinc-950/90 border border-[#27352e] rounded-[32px] p-8 md:p-10 shadow-[0_25px_60px_-15px_rgba(4,120,87,0.25)] overflow-hidden"
          >
            {/* Absolute Glowing Background Gradients */}
            <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white hover:bg-white/5 p-2 rounded-full transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Brand Logo Header */}
            <div className="flex flex-col items-center text-center mb-8" style={{ transform: 'translateZ(30px)' }}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 animate-bounce-subtle">
                <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <h3 className="font-display font-bold text-2xl text-white tracking-tight">
                {isSignUp ? 'Create Erere Studio ID' : 'Sign in to Erere'}
              </h3>
              <p className="text-zinc-500 text-xs mt-1.5 max-w-[280px]">
                {isSignUp 
                  ? 'Access immediate cloud architecture blueprints and persistent databases' 
                  : 'Welcome back. Experience ultra-fast high-fidelity building blocks.'}
              </p>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-xs text-red-400 text-center"
              >
                {errorMsg}
              </motion.div>
            )}

            {/* Interactive Form */}
            <form onSubmit={handleSubmit} className="space-y-4" style={{ transform: 'translateZ(15px)' }}>
              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5 pl-1 font-semibold">
                    Full Name
                  </label>
                  <div className="relative flex items-center bg-[#101412] border border-[#27352e] focus-within:border-emerald-500/40 rounded-xl px-4 py-3 text-zinc-300 transition-all">
                    <User className="w-4.5 h-4.5 text-zinc-500 mr-2.5 shrink-0" />
                    <input
                      type="text"
                      placeholder="Bahadar Ali"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-zinc-650"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5 pl-1 font-semibold">
                  Email Address
                </label>
                <div className="relative flex items-center bg-[#101412] border border-[#27352e] focus-within:border-emerald-500/40 rounded-xl px-4 py-3 text-zinc-300 transition-all">
                  <Mail className="w-4.5 h-4.5 text-zinc-500 mr-2.5 shrink-0" />
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-zinc-650"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 pl-1 font-semibold">
                    Password
                  </label>
                  {!isSignUp && (
                    <a href="#forgot" className="text-[10px] text-emerald-400 hover:underline">
                      Forgot?
                    </a>
                  )}
                </div>
                <div className="relative flex items-center bg-[#101412] border border-[#27352e] focus-within:border-emerald-500/40 rounded-xl px-4 py-3 text-zinc-300 transition-all">
                  <Lock className="w-4.5 h-4.5 text-zinc-500 mr-2.5 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-zinc-650"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-zinc-500 hover:text-zinc-300 ml-2"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-[#070e0a] font-sans font-semibold text-sm py-3.5 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:scale-[1.01] active:scale-95 transition-all text-center flex items-center justify-center space-x-2 cursor-pointer mt-6"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4.5 w-4.5 text-zinc-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{isSignUp ? 'Constructing Account ID...' : 'Authenticating profile...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? 'Generate Erere ID' : 'Instant Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social Authentication Simulations */}
            <div className="mt-6 pt-5 border-t border-[#27352e]" style={{ transform: 'translateZ(10px)' }}>
              <div className="text-center text-[10px] text-zinc-600 font-mono mb-4 uppercase tracking-widest">
                Or Continue With Secure Provider
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => { setIsLoading(false); onSuccess('gmail_provider@google.com'); onClose(); }, 1200);
                  }}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 py-2.5 rounded-xl text-xs text-zinc-300 hover:text-white transition flex items-center justify-center space-x-2"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.725 0 3.3.615 4.53 1.71l2.43-2.43C17.34 1.725 14.94 1 12.24 1A9.99 9.99 0 002.25 11c0 5.52 4.48 10 10 10 5.76 0 9.735-4.05 9.735-9.9 0-.6-.06-1.17-.18-1.71h-9.565z"/>
                  </svg>
                  <span>Google SSO</span>
                </button>
                <button 
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => { setIsLoading(false); onSuccess('github_sso@github.com'); onClose(); }, 1200);
                  }}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 py-2.5 rounded-xl text-xs text-zinc-300 hover:text-white transition flex items-center justify-center space-x-2"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </div>

            {/* Modal Toggles */}
            <div className="mt-8 text-center" style={{ transform: 'translateZ(5px)' }}>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                }}
                className="text-xs text-zinc-500 hover:text-white"
              >
                {isSignUp ? (
                  <span>Already hold an Erere blueprint ID? <strong className="text-emerald-400">Sign In</strong></span>
                ) : (
                  <span>First time here? <strong className="text-emerald-400">Assemble an Account</strong></span>
                )}
              </button>
            </div>

            {/* Secure Footer Status bar */}
            <div className="flex items-center justify-center space-x-1.5 mt-8 text-[10px] text-zinc-650 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
              <span>TLS 1.3 CLIENT SECURITY PROTOCOLS SECURED</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
