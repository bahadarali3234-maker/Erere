/**
 * Dynamic Atmosphere and Theme definitions matching the day cycle.
 * Includes auto-detection coordinates and manual time-travel controls.
 */

export type ThemeMode = 'morning' | 'afternoon' | 'sunset' | 'night';

export interface ThemeStyles {
  mode: ThemeMode;
  bg: string;
  bgOverlay: string; // top glow gradient background
  cardBg: string;
  cardBorder: string;
  borderSubtle: string;
  textMain: string;
  textMuted: string;
  accentBtn: string;
  accentHover: string;
  accentText: string;
  accentBg: string;
  accentGlow: string; // glow shadows
  inputBg: string;
  inputText: string;
  inputPlaceholder: string;
  activePulseColor: string;
  audioWavelengthColor: string;
  divider: string;
}

export const themes: Record<ThemeMode, ThemeStyles> = {
  morning: {
    mode: 'morning',
    bg: 'bg-[#f4f8f4]',
    bgOverlay: 'from-[#fdf6e2]/25 via-[#e2f3e8]/25 to-[#f4f8f4]/25',
    cardBg: 'bg-[#fcfdfc]/95',
    cardBorder: 'border-[#bfe0bf]',
    borderSubtle: 'border-[#bfe0bf]/55',
    textMain: 'text-[#12381e]',
    textMuted: 'text-[#50725a]',
    accentBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10',
    accentHover: 'hover:bg-[#e4efe5] hover:text-[#12381e]',
    accentText: 'text-emerald-700',
    accentBg: 'bg-[#e5f5e5]',
    accentGlow: 'shadow-[0_25px_60px_-15px_rgba(16,185,129,0.08)]',
    inputBg: 'bg-[#f0f6f0]',
    inputText: 'text-[#12381e]',
    inputPlaceholder: 'placeholder-[#50725a]/50',
    activePulseColor: 'bg-amber-400',
    audioWavelengthColor: 'bg-emerald-600',
    divider: 'border-b border-[#bfe0bf]/40',
  },
  afternoon: {
    mode: 'afternoon',
    bg: 'bg-[#f3f7f4]',
    bgOverlay: 'from-[#f3f7f4]/0 via-emerald-50/15 to-[#f3f7f4]/0',
    cardBg: 'bg-[#fcfdfc]/95',
    cardBorder: 'border-[#c8dec8]',
    borderSubtle: 'border-[#c8dec8]/75',
    textMain: 'text-[#1e3d30]',
    textMuted: 'text-[#5e7166]',
    accentBtn: 'bg-[#244b3c] hover:bg-[#1a382c] text-white shadow-[#244b3c]/10',
    accentHover: 'hover:bg-[#e1efe8]/50 hover:text-[#1e3d30]',
    accentText: 'text-emerald-700',
    accentBg: 'bg-[#def5ea]',
    accentGlow: 'shadow-[0_25px_60px_-15px_rgba(36,75,60,0.12)]',
    inputBg: 'bg-[#f4f7f4]',
    inputText: 'text-[#1e3d30]',
    inputPlaceholder: 'placeholder-[#5e7166]/40',
    activePulseColor: 'bg-emerald-600',
    audioWavelengthColor: 'bg-[#244b3c]',
    divider: 'border-[#c8dec8]/40',
  },
  sunset: {
    mode: 'sunset',
    bg: 'bg-[#faf0e6]',
    bgOverlay: 'from-[#ea580c]/12 via-[#f43f5e]/8 to-[#faf0e6]/20',
    cardBg: 'bg-[#fdf9f5]/95',
    cardBorder: 'border-[#f3cfb6]',
    borderSubtle: 'border-[#f3cfb6]/65',
    textMain: 'text-[#4c2409]',
    textMuted: 'text-[#825330]',
    accentBtn: 'bg-[#ca5a27] hover:bg-[#a34419] text-white shadow-[#ca5a27]/10',
    accentHover: 'hover:bg-[#f5e4d7] hover:text-[#4c2409]',
    accentText: 'text-[#ca5a27]',
    accentBg: 'bg-[#fef0e6]',
    accentGlow: 'shadow-[0_25px_60px_-15px_rgba(202,90,39,0.12)]',
    inputBg: 'bg-[#fbf4ed]',
    inputText: 'text-[#4c2409]',
    inputPlaceholder: 'placeholder-[#825330]/50',
    activePulseColor: 'bg-[#ca5a27]',
    audioWavelengthColor: 'bg-[#ca5a27]',
    divider: 'border-[#f3cfb6]/40',
  },
  night: {
    mode: 'night',
    bg: 'bg-[#060a08]',
    bgOverlay: 'from-[#0e2c1e]/20 via-[#060a08]/0 to-[#0e2c1e]/10',
    cardBg: 'bg-[#0f1411]/95',
    cardBorder: 'border-[#1b2b21]',
    borderSubtle: 'border-[#1b2b21]/70',
    textMain: 'text-[#e9f2ec]',
    textMuted: 'text-[#85988b]',
    accentBtn: 'bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-emerald-500/10',
    accentHover: 'hover:bg-[#16291d] hover:text-[#e9f2ec]',
    accentText: 'text-emerald-400',
    accentBg: 'bg-[#152a1e]',
    accentGlow: 'shadow-[0_25px_60px_-15px_rgba(16,185,129,0.2)]',
    inputBg: 'bg-[#111915]',
    inputText: 'text-[#e9f2ec]',
    inputPlaceholder: 'placeholder-[#85988b]/40',
    activePulseColor: 'bg-emerald-400',
    audioWavelengthColor: 'bg-emerald-400',
    divider: 'border-[#1b2b21]/50',
  }
};

export const getThemeForHour = (hour: number): ThemeMode => {
  if (hour >= 5 && hour < 12) return 'morning'; // 5:00 AM - 11:59 AM
  if (hour >= 12 && hour < 17) return 'afternoon'; // 12:00 PM - 4:59 PM
  if (hour >= 17 && hour < 20) return 'sunset'; // 5:00 PM - 7:59 PM
  return 'night'; // 8:00 PM - 4:49 AM
};
