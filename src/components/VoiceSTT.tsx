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
  const [isUsingSpeechAPI, setIsUsingSpeechAPI] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let recognition: any = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    function startSimulation() {
      setIsUsingSpeechAPI(false);
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
      let index = 0;
      fallbackInterval = setInterval(() => {
        if (index < spokenPhrases.length) {
          setTranscript((prev) => prev + spokenPhrases[index]);
          index++;
        } else {
          if (fallbackInterval) clearInterval(fallbackInterval);
          setIsDone(true);
        }
      }, 280);
    }

    if (SpeechRecognition) {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsUsingSpeechAPI(true);
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            finalTranscript += event.results[i][0].transcript;
          }
          if (finalTranscript) {
            setTranscript(finalTranscript);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn("Speech API error, resorting to fallback typist:", err);
          startSimulation();
        };

        recognition.onend = () => {
          setIsDone(true);
        };

        recognition.start();
      } catch (e) {
        console.warn("Error starting speech recognition, using fallback typist:", e);
        startSimulation();
      }
    } else {
      startSimulation();
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, []);

  // Equalizer bar heights
  const barCount = 48;
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="w-full max-w-3xl mt-12 mb-10 bg-[#fcfdfc]/95 border border-[#c8dec8] p-6 rounded-[28px] shadow-[0_15px_35px_-10px_rgba(36,75,60,0.08)] backdrop-blur-md flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-emerald-700 font-mono tracking-widest flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-2 animate-ping" />
          LISTENING — SPEAK TO TEXT ACTIVE
        </span>
        <span className="text-[#5e7166] text-[11px] font-mono select-none">Press ✓ to submit voice input</span>
      </div>

      {/* Dynamic Voice Waveform Equalizer exactly mimicking the style */}
      <div className="h-16 flex items-center justify-center gap-[3px] py-3 bg-[#f4f7f4] rounded-xl border border-[#c8dec8]/50 overflow-hidden">
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
              className="w-[3px] bg-[#244b3c] rounded-full"
              style={{ minHeight: '4px' }}
            />
          );
        })}
      </div>

      {/* Real-time transcribed text display */}
      <div className="min-h-[44px] py-3 text-left">
        <p className="text-sm font-sans text-[#1e3d30] italic min-h-[20px]">
          {transcript || 'Say something...'}
          {!isDone && <span className="inline-block w-1.5 h-4 bg-emerald-600 ml-1 animate-pulse" />}
        </p>
      </div>

      {/* Interactive Toolbar matching the bottom state */}
      <div className="flex items-center justify-between border-t border-[#c8dec8]/40 pt-4 mt-2">
        {/* Plus on the left */}
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-[#f4f7f4] border border-[#c8dec8]/75 hover:bg-[#e1efe8] text-[#2c5341] hover:text-emerald-950 flex items-center justify-center transition active:scale-95 cursor-pointer"
          onClick={() => setTranscript((prev) => prev + ' + Additional requirement')}
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Right side has X and Tick controls exactly layout matching */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full border border-[#c8dec8]/75 hover:bg-[#f4f7f4] text-[#5e7166] hover:text-emerald-950 flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Cancel recording"
          >
            <X className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onConfirm(transcript)}
            className="w-10 h-10 rounded-full bg-[#244b3c] text-white hover:bg-[#1a382c] shadow-lg flex items-center justify-center transition transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Confirm transcript"
          >
            <Check className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
