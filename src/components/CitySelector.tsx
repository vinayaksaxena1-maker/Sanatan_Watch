import React, { useState } from 'react';
import { Search, MapPin, Navigation, Check, AlertCircle } from 'lucide-react';
import { Coords } from '../types';
import { EXTENDED_INDIAN_CITIES as INDIAN_CITIES } from '../utils/indianCities';

interface CitySelectorProps {
  currentCoords: Coords;
  onSelectCity: (coords: Coords) => void;
  gpsActive: boolean;
  setGpsActive: (active: boolean) => void;
}

export function CitySelector({ currentCoords, onSelectCity, gpsActive, setGpsActive }: CitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const filteredCities = INDIAN_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const triggerGpsDetect = () => {
    setErrorMessage('');
    if (!navigator.geolocation) {
      setErrorMessage('आपका ब्राउज़र स्थान-निर्धारण क्षमताओं का समर्थन नहीं करता।');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(4));
        const lon = parseFloat(position.coords.longitude.toFixed(4));
        
        let nearestCity = 'मेरा जीपीएस स्थान';
        let state = 'Detected';

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              nearestCity = data.address.city || data.address.town || data.address.village || data.address.county || nearestCity;
              state = data.address.state || state;
            }
          } else {
            throw new Error('Reverse geocoding request failed');
          }
        } catch (error) {
          console.error('Reverse geocoding error, falling back to local calculation', error);
          
          const toRad = (value: number) => (value * Math.PI) / 180;
          const R = 6371; // Earth's radius in km
          let minDistance = Infinity;

          INDIAN_CITIES.forEach(c => {
            const dLat = toRad(c.latitude - lat);
            const dLon = toRad(c.longitude - lon);
            const a = 
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat)) * Math.cos(toRad(c.latitude)) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c_dist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distanceKm = R * c_dist;

            if (distanceKm < minDistance) {
              minDistance = distanceKm;
              if (distanceKm < 50) {
                nearestCity = `Near ${c.city}`;
                state = c.state;
              } else if (distanceKm < 200) {
                nearestCity = `${Math.round(distanceKm)}km from ${c.city}`;
                state = c.state;
              }
            }
          });

          if (minDistance >= 200) {
             nearestCity = 'जीपीएस स्थान';
             state = 'Detected';
          }
        }

        onSelectCity({
          latitude: lat,
          longitude: lon,
          city: nearestCity,
          state: state
        });
        setGpsActive(true);
      },
      (error) => {
        console.error('GPS trigger failed', error);
         setErrorMessage('भौगोलिक स्थान की अनुमति अस्वीकार कर दी गई या समय समाप्त हो गया। कृपया नीचे से मैन्युअल रूप से एक शहर का चयन करें।');
        setGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleManualSelect = (city: Coords) => {
    onSelectCity(city);
    setGpsActive(false);
    setErrorMessage('');
  };

  return (
    <div id="city_selector_root" className="glass-card-light dark:glass-card-dark p-4 sm:p-5 text-left">
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-100 flex items-center gap-2 font-serif">
          <MapPin className="w-5 h-5 text-orange-600 animate-bounce" />
          स्थान व जीपीएस सेटिंग्स
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          पंचांग गणना आपके भौतिक स्थान और अक्षांश-देशांतर के आधार पर सटीक रूप से निर्धारित की जाती है। निर्देशांक स्वतः-पहचानें या नीचे चुनें।
        </p>
      </div>

      {/* GPS Detector button */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
        <div className="md:col-span-6">
          <button
            onClick={triggerGpsDetect}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
              gpsActive
                ? 'bg-linear-to-r from-emerald-600 to-green-500 text-white border-transparent'
                : 'bg-linear-to-r from-orange-600 to-[#FF9933] hover:brightness-110 active:scale-99 text-white border-transparent'
            }`}
          >
            <Navigation className={`w-4 h-4 ${gpsActive ? 'animate-ping' : ''}`} />
            {gpsActive ? 'जीपीएस कनेक्टेड' : 'जीपीएस से स्वतः-पहचानें'}
          </button>
        </div>
        
        <div className="md:col-span-6 p-2.5 sm:p-3 rounded-2xl bg-orange-500/5 dark:bg-orange-950/20 border border-orange-100/35 text-left">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-orange-850 dark:text-orange-400 tracking-wider block font-mono">वर्तमान गणना स्थान</span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-amber-100 block mt-0.5 truncate">
            ⛩️ {currentCoords.city}, {currentCoords.state}
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block font-mono mt-0.5">
            अक्षांश: {currentCoords.latitude}°N | देशान्तर: {currentCoords.longitude}°E
          </span>
        </div>
      </div>

      {/* Error Output handles */}
      {errorMessage && (
        <div className="mt-3 flex gap-2 p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 text-left">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-[10.5px] font-medium text-red-800 dark:text-red-300">{errorMessage}</span>
        </div>
      )}

      {/* Search selection lists */}
      <div className="mt-5 border-t border-slate-100 dark:border-zinc-800/60 pt-4">
        <label className="text-xs font-bold text-slate-500 dark:text-amber-500 uppercase tracking-wider mb-2 font-mono block text-left">भारतीय शहर खोजें</label>
        
        <div className="relative flex items-center mb-3">
          <input
            type="text"
            placeholder="शहर खोजें जैसे अयोध्या, वाराणसी..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs p-3 rounded-2xl bg-slate-500/5 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800/60 focus:bg-white dark:focus:bg-zinc-950 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-slate-800 dark:text-slate-100"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
        </div>

        {/* Scroll grid list of available cities */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-[180px] overflow-y-auto pr-1">
          {filteredCities.map((item) => {
            const isSelected = !gpsActive && currentCoords.city === item.city;
            return (
              <button
                key={`${item.city}-${item.state}`}
                onClick={() => handleManualSelect(item)}
                className={`flex flex-col p-2.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-101 hover:shadow-xs relative ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                    : 'bg-white/70 dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-800/60 border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex justify-between items-center gap-1">
                  <span className="text-xs font-bold truncate leading-tight">{item.city}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                </div>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-orange-100' : 'text-slate-500'} truncate font-medium`}>
                  {item.state}
                </span>
                <span className={`text-[8.5px] font-mono mt-0.5 ${isSelected ? 'text-orange-200' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.latitude}°N, {item.longitude}°E
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
