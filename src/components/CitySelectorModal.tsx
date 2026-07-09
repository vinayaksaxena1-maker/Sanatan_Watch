/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, MapPin } from 'lucide-react';
import { Coords } from '../types';
import { CitySelector } from './CitySelector';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoords: Coords;
  onSelectCity: (coords: Coords) => void;
  gpsActive: boolean;
  setGpsActive: (active: boolean) => void;
  theme: 'light' | 'dark';
}

export function CitySelectorModal({
  isOpen,
  onClose,
  currentCoords,
  onSelectCity,
  gpsActive,
  setGpsActive,
  theme
}: CitySelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] border transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-white border-orange-100/70 text-slate-800' 
            : 'bg-zinc-950 border-zinc-800 text-zinc-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b flex justify-between items-center ${
          theme === 'light' ? 'bg-orange-50/20 border-orange-100/60' : 'bg-zinc-900/40 border-zinc-800/80'
        }`}>
          <div className="flex items-center gap-2 text-left">
            <MapPin className="w-5 h-5 text-orange-600 dark:text-amber-500 animate-bounce" />
            <div>
              <h3 className="text-sm sm:text-base font-bold font-serif leading-none">स्थान चयन (Select Location)</h3>
              <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase block mt-1">जीपीएस या शहर खोजें</span>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-full hover:scale-105 transition-transform duration-200 cursor-pointer ${
              theme === 'light' ? 'bg-orange-50 hover:bg-orange-100/80 text-slate-500' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
            }`}
            title="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-grow">
          <CitySelector
            currentCoords={currentCoords}
            onSelectCity={(coords) => {
              onSelectCity(coords);
              onClose();
            }}
            gpsActive={gpsActive}
            setGpsActive={setGpsActive}
          />
        </div>

        {/* Footer */}
        <div className={`px-5 py-3.5 border-t text-center text-[9px] font-medium tracking-wide ${
          theme === 'light' ? 'bg-orange-50/10 border-orange-100/40 text-slate-400' : 'bg-zinc-900/20 border-zinc-800/40 text-zinc-500'
        }`}>
          सटीक सूर्योदय, सूर्यास्त और ग्रहों की गणना आपके स्थान पर आधारित है।
        </div>
      </div>
    </div>
  );
}
