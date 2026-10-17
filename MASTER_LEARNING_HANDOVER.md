# 🎓 Sanatan Watch & Antigravity Master Learning Handover
> **तारीख / Date**: 17 October 2026  
> **उपयोगकर्ता / Developer**: Vinayak Saxena (@vinayaksaxena1-maker)  
> **उद्देश्य / Purpose**: इस डॉक्यूमेंट में अब तक की सभी सीख, प्रोजेक्ट संदर्भ, वर्कफ़्लो नियम और प्रगति का संपूर्ण सार (Summary) है। किसी भी नई चैट में केवल इस फाइल को `@MASTER_LEARNING_HANDOVER.md` लिखकर मेंशन करने पर AI तुरंत पूरी पुरानी समझ और ट्यूनिंग के साथ काम शुरू कर देगा।

---

## 👤 1. डेवलपर प्रोफ़ाइल व संवाद शैली (Developer Persona)
- **भाषा (Language)**: शुद्ध व स्वाभाविक **Hinglish** (टू-द-पॉइंट, स्पष्ट और तकनीकी बातें बिना किसी औपचारिक औपचारिकता/फ्लफ के)।
- **कोडिंग दर्शन (Pragmatic Engineering / Ponytail Ladder)**:
  - **YAGNI**: जब तक strictly आवश्यक न हो, कोई भी अनचाहा फीचर या एब्स्ट्रैक्शन नहीं बनाना।
  - **Reuse**: कोड लिखने से पहले प्रोजेक्ट के मौजूदा यूटिलिटी/पैटर्न को प्राथमिकता देना।
  - **Zero Dependency Bloat**: नया `npm` या `pip` पैकेज तब तक इंस्टॉल न करें जब तक असंभव न हो।
  - **Minimal Code**: 300 लाइन से छोटे कॉम्पोनेन्ट (`react-clean-modular`), क्लीन और डायरेक्ट सॉल्यूशन।

---

## 🛠️ 2. सक्रिय प्रोजेक्ट व तकनीकी संरचना (Active Project Architecture)
- **प्रोजेक्ट पाथ**: `D:\Sanatan_Watch`
- **रिमोट रिपॉजिटरी**: `https://github.com/vinayaksaxena1-maker/Sanatan_Watch.git` (Remote: `origin`)
- **वर्तमान सक्रिय ब्रांच**: `task-2`
- **टेक स्टैक**:
  - **Frontend**: React 18, TypeScript, Tailwind CSS (Vite)
  - **Mobile Container**: Capacitor (Android Native Layer)
  - **Core Astro Engine**: Swiss Ephemeris WASM (`swisseph.wasm`), Web Worker (`astroWorker.ts`), `panchangCalc.ts`, `festivalEngine.ts`, `muhuratRules.ts`
- **डिजास्टर रिकवरी व स्किल्स**:
  - `D:\antigravity-skills` (16 Skills & Rules linked to `~/.gemini/config/skills`)
  - ऑन-डिमांड स्किल लोडिंग (बिना वजह भारी स्किल्स लोड नहीं करना)।

---

## 🧠 3. सीखी गई मुख्य तकनीकें (Mastered Superpowers)

### A. `@` सिंबल (File Targeting)
- पूरे प्रोजेक्ट की अनचाही फाइलें AI को देने के बजाय केवल संबंधित फाइल को `@` से चुनना (जैसे `@src/App.tsx`)।
- **परिणाम**: इससे 95% से 98% टोकन की सीधी बचत होती है और AI बिना कन्फ्यूजन के सटीक काम करता है।

### B. `/` स्लैश कमांड्स
- **`/boost`**: जब किसी फीचर का 360-डिग्री डीप ऑडिट करना हो (UX + QA + Google Play Store कम्प्लायंस)। AI को 3 अलग-अलग नज़रों (Architect, Tester, Designer) से सोचने पर मजबूर करता है।
- **`/compact`**: जब पुरानी चैट लंबी हो जाए तो हिस्ट्री को छोटा करके टोकन बचाने के लिए।

### C. Git Checkpoint Safety Workflow (सुरक्षा चेकपॉइंट)
- किसी भी बड़े कोड बदलाव या रिफैक्टरिंग से पहले:
  ```bash
  git add .
  git commit -m "CHECKPOINT: Safe working state before [Task Name]"
  git push origin [current-branch]
  ```
- **फायदा**: 100% मन की शांति। अगर कोई नया कोड ऐप बिगाड़ता है, तो 1 सेकंड में सुरक्षित चेकपॉइंट पर रोलबैक किया जा सकता है।

### D. Subagents & DeepCoder Architecture
- **Parent Agent**: मुख्य प्रोजेक्ट मैनेजर जो यूजर से बात करता है और प्लान बनाता है।
- **DeepCoder Subagent**: सुपर-स्पेशलिस्ट सीनियर कोडर जो बैकग्राउंड में भारी व जटिल कोड फाइलों (Android Native + TSX) में बिना बाकी कोड बिगाड़े सर्जिकल फिक्स करता है।
- **स्प्लिट विंडो की दाहिनी चैट**: यह केवल डायरेक्ट हॉटलाइन है; सामान्यतः वहाँ कुछ टाइप करने की जरूरत नहीं होती, वह अपने आप काम पूरा करके मेन चैट को रिपोर्ट देता है।

---

## 📌 4. हाल ही में पूरे किए गए मुख्य कार्य (Recent Progress)
1. **Welcome & Daily Panchang Card (`App.tsx`)**:
   - `॥ सनातन पंचांग कल्याणम ॥` हेडर 1px बड़ा (15px) व सेंटर।
   - दिनांक व वार 1px छोटा (13px/15px) व सेंटर।
   - 5-Pillar Overview Grid के हेडर्स 1px बड़े (13px) और रिजल्ट्स 1px छोटे (12px), वि/शक/गु संवत् बॉक्स का रंग बाकी बॉक्स के समान यूनिफॉर्म किया गया।
2. **Notification & Alarm Simulator Play Store Audit**:
   - Android 13/14/15/16 कम्प्लायंस ऑडिट संपन्न (`POST_NOTIFICATIONS`, `FLAG_IMMUTABLE`, `USE_FULL_SCREEN_INTENT`, `BootReceiver.java`)।
   - `task-2` ब्रांच पर सुरक्षित चेकपॉइंट बनाकर DeepCoder सब-एजेंट द्वारा फिक्सेस लागू किए गए।

---

## 🚀 5. नई चैट शुरू करने का "जादुई प्रॉम्प्ट" (Handshake Prompt)
जब भी आप किसी नए काम या नई एजुकेशन चैट में जाएं, तो पहले मैसेज में बस यह लिख दें:

> *"नमस्ते! कृपया प्रोजेक्ट के संदर्भ और मेरी प्राथमिकताओं के लिए `@MASTER_LEARNING_HANDOVER.md` को पढ़ें। हम इसी आधार पर आगे काम और अपनी लर्निंग जारी रखेंगे।"*
