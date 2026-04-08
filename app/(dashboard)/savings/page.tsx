'use client';
import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Sparkles, Clock } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

// CSS keyframe di-inject sekali, animasi jalan di GPU
const COIN_STYLE = `
@keyframes coinFall {
  0%   { transform: translateY(-40px) rotate(0deg); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
}
.coin-fall { animation: coinFall linear infinite; will-change: transform; }
`;

const floatingCoins = [
  { emoji: '🪙', left: '10%', duration: '7s',   delay: '0s'   },
  { emoji: '💰', left: '25%', duration: '9s',   delay: '1.5s' },
  { emoji: '🪙', left: '42%', duration: '6.5s', delay: '3s'   },
  { emoji: '💵', left: '60%', duration: '8s',   delay: '0.8s' },
  { emoji: '🪙', left: '75%', duration: '10s',  delay: '2.2s' },
  { emoji: '💎', left: '88%', duration: '7.5s', delay: '4s'   },
];

const PIXEL_MAP = [
  [0,0,0,1,1,0,0,0,0,1,1,0,0,0],
  [0,0,1,2,2,1,0,0,1,4,4,1,0,0],
  [0,1,2,2,2,2,1,1,2,4,4,2,1,0],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,3,3,2,2,2,2,2,2,1,1,2,1],
  [1,2,3,3,2,2,2,2,2,2,1,1,2,1],
  [1,2,2,2,2,4,4,2,2,2,2,2,2,1],
  [1,2,2,2,2,4,4,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,0,1,2,1,0,0,0,0,1,2,1,0,0],
  [0,0,1,2,1,0,0,0,0,1,2,1,0,0],
  [0,0,1,1,0,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const PIXEL_COLORS: Record<number, string> = {
  0: 'transparent',
  1: '#be185d',
  2: '#f9a8d4',
  3: '#ffffff',
  4: '#ec4899',
};

const PIXEL_FLAT = PIXEL_MAP.flat();

const PixelPiggy = memo(function PixelPiggy() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: '1px', width: '98px', height: '98px' }}>
      {PIXEL_FLAT.map((val, i) => (
        <div key={i} style={{ backgroundColor: PIXEL_COLORS[val], borderRadius: val === 0 ? 0 : '1px' }} />
      ))}
    </div>
  );
});

export default function SavingsPage() {
  const { locale } = useI18n();
  const isEN = locale === 'en';
  const [piggyHovered, setPiggyHovered] = useState(false);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Inject CSS keyframe sekali */}
      <style>{COIN_STYLE}</style>

      {/* Floating coins — pure CSS, zero JS runtime */}
      {floatingCoins.map((coin, i) => (
        <span
          key={i}
          className="coin-fall absolute text-2xl pointer-events-none"
          style={{
            left: coin.left,
            top: '-40px',
            animationDuration: coin.duration,
            animationDelay: coin.delay,
          }}
        >
          {coin.emoji}
        </span>
      ))}

      <div className="absolute w-72 h-72 rounded-full bg-pink-200/30 blur-3xl -z-10" />

      {/* Piggy bank */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-2 cursor-pointer"
        onHoverStart={() => setPiggyHovered(true)}
        onHoverEnd={() => setPiggyHovered(false)}
      >
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-pink-400 to-fuchsia-400 flex items-center justify-center shadow-2xl shadow-pink-300 overflow-hidden relative">
          <motion.div
            animate={{ opacity: piggyHovered ? 0 : 1, scale: piggyHovered ? 0.8 : 1 }}
            transition={{ duration: 0.15 }}
            className="absolute"
          >
            <PiggyBank size={56} className="text-white" />
          </motion.div>
          <motion.div
            animate={{ opacity: piggyHovered ? 1 : 0, scale: piggyHovered ? 1 : 1.1 }}
            transition={{ duration: 0.15 }}
            className="absolute"
          >
            <PixelPiggy />
          </motion.div>
        </div>
        <motion.p
          animate={{ opacity: piggyHovered ? 1 : 0, y: piggyHovered ? 0 : 4 }}
          transition={{ duration: 0.15 }}
          className="text-center text-[10px] text-pink-400 mt-2 font-mono"
        >
          pixel mode 🕹️
        </motion.p>
      </motion.div>

      {/* Coming Soon badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-xs font-bold mb-4 shadow-md shadow-pink-200 mt-2"
      >
        <Sparkles size={13} />
        {isEN ? 'Coming Soon' : 'Segera Hadir'}
        <Sparkles size={13} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-pink-800 mb-3 text-center"
      >
        {isEN ? 'Savings' : 'Tabungan'}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-pink-400 text-sm text-center max-w-xs leading-relaxed mb-8"
      >
        {isEN
          ? "We're building something awesome for your savings goals. Stay tuned!"
          : 'Kami sedang membangun fitur keren untuk target tabungan kamu. Ditunggu ya!'}
      </motion.p>

      {/* Progress dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 mb-8"
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-pink-400"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg w-full px-4"
      >
        {[
          { icon: '🎯', label: isEN ? 'Savings Goals' : 'Target Tabungan' },
          { icon: '📈', label: isEN ? 'Progress Tracker' : 'Lacak Progress' },
          { icon: '🔔', label: isEN ? 'Reminders' : 'Pengingat Rutin' },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, y: -4 }}
            className="bg-white/70 backdrop-blur-sm border border-pink-100 rounded-2xl p-4 text-center shadow-sm cursor-default"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-xs font-medium text-pink-600">{item.label}</p>
            <div className="flex items-center justify-center gap-1 mt-1.5">
              <Clock size={10} className="text-pink-300" />
              <span className="text-[10px] text-pink-300">{isEN ? 'Soon' : 'Segera'}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
