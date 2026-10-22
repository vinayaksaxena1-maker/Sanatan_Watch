import React, { useRef, useState } from 'react';
import {
  Download,
  Check,
  Sparkles,
  Camera,
  Upload,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { PanchangInfo } from '../types';

interface PosterGeneratorProps {
  panchang: PanchangInfo;
  city: string;
  activeMuhurats: any[];
  language?: 'English' | 'Hindi';
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

const getDishaShoolInfo = (day: number, isHindi: boolean = true) => {
  switch (day) {
    case 0:
      return {
        direction: isHindi ? 'पश्चिम (West)' : 'West',
        remedy: isHindi ? 'दलिया, घी या इलायची खाकर प्रस्थान करें' : 'Consume porridge, ghee, or cardamom'
      };
    case 1:
      return {
        direction: isHindi ? 'पूर्व (East)' : 'East',
        remedy: isHindi ? 'दर्पण देखकर या दूध पीकर प्रस्थान करें' : 'Look into a mirror or drink milk'
      };
    case 2:
      return {
        direction: isHindi ? 'उत्तर (North)' : 'North',
        remedy: isHindi ? 'गुड़ खाकर प्रस्थान करें' : 'Consume jaggery before travel'
      };
    case 3:
      return {
        direction: isHindi ? 'उत्तर (North)' : 'North',
        remedy: isHindi ? 'धनिया या तिल खाकर प्रस्थान करें' : 'Consume coriander or sesame'
      };
    case 4:
      return {
        direction: isHindi ? 'दक्षिण (South)' : 'South',
        remedy: isHindi ? 'दही या जीरा खाकर प्रस्थान करें' : 'Consume curd or cumin seeds'
      };
    case 5:
      return {
        direction: isHindi ? 'पश्चिम (West)' : 'West',
        remedy: isHindi ? 'जौ या राई खाकर प्रस्थान करें' : 'Consume barley or mustard'
      };
    case 6:
      return {
        direction: isHindi ? 'पूर्व (East)' : 'East',
        remedy: isHindi ? 'अदरक या उड़द खाकर प्रस्थान करें' : 'Consume ginger or urad'
      };
    default:
      return {
        direction: isHindi ? 'कोई नहीं' : 'None',
        remedy: ''
      };
  }
};

const DEITY_THEMES = [
  { id: 'shiva', name: 'शिव जी 🔱', file: './Shiva_Bg.webp' },
  { id: 'krishna', name: 'कृष्ण जी 🪶', file: './Krishna_Bg.webp' },
  { id: 'rama', name: 'श्री राम 🏹', file: './Rama_Bg.webp' },
  { id: 'ganesha', name: 'गणेश जी 🚩', file: './Ganesha_Bg.webp' },
  { id: 'lakshmi', name: 'लक्ष्मी जी 🪷', file: './Lakshmi_Bg.webp' },
  { id: 'saraswati', name: 'सरस्वती जी 🪕', file: './Saraswati_Bg.webp' },
  { id: 'durga', name: 'दुर्गा मां 🦁', file: './Durga_Bg.webp' },
  { id: 'hanuman', name: 'हनुमान जी 🚩', file: './Hanuman_Bg.webp' },
  { id: 'vishnu', name: 'विष्णु जी 🪷', file: './Vishnu_Bg.webp' },
  { id: 'surya', name: 'सूर्य देव ☀️', file: './Surya_Bg.webp' },
  { id: 'brahma', name: 'ब्रह्मा जी 🪷', file: './Brahma_Bg.webp' },
  { id: 'kali', name: 'काली मां 🌺', file: './Kali_Bg.webp' },
  { id: 'kartikeya', name: 'कार्तिकेय जी 🦚', file: './Kartikeya_Bg.webp' },
  { id: 'pattern1', name: 'पैटर्न 1 🌟', file: './Back1.png' },
  { id: 'pattern2', name: 'पैटर्न 2 🌟', file: './Back2.png' },
  { id: 'pattern3', name: 'पैटर्न 3 🌟', file: './Splash2.0.png' },
];

export function PosterGenerator({ panchang, city, activeMuhurats, language = 'Hindi' }: PosterGeneratorProps) {
  const isHindi = language === 'Hindi';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  
  // Themes
  const [selectedTheme, setSelectedTheme] = useState<string>('saffron');
  const [customBgUrl, setCustomBgUrl] = useState<string>('');

  if (!panchang || !panchang.hinduDate) {
    return (
      <div className="flex justify-center p-8 text-slate-400 font-bold bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 rounded-3xl">
        {isHindi ? "पंचांग लोड हो रहा है... कृपया प्रतीक्षा करें।" : "Loading Panchang... Please wait."}
      </div>
    );
  }

  const formattedDate = new Date(panchang.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tithiName = isHindi 
    ? (panchang.hinduDate.tithi?.hindiName || '—')
    : (panchang.hinduDate.tithi?.name || '—');
  const nakshatraDisplay = isHindi 
    ? (panchang.hinduDate.nakshatra?.hindiName || '—')
    : (panchang.hinduDate.nakshatra?.name || '—');
  const hinduMonth = isHindi 
    ? `${panchang.hinduDate.monthHindi || '—'} मास`
    : `${panchang.hinduDate.month || '—'} Month`;
  const currentPaksha = isHindi
    ? (panchang.hinduDate.paksha === 'Shukla' || (panchang.hinduDate.paksha as string) === 'शुक्ल' ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष')
    : `${panchang.hinduDate.paksha} Paksha`;
  const samvatVikram = isHindi 
    ? `विक्रम संवत ${panchang.hinduDate.samvatVikram || '—'}`
    : `Vikram Samvat ${panchang.hinduDate.samvatVikram || '—'}`;
  const samvatShaka = isHindi 
    ? `शक संवत ${panchang.hinduDate.samvatShaka || '—'}`
    : `Shaka Samvat ${panchang.hinduDate.samvatShaka || '—'}`;
  const samvatGujarati = panchang.hinduDate.samvatGujarati 
    ? (isHindi ? `, गुजराती संवत ${panchang.hinduDate.samvatGujarati}` : `, Gujarati Samvat ${panchang.hinduDate.samvatGujarati}`)
    : '';

  const dsh = getDishaShoolInfo(new Date(panchang.date).getDay(), isHindi);

  const brahma = activeMuhurats?.find(m => m.id === 'brahma');
  const abhijit = activeMuhurats?.find(m => m.id === 'abhijit');
  const godhuli = activeMuhurats?.find(m => m.id === 'godhuli');

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomBgUrl(event.target.result as string);
          setSelectedTheme('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderCanvas = async (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    canvas.width = 600;
    canvas.height = 900;

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 1. Draw Background (Gradient or Image)
    if (selectedTheme === 'saffron' || selectedTheme === 'golden' || selectedTheme === 'crimson') {
      let bgGradient = ctx.createLinearGradient(0, 0, 0, 900);
      if (selectedTheme === 'saffron') {
        bgGradient.addColorStop(0, '#FF8A00');
        bgGradient.addColorStop(0.5, '#FF6B00');
        bgGradient.addColorStop(1, '#9E2A00');
      } else if (selectedTheme === 'golden') {
        bgGradient.addColorStop(0, '#F5A623');
        bgGradient.addColorStop(0.5, '#D0021B');
        bgGradient.addColorStop(1, '#4A1204');
      } else {
        bgGradient.addColorStop(0, '#8B0000');
        bgGradient.addColorStop(0.6, '#4B0002');
        bgGradient.addColorStop(1, '#1E0001');
      }
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 600, 900);
    } else {
      let imgSrc = '';
      if (selectedTheme === 'back1') imgSrc = './Back1.png';
      else if (selectedTheme === 'back2') imgSrc = './Back2.png';
      else if (selectedTheme === 'splash') imgSrc = './Splash2.0.png';
      else if (selectedTheme === 'custom') imgSrc = customBgUrl;
      else {
        const deity = DEITY_THEMES.find(d => d.id === selectedTheme);
        if (deity) imgSrc = deity.file;
      }

      if (imgSrc) {
        try {
          const img = await loadImage(imgSrc);
          ctx.drawImage(img, 0, 0, 600, 900);
        } catch (e) {
          console.error("Failed to load background image", e);
          ctx.fillStyle = '#FF6B00';
          ctx.fillRect(0, 0, 600, 900);
        }
      } else {
        ctx.fillStyle = '#FF6B00';
        ctx.fillRect(0, 0, 600, 900);
      }

      // Draw semi-transparent black overlay for legibility
      ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
      ctx.fillRect(0, 0, 600, 900);
    }

    // Set Text Shadows for enhanced readability on all backgrounds
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1.5;
    ctx.shadowOffsetY = 1.5;

    // Sacred Border Framing
    ctx.strokeStyle = '#F6C453';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 560, 860);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, 28, 544, 844);

    // Mandir Dome Outline
    ctx.strokeStyle = 'rgba(246, 196, 83, 0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 820);
    ctx.quadraticCurveTo(60, 140, 300, 110);
    ctx.quadraticCurveTo(540, 140, 540, 820);
    ctx.stroke();

    // 2. HEADER
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ॐ', 300, 70);

    ctx.fillStyle = '#F6C453';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText(isHindi ? 'ॐ श्री गणेशाय नमः 🚩' : 'Om Shri Ganeshay Namah 🚩', 300, 105);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.fillText(isHindi ? 'दैनिक हिन्दू पंचांग और शुभ मुहूर्त' : 'Daily Vedic Panchang & Auspicious Muhurats', 300, 138);

    // Separator line 1
    ctx.strokeStyle = 'rgba(246, 196, 83, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, 160);
    ctx.lineTo(540, 160);
    ctx.stroke();

    // 3. BASIC INFO (Date, Location, Samvat, Month & Paksha)
    ctx.textAlign = 'left';
    ctx.font = 'bold 15px "Inter", sans-serif';
    
    // Line 1: Date
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText((isHindi ? '📅  दिनांक: ' : '📅  Date: ') + formattedDate, 80, 195);
    
    // Line 2: Location
    ctx.fillText((isHindi ? '📍  स्थान: ' : '📍  City: ') + city, 80, 225);

    // Line 3: Samvat
    ctx.fillText((isHindi ? 'ॐ  संवत्: ' : 'ॐ  Samvat: ') + `${samvatVikram}, ${samvatShaka}${samvatGujarati}`, 80, 255);

    // Line 4: Month & Paksha
    ctx.fillText((isHindi ? '🌙  मास व पक्ष: ' : '🌙  Month & Paksha: ') + `${hinduMonth}, ${currentPaksha}`, 80, 285);

    // Separator line 2
    ctx.beginPath();
    ctx.moveTo(60, 305);
    ctx.lineTo(540, 305);
    ctx.stroke();

    // 4. CORE PANCHANG PARAMETERS (Tithi, Nakshatra, Yoga, Karana, Disha Shool, Shool Nivarana)
    // Tithi
    ctx.fillStyle = '#FCD34D';
    ctx.fillText(isHindi ? '📅  तिथि: ' : '📅  Tithi: ', 80, 340);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${tithiName} (${isHindi ? 'समाप्ति:' : 'Ends:'} ${panchang.hinduDate.tithi?.endTime || '—'})`, 175, 340);

    // Nakshatra
    ctx.fillStyle = '#FCD34D';
    ctx.fillText(isHindi ? '⭐  नक्षत्र: ' : '⭐  Nakshatra: ', 80, 372);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${nakshatraDisplay} (${isHindi ? 'स्वामी:' : 'Lord:'} ${panchang.hinduDate.nakshatra?.lord || '—'})`, 175, 372);

    // Yoga
    ctx.fillStyle = '#FCD34D';
    ctx.fillText(isHindi ? '⚡  योग: ' : '⚡  Yoga: ', 80, 404);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${isHindi ? (panchang.hinduDate.yoga?.hindiName || '—') : (panchang.hinduDate.yoga?.name || '—')}`, 175, 404);

    // Karana
    ctx.fillStyle = '#FCD34D';
    ctx.fillText(isHindi ? '🌀  करण: ' : '🌀  Karana: ', 80, 436);
    ctx.fillStyle = '#FFFFFF';
    const karana1Str = isHindi ? (panchang.hinduDate.karana?.hindiName || '—') : (panchang.hinduDate.karana?.name || '—');
    const karana2Str = panchang.hinduDate.karana2 ? `, ${isHindi ? (panchang.hinduDate.karana2.hindiName || '') : panchang.hinduDate.karana2.name}` : '';
    ctx.fillText(`${karana1Str}${karana2Str}`, 175, 436);

    // Disha Shool
    ctx.fillStyle = '#FCD34D';
    ctx.fillText(isHindi ? '🧭  दिशा शूल: ' : '🧭  Disha Shool: ', 80, 468);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${dsh.direction}`, 175, 468);

    // Shool Nivarana
    ctx.fillStyle = '#FCD34D';
    ctx.fillText(isHindi ? '🛡️  शूल निवारण: ' : '🛡️  Remedy: ', 80, 500);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${dsh.remedy}`, 188, 500);

    // Separator line 3
    ctx.beginPath();
    ctx.moveTo(60, 522);
    ctx.lineTo(540, 522);
    ctx.stroke();

    // 5. SUN & MOON TIMINGS
    // Sunrise / Sunset
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText((isHindi ? '🌅  सूर्योदय: ' : '🌅  Sunrise: ') + panchang.sunrise, 80, 552);
    ctx.fillText((isHindi ? '🌇  सूर्यास्त: ' : '🌇  Sunset: ') + panchang.sunset, 310, 552);

    // Moonrise / Moonset
    ctx.fillText((isHindi ? '🌙  चन्द्रोदय: ' : '🌙  Moonrise: ') + (panchang.moonrise || '—'), 80, 582);
    ctx.fillText((isHindi ? '🌌  चन्द्रास्त: ' : '🌌  Moonset: ') + (panchang.moonset || '—'), 310, 582);

    // Separator line 4
    ctx.beginPath();
    ctx.moveTo(60, 604);
    ctx.lineTo(540, 604);
    ctx.stroke();

    // 6. AUSPICIOUS TIMINGS (शुभ मुहूर्त)
    ctx.fillStyle = '#FCD34D';
    ctx.fillText(isHindi ? '✨  मुख्य शुभ मुहूर्त (Auspicious Timings):' : '✨  Primary Auspicious Muhurats:', 80, 638);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'normal 14.5px "Inter", sans-serif';
    ctx.fillText((isHindi ? '• ब्रह्म मुहूर्त: ' : '• Brahma Muhurat: ') + (brahma ? `${brahma.startTime} - ${brahma.endTime}` : '—'), 100, 666);
    ctx.fillText((isHindi ? '• अभिजीत मुहूर्त: ' : '• Abhijit Muhurat: ') + (abhijit ? `${abhijit.startTime} - ${abhijit.endTime}` : '—'), 100, 690);
    ctx.fillText((isHindi ? '• गोधूलि मुहूर्त: ' : '• Godhuli Muhurat: ') + (godhuli ? `${godhuli.startTime} - ${godhuli.endTime}` : '—'), 100, 714);

    // Dynamic Shubh Yogas
    let yogY = 738;
    if (panchang.shubhYogas && panchang.shubhYogas.length > 0) {
      panchang.shubhYogas.slice(0, 1).forEach((y) => {
        ctx.fillText(`• ${isHindi ? y.hindiName : y.name}: ${y.start} - ${y.end}`, 100, yogY);
        yogY += 24;
      });
    }

    // 7. ADVERSE TIMINGS (अशुभ काल)
    ctx.fillStyle = '#FF8A80';
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillText(isHindi ? '⚠️  अशुभ काल (Adverse Timings):' : '⚠️  Inauspicious Periods:', 80, yogY + 12);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'normal 14.5px "Inter", sans-serif';
    ctx.fillText((isHindi ? '• राहुकाल: ' : '• Rahu Kaal: ') + `${panchang.rahuKaal?.start || '—'} ${isHindi ? 'से' : 'to'} ${panchang.rahuKaal?.end || '—'}`, 100, yogY + 38);

    // Separator line 5
    ctx.beginPath();
    ctx.moveTo(60, 816);
    ctx.lineTo(540, 816);
    ctx.stroke();

    // 8. FOOTER BRANDING
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'normal 12px "Inter", sans-serif';
    ctx.fillText(isHindi ? 'साझाकर्ता: Sanatan Watch (सनातन घड़ी) 🚩' : 'Shared via Sanatan Watch 🚩', 300, 842);
    ctx.fillStyle = '#F6C453';
    ctx.font = 'bold 12.5px "Noto Sans Devanagari", sans-serif';
    ctx.fillText(isHindi ? '॥ सनातन धर्मिक समय पंचांग ॥' : '|| Sanatan Vedic Panchang ||', 300, 862);
  };

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await renderCanvas(canvas);

    const dataURL = canvas.toDataURL('image/png');
    const fileName = `Panchang_${city}_${panchang.date}.png`;

    if (Capacitor.isNativePlatform()) {
      try {
        const base64Data = dataURL.split(',')[1];
        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
          recursive: true
        });
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataURL;
        link.click();
      } catch (e) {
        console.error("Failed to download image natively", e);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataURL;
        link.click();
      }
    } else {
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataURL;
      link.click();
    }
  };

  const handleShareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setSharing(true);
    try {
      await renderCanvas(canvas);
      
      const fileName = `Panchang_${city}_${panchang.date}.png`;
      const shareTitle = 'आज का पंचांग पोस्टर';
      const shareText = `🚩 Sanatan Watch पंचांग 🚩\n📍 स्थान: ${city}\n📅 दिनांक: ${formattedDate}`;
      const dataURL = canvas.toDataURL('image/png');

      if (Capacitor.isNativePlatform()) {
        const base64Data = dataURL.split(',')[1];
        
        try {
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
            recursive: true
          });

          await Share.share({
            title: shareTitle,
            text: shareText,
            url: savedFile.uri,
            dialogTitle: isHindi ? 'पंचांग पोस्टर शेयर करें' : 'Share Panchang Poster'
          });
        } catch (nativeShareErr) {
          console.warn("Filesystem/Share native URI error, trying text share fallback", nativeShareErr);
          try {
            await Share.share({
              title: shareTitle,
              text: shareText,
              dialogTitle: isHindi ? 'पंचांग पोस्टर शेयर करें' : 'Share Panchang Poster'
            });
          } catch (fallbackErr) {
            handleDownload();
          }
        }
      } else {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setSharing(false);
            return;
          }
          const file = new File([blob], fileName, { type: 'image/png' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: shareTitle,
                text: shareText
              });
            } catch (err) {
              const link = document.createElement('a');
              link.download = fileName;
              link.href = dataURL;
              link.click();
            }
          } else {
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataURL;
            link.click();
          }
        }, 'image/png');
      }
    } catch (e) {
      console.error("Failed to share image", e);
      alert(isHindi ? "पंचांग विवरण टेक्स्ट कॉपी कर दिया गया है!" : "Panchang details copied to clipboard!");
      handleCopyText();
    } finally {
      setSharing(false);
    }
  };

  const handleCopyText = () => {
    const textMsg = isHindi
      ? `🚩 *Sanatan Watch पंचांग* 🚩\n\n📌 *स्थान:* ${city}\n📅 *दिनांक:* ${formattedDate}\n✨ *तिथि:* ${tithiName} (समाप्ति: ${panchang.hinduDate.tithi.endTime})\n🌟 *नक्षत्र:* ${nakshatraDisplay} (स्वामी: ${panchang.hinduDate.nakshatra.lord})\n🌙 *मास:* ${hinduMonth}\n🔱 *संवत:* ${samvatVikram}, ${samvatShaka}${samvatGujarati}\n🌅 *सूर्योदय:* ${panchang.sunrise}\n🌇 *सूर्यास्त:* ${panchang.sunset}\n\nउच्च परिशुद्धता खगोलीय गणना और दैनिक पंचांग के लिए "Sanatan Watch" ऐप का उपयोग करें!`
      : `🚩 *Sanatan Watch Panchang* 🚩\n\n📌 *City:* ${city}\n📅 *Date:* ${formattedDate}\n✨ *Tithi:* ${tithiName} (Ends: ${panchang.hinduDate.tithi.endTime})\n🌟 *Nakshatra:* ${nakshatraDisplay} (Lord: ${panchang.hinduDate.nakshatra.lord})\n🌙 *Month:* ${hinduMonth}\n🔱 *Samvat:* ${samvatVikram}, ${samvatShaka}${samvatGujarati}\n🌅 *Sunrise:* ${panchang.sunrise}\n🌇 *Sunset:* ${panchang.sunset}\n\nHigh precision Vedic astronomical calculations powered by "Sanatan Watch"!`;
    navigator.clipboard.writeText(textMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preview Card styles based on selectedTheme state
  const getPreviewStyle = () => {
    if (selectedTheme === 'saffron') return { backgroundImage: 'linear-gradient(to bottom, #FF8A00, #FF6B00, #9E2A00)' };
    if (selectedTheme === 'golden') return { backgroundImage: 'linear-gradient(to bottom, #F5A623, #D0021B, #4A1204)' };
    if (selectedTheme === 'crimson') return { backgroundImage: 'linear-gradient(to bottom, #8B0000, #4B0002, #1E0001)' };
    if (selectedTheme === 'back1') return { backgroundImage: 'url(./Back1.png)', backgroundSize: 'cover', backgroundPosition: 'center' };
    if (selectedTheme === 'back2') return { backgroundImage: 'url(./Back2.png)', backgroundSize: 'cover', backgroundPosition: 'center' };
    if (selectedTheme === 'splash') return { backgroundImage: 'url(./Splash2.0.png)', backgroundSize: 'cover', backgroundPosition: 'center' };
    if (selectedTheme === 'custom' && customBgUrl) return { backgroundImage: `url(${customBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    
    const deity = DEITY_THEMES.find(d => d.id === selectedTheme);
    if (deity) return { backgroundImage: `url(${deity.file})`, backgroundSize: 'cover', backgroundPosition: 'center' };

    return { backgroundImage: 'linear-gradient(to bottom, #FF8A00, #FF6B00, #9E2A00)' };
  };

  const isImageTheme = ['back1', 'back2', 'splash', 'custom', ...DEITY_THEMES.map(d => d.id)].includes(selectedTheme);

  return (
    <div id="poster_generator_root" className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left font-sans">
      
      {/* Header and Selectors */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-5 pb-4 border-b border-orange-100/20 dark:border-zinc-800/40">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-100 flex items-center gap-2 font-serif">
            <Camera className="w-5 h-5 text-orange-600 animate-pulse" />
            {isHindi ? "दैनिक पंचांग पोस्टर मेकर" : "Daily Panchang Poster Maker"}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
            {isHindi 
              ? "अपने मित्रों और परिवार के साथ व्हाट्सएप, फेसबुक और इंस्टाग्राम पर साझा करने के लिए सुंदर दैनिक पंचांग पोस्टर बनाएं।" 
              : "Create beautiful daily panchang posters to share with family and friends on WhatsApp, Facebook, and Instagram."}
          </p>
        </div>

        {/* Theme Selectors & Upload */}
        <div className="flex flex-wrap items-center gap-2 bg-orange-500/5 dark:bg-[#1A120B] p-2 rounded-2xl border border-orange-100/30 dark:border-orange-950/40">
          <div className="flex items-center gap-1.5 border-r border-orange-150/20 pr-2">
            <span className="text-[9px] font-black text-orange-850 dark:text-amber-500 uppercase tracking-wider">
              {isHindi ? "रंग थीम्स:" : "Color Themes:"}
            </span>
            <button
              type="button"
              onClick={() => setSelectedTheme('saffron')}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-tr from-amber-500 to-orange-600 border border-white dark:border-zinc-800 cursor-pointer transition-all ${
                selectedTheme === 'saffron' ? 'scale-110 ring-2 ring-orange-500 shadow-xs' : 'opacity-70 hover:opacity-100'
              }`}
              title="Bhagwa Saffron"
              aria-label="Bhagwa Saffron Color Theme"
            />
            <button
              type="button"
              onClick={() => setSelectedTheme('golden')}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-tr from-yellow-500 to-red-600 border border-white dark:border-zinc-800 cursor-pointer transition-all ${
                selectedTheme === 'golden' ? 'scale-110 ring-2 ring-orange-500 shadow-xs' : 'opacity-70 hover:opacity-100'
              }`}
              title="Sindoor Gold"
              aria-label="Sindoor Gold Color Theme"
            />
            <button
              type="button"
              onClick={() => setSelectedTheme('crimson')}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-tr from-red-800 to-stone-900 border border-white dark:border-zinc-800 cursor-pointer transition-all ${
                selectedTheme === 'crimson' ? 'scale-110 ring-2 ring-orange-500 shadow-xs' : 'opacity-70 hover:opacity-100'
              }`}
              title="Mandir Crimson"
              aria-label="Mandir Crimson Color Theme"
            />
          </div>

          {/* Compact Space-Saving Bhagwat Themes Dropdown */}
          <div className="flex items-center gap-1.5 border-r border-orange-150/20 pr-2">
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider">
              {isHindi ? "भगवद् थीम्स:" : "Deity Themes:"}
            </span>
            <select
              value={DEITY_THEMES.some(d => d.id === selectedTheme) ? selectedTheme : ''}
              onChange={(e) => e.target.value && setSelectedTheme(e.target.value)}
              className="bg-zinc-850 hover:bg-zinc-800 text-amber-300 text-[9px] font-bold py-1 px-2 rounded-lg border border-amber-500/40 cursor-pointer outline-none transition-all shadow-xs"
            >
              <option value="" disabled className="bg-zinc-900 text-slate-400">
                {isHindi ? "-- चुनिए (13) --" : "-- Select (13) --"}
              </option>
              {DEITY_THEMES.map((theme) => (
                <option key={theme.id} value={theme.id} className="bg-zinc-900 text-amber-100 py-1">
                  {theme.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 px-2.5 py-1 rounded-xl text-white text-[9px] font-black cursor-pointer shadow-xs transition-all select-none">
            <Upload className="w-3 h-3" />
            {isHindi ? "कस्टम फोटो" : "Custom Photo"}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleCustomImageUpload} 
            />
          </label>
        </div>
      </div>

      {/* Hidden Render Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Preview Panel (Left) */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            id="spiritual_poster_id"
            className="w-full max-w-sm aspect-[3/4.5] p-5 rounded-3xl text-white border-4 border-[#F6C453] relative overflow-y-auto shadow-xl flex flex-col justify-between"
            style={getPreviewStyle()}
          >
            {/* Dark tint overlay mask for readability on image backgrounds */}
            {isImageTheme && (
              <div className="absolute inset-0 bg-black/48 z-0 pointer-events-none" />
            )}

            {/* Poster Header */}
            <div className="text-center z-10 select-none">
              <span className="text-[20px] font-bold block mb-1">ॐ</span>
              <span className="text-[11px] font-bold tracking-widest text-[#F6C453] uppercase font-serif drop-shadow-sm block">
                {isHindi ? 'ॐ श्री गणेशाय नमः 🚩' : 'Om Shri Ganeshay Namah 🚩'}
              </span>
              <span className="text-[14px] text-white font-extrabold block mt-0.5 tracking-wider font-serif">
                {isHindi ? 'दैनिक हिन्दू पंचांग और शुभ मुहूर्त' : 'Daily Vedic Panchang & Auspicious Muhurats'}
              </span>
            </div>

            <div className="border-t border-white/10 my-3 z-10" />

            {/* Poster Body */}
            <div className="my-auto text-left z-10 select-none text-[11px] sm:text-xs space-y-2.5 font-sans">
              
              {/* Basic Info */}
              <div className="space-y-1">
                <div>📅 <strong className="text-slate-250 dark:text-slate-350">{isHindi ? 'दिनांक:' : 'Date:'}</strong> {formattedDate}</div>
                <div>📍 <strong className="text-slate-250 dark:text-slate-350">{isHindi ? 'स्थान:' : 'City:'}</strong> {city}</div>
                <div>ॐ <strong className="text-slate-250 dark:text-slate-350">{isHindi ? 'संवत्:' : 'Samvat:'}</strong> {samvatVikram}, {samvatShaka}{samvatGujarati}</div>
                <div>🌙 <strong className="text-slate-250 dark:text-slate-350">{isHindi ? 'मास व पक्ष:' : 'Month & Paksha:'}</strong> {hinduMonth}, {currentPaksha}</div>
              </div>

              <div className="border-t border-white/10 my-2" />

              {/* Core Panchang */}
              <div className="space-y-1.5">
                <div>📅 <strong className="text-amber-300">{isHindi ? 'तिथि:' : 'Tithi:'}</strong> {tithiName} ({isHindi ? 'समाप्ति:' : 'Ends:'} {panchang.hinduDate.tithi?.endTime || '—'})</div>
                <div>⭐ <strong className="text-amber-300">{isHindi ? 'नक्षत्र:' : 'Nakshatra:'}</strong> {nakshatraDisplay} ({isHindi ? 'स्वामी:' : 'Lord:'} {panchang.hinduDate.nakshatra?.lord || '—'})</div>
                <div>⚡ <strong className="text-amber-300">{isHindi ? 'योग:' : 'Yoga:'}</strong> {isHindi ? (panchang.hinduDate.yoga?.hindiName || '—') : (panchang.hinduDate.yoga?.name || '—')}</div>
                <div>🌀 <strong className="text-amber-300">{isHindi ? 'करण:' : 'Karana:'}</strong> {isHindi ? (panchang.hinduDate.karana?.hindiName || '—') : (panchang.hinduDate.karana?.name || '—')}{panchang.hinduDate.karana2 ? `, ${isHindi ? (panchang.hinduDate.karana2.hindiName || '') : panchang.hinduDate.karana2.name}` : ''}</div>
                <div>🧭 <strong className="text-amber-300">{isHindi ? 'दिशा शूल:' : 'Disha Shool:'}</strong> {dsh.direction}</div>
                <div>🛡️ <strong className="text-amber-300">{isHindi ? 'शूल निवारण:' : 'Remedy:'}</strong> {dsh.remedy}</div>
              </div>

              <div className="border-t border-white/10 my-2" />

              {/* Sun & Moon Timings */}
              <div className="grid grid-cols-2 gap-y-1">
                <div>🌅 <strong className="text-slate-200">{isHindi ? 'सूर्योदय:' : 'Sunrise:'}</strong> {panchang.sunrise}</div>
                <div>🌇 <strong className="text-slate-200">{isHindi ? 'सूर्यास्त:' : 'Sunset:'}</strong> {panchang.sunset}</div>
                <div>🌙 <strong className="text-slate-200">{isHindi ? 'चन्द्रोदय:' : 'Moonrise:'}</strong> {panchang.moonrise || '—'}</div>
                <div>🌌 <strong className="text-slate-200">{isHindi ? 'चन्द्रास्त:' : 'Moonset:'}</strong> {panchang.moonset || '—'}</div>
              </div>

              <div className="border-t border-white/10 my-2" />

              {/* Auspicious Timings */}
              <div>
                <div className="text-[#F6C453] font-bold flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-[#F6C453]" />
                  <span>{isHindi ? 'मुख्य शुभ मुहूर्त (Auspicious Timings):' : 'Primary Auspicious Muhurats:'}</span>
                </div>
                <ul className="list-none pl-3 space-y-0.5 opacity-90 text-[10.5px]">
                  <li>• {isHindi ? 'ब्रह्म मुहूर्त:' : 'Brahma Muhurat:'} {brahma ? `${brahma.startTime} - ${brahma.endTime}` : '—'}</li>
                  <li>• {isHindi ? 'अभिजीत मुहूर्त:' : 'Abhijit Muhurat:'} {abhijit ? `${abhijit.startTime} - ${abhijit.endTime}` : '—'}</li>
                  <li>• {isHindi ? 'गोधूलि मुहूर्त:' : 'Godhuli Muhurat:'} {godhuli ? `${godhuli.startTime} - ${godhuli.endTime}` : '—'}</li>
                  {panchang.shubhYogas && panchang.shubhYogas.slice(0, 1).map((y, i) => (
                    <li key={i}>• {isHindi ? y.hindiName : y.name}: {y.start} - {y.end}</li>
                  ))}
                </ul>
              </div>

              {/* Adverse Timings */}
              <div>
                <div className="text-red-300 font-bold mb-1">{isHindi ? '⚠️ अशुभ काल (Adverse Timings):' : '⚠️ Inauspicious Periods:'}</div>
                <ul className="list-none pl-3 opacity-90 text-[10.5px]">
                  <li>• {isHindi ? 'राहुकाल:' : 'Rahu Kaal:'} {panchang.rahuKaal?.start || '—'} {isHindi ? 'से' : 'to'} {panchang.rahuKaal?.end || '—'}</li>
                </ul>
              </div>

            </div>

            <div className="border-t border-white/10 mt-3 pt-2 text-center select-none">
              <span className="text-[9px] text-white/50 block italic">
                {isHindi ? 'साझाकर्ता: आज का धार्मिक समय ऐप 🚩' : 'Shared via Sanatan Watch App 🚩'}
              </span>
              <span className="text-[10px] text-[#F6C453] font-bold mt-0.5 block tracking-wider font-serif">
                {isHindi ? '॥ सनातन धर्मिक समय पंचांग ॥' : '|| Sanatan Vedic Panchang ||'}
              </span>
            </div>
          </div>
        </div>

        {/* Download & Share Panel (Right) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-450 dark:text-amber-500 uppercase tracking-wider font-mono">
              {isHindi ? 'पोस्टर साझा व डाउनलोड विकल्प' : 'Share & Download Options'}
            </h3>
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-850 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer text-xs sm:text-sm select-none"
            >
              <Download className="w-4 h-4" />
              {isHindi ? 'गैलरी में डाउनलोड करें (PNG)' : 'Download to Gallery (PNG)'}
            </button>

            {/* Native Real Image Share Button */}
            <button
              onClick={handleShareImage}
              disabled={sharing}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-98 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer text-xs sm:text-sm disabled:opacity-50 select-none"
            >
              {sharing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isHindi ? 'पोस्टर तैयार किया जा रहा है...' : 'Generating poster...'}
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-emerald-100" />
                  {isHindi ? 'सोशल मीडिया पर पोस्टर साझा करें' : 'Share Poster on Social Media'}
                </>
              )}
            </button>

            {/* Copy Clipboard Option */}
            <button
              onClick={handleCopyText}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-500/5 dark:bg-zinc-950/20 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-350 font-bold rounded-2xl border border-slate-200/50 dark:border-zinc-800/80 transition-all cursor-pointer text-xs sm:text-sm select-none"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500 shrink-0 animate-bounce" />
                  {isHindi ? 'पंचांग विवरण कॉपी हो गया!' : 'Panchang details copied!'}
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  {isHindi ? 'पंचांग लिखित टेक्स्ट कॉपी करें' : 'Copy Panchang Text'}
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 p-3 mt-3">
              <div className="flex gap-2 text-left">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5 animate-spin-slow" />
                <p className="text-[10px] text-amber-950 dark:text-amber-200 leading-relaxed font-sans">
                  <strong>{isHindi ? 'नया पंचांग लेआउट:' : 'New Panchang Layout:'}</strong> {isHindi 
                    ? 'अब आपका पंचांग पोस्टर वास्तविक वैदिक संरचना में मुद्रित होता है। इसमें ब्रह्म, अभिजीत, गोधूलि मुहूर्त, नक्षत्र स्वामी, करण 1 व 2, गुजराती/शक संवत, चन्द्रोदय/चन्द्रास्त, दिशाशूल निवारण, और सक्रीय शुभ योगों का संपूर्ण विवरण शामिल है।' 
                    : 'Your panchang poster is generated with authentic Vedic structure including Brahma, Abhijit, Godhuli Muhurat, Nakshatra lord, Karanas, Samvat, Moonrise/Moonset, Disha Shool remedy, and active Shubh Yogas.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
