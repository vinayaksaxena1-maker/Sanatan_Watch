import React from 'react';

export function SacredBanner() {
  return (
    <div 
      className="relative w-full overflow-hidden rounded-[20px] sm:rounded-[32px] shadow-lg border border-orange-500/10 bg-[#120B08] flex items-center justify-center"
      id="sacred_banner_wrapper"
    >
      <img 
        src="/Hero_1.png" 
        alt="Dharmic Samay Banner"
        referrerPolicy="no-referrer"
        className="w-full h-auto max-w-full block rounded-[20px] sm:rounded-[32px] select-none pointer-events-none object-contain"
      />
    </div>
  );
}
