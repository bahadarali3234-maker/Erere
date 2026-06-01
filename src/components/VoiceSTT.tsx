import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, X, Check } from 'lucide-react';

interface VoiceSTTProps {
  onCancel: () => void;
  onConfirm: (transcript: string) => void;
}

export default function VoiceSTT({ onCancel, onConfirm }: VoiceSTTProps) {
  const [transcript, setTranscript] = useState('');
  const [isDone, setIsDone] = useState(false);

  // Simulated spoken phrase list that gets typed out in real-time to mimic cutting-edge STT models
  const spokenPhrases = [
    'Create ',
    'an ',
    'interactive ',
    'real-time ',
    'meeting ',
    'notes ',
    'summarizer ',
    'with ',
    'emerald-green ',
    'theme ',
    'and ',
    '3D ',
    'parallax ',
    'layouts ',
    'and ',
    'live ',
    'collaborative ',
    'features.'
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < spokenPhrases.length) {
        setTranscript((prev) => prev + spokenPhrases[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsDone(true);
      }
    }, 280);

    return () => clearInterval(interval);
  }, []);

  // Equalizer bar heights
  const barCount = 48;
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="w-full max-w-3xl mt-12 mb-10 bg-zinc-950/95 border border-emerald-500/20 p-6 rounded-[28px] shadow-[0_15px_35px_-10px_rgba(4,120,87,0.3)] backdrop-blur-md flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-emerald-400 font-mono tracking-widest flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-ping" />
          LISTENING — SPEAK TO TEXT ACTIVE
        </span>
        <span className="text-zinc-500 text-[11px] font-mono select-none">Press ✓ to submit voice input</span>
      </div>

      {/* Dynamic Voice Waveform Equalizer exactly mimicking the screenshot style */}
      <div className="h-16 flex items-center justify-center gap-[3px] py-3 bg-zinc-900/40 rounded-xl border border-white/5 overflow-hidden">
        {bars.map((bar) => {
          // Generate realistic random ranges for visual complexity
          const heightAnim = [
            12, 
            Math.floor(Math.random() * 24 + 16), 
            Math.floor(Math.random() * 48 + 12), 
            12
          ];
          
          return (
            <motion.div
              key={bar}
              animate={{ height: heightAnim }}
              transition={{
                duration: 1 + Math.random() * 0.8,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: Math.random() * 0.4
              }}
              className="w-[3px] bg-zinc-300 rounded-full"
              style={{ minHeight: '4px' }}
            />
          );
        })}
      </div>

      {/* Real-time transcribed text display */}
      <div className="min-h-[44px] py-3 text-left">
        <p className="text-sm font-sans text-zinc-300 italic min-h-[20px]">
          {transcript || 'Say something...'}
          {!isDone && <span className="inline-block w-1.5 h-4 bg-emerald-400 ml-1 animate-pulse" />}
        </p>
      </div>

      {/* Interactive Toolbar matching the screenshot bottom state */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
        {/* Plus on the left */}
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition active:scale-95"
          onClick={() => setTranscript((prev) => prev + ' + Additional requirement')}
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Right side has X and Tick controls exactly layout matching */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40 text-zinc-400 hover:text-white flex items-center justify-center transition active:scale-95"
            title="Cancel recording"
          >
            <X className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onConfirm(transcript)}
            className="w-10 h-10 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 shadow-lg flex items-center justify-center transition transform hover:scale-105 active:scale-95"
            title="Confirm transcript"
          >
            <Check className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
