# Android Home Screen Widgets & Simulator Revamp Plan

> **लक्ष्य**: Android Native Widgets (`widget_layout.xml`, `widget_small.xml`), Java Providers (`SanatanAppWidget.java`, `SanatanSmallWidget.java`), Android-JS Bridge (`MainActivity.java`), React Sync (`src/App.tsx`), aur In-App Simulator (`src/components/WidgetSimulator.tsx`) ko aam insaan ke anusaar 100% upyogi, live color-coded (🟢/🟡/🔴), aur aapas mein synchronized banana.

---

## 1. मुख्य समस्याएँ (Current Gaps)

1. **2x2 Small Widget mein Actionable Value ka Abhaav**:
   - Vartamaan mein 2x2 widget par kewal static "Tithi" aur "Nakshatra" aata hai.
   - User phone unlock karke seedha dekhna chahta hai: **"Abhi kaun sa Choghadiya chal raha hai, kitne minute bache hain, aur kya koi ashubh samay hai?"**

2. **Color Coding (Green / Yellow / Red) Missing**:
   - Widgets par text sirf white ya halka golden hai.
   - 🟢 Shubh (Labh/Amrit/Shubh), 🟡 Madhyam (Chal), 🔴 Ashubh (Rog/Kaal/Udveg) ka live color door se hi chamakna chahiye.

3. **In-App Simulator vs Asli Native Widget Disconnect**:
   - `WidgetSimulator.tsx` mein light-theme English labels ("Abhijit M...", "Sun", "Movable") hain, jabki asli Android widget dark spiritual theme mein Hindi mein hai. Dono ko 100% mirror hona chahiye.

4. **4x2 Medium Widget mein Clarity ki Kami**:
   - Ek sadharan user ke liye 4x2 widget do hisson mein spasht hona chahiye:
     - **Baayan Card (Live Status)**: Kaun sa Choghadiya + Samay + Bacha hua samay + Karyarat Salaah (Actionable Advice).
     - **Daayan Card (Panchang Stambh)**: Tithi + Abhijit Muhurat + Rahu Kaal + Disha Shool (Upaay sahit).

---

## 2. Proposed Architecture & Data Flow

```
+-----------------------------------------------------------------------+
|                         React / Web Layer                             |
|  src/App.tsx (Panchang & Choghadiya Engine data)                      |
|  - choghadiyaName, choghadiyaType ('shubh'|'madhyam'|'ashubh')         |
|  - choghadiyaTime, remainingMin                                       |
|  - tithi, nakshatra, abhijitStr, rahuKaalStr, dishaStr, cityName      |
+-----------------------------------------------------------------------+
                                  │
                                  ▼  window.AndroidAlarm.updateWidgetData(...)
+-----------------------------------------------------------------------+
|                    Android Native Bridge (MainActivity.java)          |
|  - 10-param @JavascriptInterface updateWidgetData(...)                |
|  - Backwards-compatible 8-param overload                              |
|  - Writes to SharedPreferences ("SanatanWidgetPrefs")                |
|  - Broadcasts ACTION_APPWIDGET_UPDATE for 2x2 & 4x2 providers         |
+-----------------------------------------------------------------------+
             │                                              │
             ▼                                              ▼
+-------------------------+                    +------------------------+
| 2x2 Small Widget        |                    | 4x2 Medium Widget      |
| SanatanSmallWidget.java |                    | SanatanAppWidget.java  |
| res/layout/             |                    | res/layout/            |
| widget_small.xml        |                    | widget_layout.xml      |
|                         |                    |                        |
| • Live Choghadiya Badge |                    | • Header: ॐ + City     |
|   🟢/🟡/🔴 + Time       |                    | • Left: Live Status +  |
| • Remaining Min Alert   |                    |   Action Advice        |
| • Tithi + City Footer   |                    | • Right: 4 Pillars     |
| • Tap -> Opens App      |                    | • Tap -> Opens App     |
+-------------------------+                    +------------------------+
```

---

## 3. UI/UX Wireframes

### 🔹 2x2 Small Widget (`widget_small.xml`)
```
+------------------------------------+
| ॐ सनातन घड़ी             📍 कानपुर  |
|                                    |
|  🟢 लाभ चौघड़िया                   |
|  12:05 AM - 01:40 AM               |
|  ⏳ 45 मिनट शेष (शुभ समय)          |
|                                    |
| 📅 शुक्ल एकादशी • शतभिषा           |
+------------------------------------+
```
- **Tap Action**: Tap anywhere opens `MainActivity` directly.
- **Rahu Kaal Alert**: Agar Rahu Kaal chal raha ho toh background/border par red tint aur warning text highlight hoga.

---

### 🔹 4x2 Medium Widget (`widget_layout.xml`)
```
+-----------------------------------------------------------------+
| ॐ सनातन घड़ी पंचांग                     📍 कानपुर • 22 अक्तू 2026 |
+---------------------------------+-------------------------------+
| 🟢 अभी: लाभ चौघड़िया (शुभ)       | 📿 तिथि: शुक्ल एकादशी (02:48 PM)|
| 12:05 AM - 01:40 AM             | ✨ अभिजीत: 11:42 AM - 12:27 PM|
| ⏳ 35 मिनट शेष                  | ⚠️ राहुकाल: 01:30 PM - 02:55 PM|
| 💡 व्यापार व निवेश हेतु उत्तम    | 🚫 दिशा शूल: दक्षिण (दही खाएं)|
+---------------------------------+-------------------------------+
```
- **Two Card Columns**:
  - **Left (50%)**: Live Choghadiya, color badge, countdown, actionable practical advice.
  - **Right (50%)**: 4 essential Vedic pillars (Tithi, Abhijit, Rahu Kaal, Disha Shool + remedy).
- **Header**: Spiritual gold title + Live City + Date.

---

## 4. Choghadiya Action Advice Mapping

Har Choghadiya ke anusar aam insaan ke liye seedhi aur aasan salaah:

| चौघड़िया | प्रकार | रंग कोड | सलाह (Widget Action Advice) |
| :--- | :--- | :--- | :--- |
| **अमृत** | शुभ | `#4ADE80` (Green) | 💡 साधना, पूजा व शुभ कार्य हेतु सर्वोत्तम |
| **लाभ** | शुभ | `#4ADE80` (Green) | 💡 व्यापार, नए सौदे व निवेश हेतु उत्तम |
| **शुभ** | शुभ | `#4ADE80` (Green) | 💡 मांगलिक कार्य, मिलन व यात्रा हेतु शुभ |
| **चल / चर** | मध्यम | `#FACC15` (Yellow) | 💡 यात्रा, आवागमन व सामान्य कार्य अनुकूल |
| **रोग** | अशुभ | `#F87171` (Red) | ⚠️ नया कार्य टालें, स्वास्थ्य का ध्यान रखें |
| **काल** | अशुभ | `#F87171` (Red) | ⚠️ धन हानि का भय, नए सौदे स्थगित रखें |
| **उद्वेग** | अशुभ | `#F87171` (Red) | ⚠️ तनाव व विवाद से बचें, शांति बनाए रखें |

---

## 5. Detailed Step-by-Step Execution Plan

### Step 1: Android Native Layouts (`res/layout/`)
1. **`widget_small.xml` (2x2 Layout Revamp)**:
   - Root layout: Dark spiritual card (`#1C1714`) with rounded corners and subtle golden border (`#33FF9933`).
   - Header row: `tv_widget_small_title` ("ॐ सनातन") and `tv_widget_small_city` ("📍 कानपुर").
   - Center block:
     - `tv_widget_small_choghadiya`: Large bold title with dynamic color (`#4ADE80` / `#FACC15` / `#F87171`).
     - `tv_widget_small_time`: Time slot (e.g. "12:05 AM - 01:40 AM").
     - `tv_widget_small_remaining`: Countdown badge (e.g. "⏳ 45 मिनट शेष (शुभ)").
   - Footer: `tv_widget_small_tithi` ("📅 शुक्ल एकादशी • शतभिषा").
2. **`widget_layout.xml` (4x2 Medium Layout Revamp)**:
   - Header row: App title + City & Date.
   - Body: `LinearLayout` horizontal (2 columns, 50/50 weight):
     - **Left Box**:
       - `tv_widget_choghadiya_badge`: "🟢 अभी: लाभ चौघड़िया" (color coded).
       - `tv_widget_choghadiya_time`: "12:05 AM - 01:40 AM".
       - `tv_widget_remaining`: "⏳ 35 मिनट शेष".
       - `tv_widget_advice`: "💡 व्यापार व निवेश हेतु उत्तम".
     - **Right Box**:
       - `tv_widget_tithi`: "📿 तिथि: शुक्ल एकादशी".
       - `tv_widget_abhijit`: "✨ अभिजीत: 11:42 AM - 12:27 PM".
       - `tv_widget_rahu`: "⚠️ राहुकाल: 01:30 PM - 02:55 PM".
       - `tv_widget_disha`: "🚫 दिशा शूल: दक्षिण (दही खाएं)".

### Step 2: Java Widget Providers & SharedPreferences
1. **`MainActivity.java` Bridge**:
   - `updateWidgetData(String tithi, String nakshatra, String choghadiyaName, String choghadiyaType, String choghadiyaTime, int remainingMinutes, String rahuKaalStr, String abhijitStr, String dishaShoolStr, String cityName)`
   - Backward-compatible overload `updateWidgetData(String tithi, String nakshatra, String choghadiya, String choghadiyaType, String choghadiyaTime, int remainingMin, String rahuKaalStr, String cityName)`
   - Save all fields in `SanatanWidgetPrefs`:
     - Keys: `tithi`, `nakshatra`, `choghadiyaName`, `choghadiyaType`, `choghadiyaTime`, `remainingMinutes`, `rahuKaal`, `abhijit`, `dishaShool`, `cityName`, `lastUpdated`.
   - Send explicit update broadcast to `SanatanAppWidget` and `SanatanSmallWidget`.
2. **`SanatanSmallWidget.java`**:
   - Read from `SanatanWidgetPrefs`.
   - Set texts for title, city, choghadiya, time, remaining countdown, and tithi.
   - Set textColor dynamically based on `choghadiyaType` (`#4ADE80` green, `#FACC15` yellow, `#F87171` red).
   - Set PendingIntent to open `MainActivity` on click.
3. **`SanatanAppWidget.java`**:
   - Read from `SanatanWidgetPrefs`.
   - Derive actionable advice based on `choghadiyaName`.
   - Format 4 pillars (Tithi, Abhijit, Rahu Kaal, Disha Shool).
   - Apply dynamic color coding on left card.
   - Set PendingIntent to open `MainActivity` on click.

### Step 3: TypeScript Bridge & App Integration
1. **`src/types.ts`**:
   - Update `Window.AndroidAlarm.updateWidgetData` declaration with all 10 params (supporting optional parameters for compatibility).
2. **`src/App.tsx`**:
   - Locate lines 572-576 (`useEffect` for widget update).
   - Pass all 10 parameters cleanly:
     - `tithi`
     - `nakshatra`
     - `choghadiyaName`
     - `choghadiyaType`
     - `choghadiyaTime`
     - `remainingMin`
     - `rahuKaalStr`
     - `abhijitStr`
     - `dishaStr`
     - `cityName`
   - *Strict Guard*: Home Page UI components remain 100% untouched.

### Step 4: Revamp `src/components/WidgetSimulator.tsx`
1. **100% Native Visual Mirror**:
   - Replace old light-theme English cards with identical dark spiritual layouts (`#1C1714` background, `#33FF9933` gold border, rounded corners).
   - **Small Widget (2x2) Preview**:
     - Exact replica of `widget_small.xml` with live props.
     - 🟢/🟡/🔴 badge with pulsing glow.
     - Real-time remaining countdown and current Choghadiya slot.
     - Tithi and City in footer.
   - **Medium Widget (4x2) Preview**:
     - Exact replica of `widget_layout.xml` with two columns.
     - Left column with Live Choghadiya, countdown, and dynamic practical advice.
     - Right column with Tithi, Abhijit Muhurat, Rahu Kaal, and Disha Shool.
2. **Setup Instructions in Pure Hindi**:
   - Clean 3-step guide for regular users:
     1. "फोन की होम स्क्रीन पर खाली जगह पर 2 सेकंड तक दबाकर रखें (Long Press)।"
     2. "नीचे 'Widgets' (विजेट्स) विकल्प पर टैप करें।"
     3. "'सनातन घड़ी' खोजें और 2x2 या 4x2 विजेट को होम स्क्रीन पर ड्रैग करें।"

---

## 6. Verification & Quality Gates

1. **TypeScript Check**: `npx tsc --noEmit` must pass with 0 errors.
2. **Vite Production Build**: `npm run build` must succeed without bundling issues.
3. **Capacitor Android Sync**: `npx cap sync android` to ensure assets and plugins are synced.
4. **Android Native Compilation**: `./gradlew.bat assembleDebug` in `android/` directory must compile cleanly.
5. **Puppeteer Visual Verification**:
   - Navigate to `http://localhost:3000`
   - Open Widget Simulator modal/tab
   - Verify 2x2 and 4x2 widgets match the wireframe perfectly with pure Hindi labels and live colors.

---

## 7. Risk Analysis & Strict Safety Guardrails

| Risk | Mitigation |
| :--- | :--- |
| **Breaking Existing AppWidget Installs** | Dual overload in `MainActivity.java` ensures backward compatibility. Default fallback values for SharedPreferences ensure existing home screen widgets don't crash. |
| **Strict Lock Violation** | Zero changes to `astronomicalEngine.ts`, `astroWorker.ts`, `panchangCalc.ts`, `ChaughadiyaRing.tsx`, `HoraRing.tsx`, `AnalogClock.tsx`, or Home UI. Only `useEffect` param dispatch in `App.tsx` is updated. |
| **Widget Layout Truncation** | Text sizes in XML use `sp` and `wrap_content` with `maxLines` to prevent layout overflow on smaller screen densities. |
