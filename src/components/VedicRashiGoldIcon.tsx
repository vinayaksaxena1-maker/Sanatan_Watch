/**
 * Sanatan Web (सनातन घड़ी)
 * 12 Vedic Rashi Direct Transparent WebP Icons (प्रामाणिक वैदिक राशि प्रतीक)
 * Authentic traditional iconography from canonical Indian Jyotish reference
 * Pure Web, 60 FPS, Zero external npm bloat (< 150 lines)
 */

import React from 'react';

export type RashiKey =
  | 'mesh'
  | 'vrishabh'
  | 'mithun'
  | 'kark'
  | 'singh'
  | 'kanya'
  | 'tula'
  | 'vrishchik'
  | 'dhanu'
  | 'makar'
  | 'kumbh'
  | 'meen';

export interface VedicRashiGoldIconProps {
  rashi: RashiKey | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const SIZE_MAP = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const RASHI_ASSET_MAP: Record<string, string> = {
  // 1. Mesh (Aries)
  mesh: '/assets/rashis/mesh.webp',
  aries: '/assets/rashis/mesh.webp',
  'मेष': '/assets/rashis/mesh.webp',

  // 2. Vrishabh (Taurus)
  vrishabh: '/assets/rashis/vrishabh.webp',
  vrishab: '/assets/rashis/vrishabh.webp',
  vrish: '/assets/rashis/vrishabh.webp',
  taurus: '/assets/rashis/vrishabh.webp',
  'वृषभ': '/assets/rashis/vrishabh.webp',
  'वृष': '/assets/rashis/vrishabh.webp',

  // 3. Mithun (Gemini)
  mithun: '/assets/rashis/mithun.webp',
  gemini: '/assets/rashis/mithun.webp',
  'मिथुन': '/assets/rashis/mithun.webp',

  // 4. Kark (Cancer)
  kark: '/assets/rashis/kark.webp',
  cancer: '/assets/rashis/kark.webp',
  'कर्क': '/assets/rashis/kark.webp',

  // 5. Singh (Leo)
  singh: '/assets/rashis/singh.webp',
  simha: '/assets/rashis/singh.webp',
  leo: '/assets/rashis/singh.webp',
  'सिंह': '/assets/rashis/singh.webp',

  // 6. Kanya (Virgo)
  kanya: '/assets/rashis/kanya.webp',
  virgo: '/assets/rashis/kanya.webp',
  'कन्या': '/assets/rashis/kanya.webp',

  // 7. Tula (Libra)
  tula: '/assets/rashis/tula.webp',
  libra: '/assets/rashis/tula.webp',
  'तुला': '/assets/rashis/tula.webp',

  // 8. Vrishchik (Scorpio)
  vrishchik: '/assets/rashis/vrishchik.webp',
  vrischika: '/assets/rashis/vrishchik.webp',
  scorpio: '/assets/rashis/vrishchik.webp',
  scorpius: '/assets/rashis/vrishchik.webp',
  'वृश्चिक': '/assets/rashis/vrishchik.webp',

  // 9. Dhanu (Sagittarius)
  dhanu: '/assets/rashis/dhanu.webp',
  sagittarius: '/assets/rashis/dhanu.webp',
  'धनु': '/assets/rashis/dhanu.webp',

  // 10. Makar (Capricorn)
  makar: '/assets/rashis/makar.webp',
  capricorn: '/assets/rashis/makar.webp',
  capricornus: '/assets/rashis/makar.webp',
  'मकर': '/assets/rashis/makar.webp',

  // 11. Kumbh (Aquarius)
  kumbh: '/assets/rashis/kumbh.webp',
  aquarius: '/assets/rashis/kumbh.webp',
  'कुम्भ': '/assets/rashis/kumbh.webp',
  'कुंभ': '/assets/rashis/kumbh.webp',

  // 12. Meen (Pisces)
  meen: '/assets/rashis/meen.webp',
  pisces: '/assets/rashis/meen.webp',
  'मीन': '/assets/rashis/meen.webp',
};

export const VedicRashiGoldIcon: React.FC<VedicRashiGoldIconProps> = ({
  rashi,
  size = 'md',
  className = '',
  alt,
}) => {
  const normKey = (rashi || '').toLowerCase().trim();
  const assetSrc = RASHI_ASSET_MAP[normKey] || '/assets/rashis/mesh.webp';
  const dimensionClass = SIZE_MAP[size] || SIZE_MAP.md;
  const label = alt || rashi || 'राशि प्रतीक';

  return (
    <div
      className={`${dimensionClass} shrink-0 inline-flex items-center justify-center select-none ${className}`}
      aria-label={label}
      role="img"
    >
      <img
        src={assetSrc}
        alt={label}
        className="w-full h-full object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-all duration-300"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default VedicRashiGoldIcon;
