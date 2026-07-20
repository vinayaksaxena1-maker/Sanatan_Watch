# Graph Report - .  (2026-07-20)

## Corpus Check
- Large corpus: 153 files · ~1,508,674 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 505 nodes · 869 edges · 40 communities (32 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33

## God Nodes (most connected - your core abstractions)
1. `PanchangInfo` - 21 edges
2. `PanchangScreen()` - 20 edges
3. `App()` - 18 edges
4. `getTranslation()` - 15 edges
5. `compilerOptions` - 15 edges
6. `getPanchangForDate()` - 14 edges
7. `run()` - 14 edges
8. `AlarmRingerActivity` - 11 edges
9. `AstronomicalEngine` - 11 edges
10. `ChoghadiyaInterval` - 10 edges

## Surprising Connections (you probably didn't know these)
- `App()` --references--> `react`  [EXTRACTED]
  src/App.tsx → package.json
- `SplashScreen()` --references--> `react`  [EXTRACTED]
  src/components/SplashScreen.tsx → package.json
- `MoonPhaseVisualizerProps` --references--> `PanchangInfo`  [EXTRACTED]
  src/components/MoonPhaseVisualizer.tsx → src/types.ts
- `run()` --calls--> `registerEngineListener()`  [EXTRACTED]
  validator/validateEngineV2.ts → src/utils/astronomicalEngine.ts
- `initReferenceEphemeris()` --calls--> `getSeplBuffer()`  [EXTRACTED]
  validator/validateEngineV2.ts → src/utils/epheAssets.ts

## Import Cycles
- None detected.

## Communities (40 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (50): react, react, App(), containerVariants, DEFAULT_COORDS, DEFAULT_SETTINGS, isTimeInInterval(), itemVariants (+42 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (53): getPanchangForDate(), FestivalScreen(), FestivalScreenProps, MONTH_NAMES, WEEKDAYS, AgniVaasDetail, ChandraNakshatraDetail, ChoghadiyaPresentationData (+45 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (23): base64ToArrayBuffer(), calculateTimezoneOffset2(), dateToJulianDay(), formatRawMin2(), getMoonTimes(), getPanchangPositions(), getSemoBuffer(), getSeplBuffer() (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (17): AppWidgetManager, Context, Override, SanatanAnalogWidget, AppWidgetManager, Context, Override, SanatanAppWidget (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (23): MOON_PAKSHA_DAYS, MoonPhaseVisualizer(), MoonPhaseVisualizerProps, TithiDetail, formatMinutesToTimeStr(), getAmritKaal(), getKaranaLordAndDeity(), getPlanetColor() (+15 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (18): HeaderClock, HeaderClockProps, isTimeInInterval(), parseTimeToMinutes(), HoraSystem(), HoraSystemProps, MuhuratScreen(), MuhuratScreenProps (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (22): dist, DOM, DOM.Iterable, ES2022, node_modules, scratch, compilerOptions, allowImportingTsExtensions (+14 more)

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (16): AnalogClock(), AnalogClockProps, ChaughadiyaRing(), ChaughadiyaRingProps, HoraRing(), HoraRingProps, getChoghadiyaAdvice(), getChoghadiyaUpyuktKarya() (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (9): dateToJulianDay(), Grahas, julDayUT(), zodiacSigns, mockDocument, mockLocation, mockSelf, workerState (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (18): isReady(), registerEngineListener(), CONFIG, coverageStats, __dirname, __filename, planetIds, planetNames (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (17): autoprefixer, @capacitor/cli, esbuild, jsdom, devDependencies, autoprefixer, @capacitor/cli, esbuild (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (17): @capacitor/android, d3, lucide-react, motion, dependencies, @capacitor/android, d3, lucide-react (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.26
Nodes (6): Activity, AlarmRingerActivity, Bundle, Override, MediaPlayer, Vibrator

### Community 13 - "Community 13"
Cohesion: 0.23
Nodes (10): CitySelector(), CitySelectorProps, CitySelectorModal(), CitySelectorModalProps, Coords, cities, CityEntry, findClosestCity() (+2 more)

### Community 14 - "Community 14"
Cohesion: 0.19
Nodes (5): AstronomicalEngine, formatRawMin(), isMockActive(), MockAstronomicalEngine, runBulkValidation()

### Community 15 - "Community 15"
Cohesion: 0.17
Nodes (12): extendInitializationTimeout(), initialKeys, mockEngine, moonCache, MoonTimes, PanchangPositions, pendingQueries, positionCache (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.30
Nodes (5): Bundle, Intent, Override, MainActivity, BridgeActivity

### Community 17 - "Community 17"
Cohesion: 0.43
Nodes (5): AlarmReceiver, Context, Intent, Override, BroadcastReceiver

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (5): PlanetPosition, PLANET_MAP, SIGN_MAP, TRANSIT_PREDICTIONS, TransitItem

### Community 20 - "Community 20"
Cohesion: 0.33
Nodes (6): scripts, build, clean, dev, lint, preview

### Community 22 - "Community 22"
Cohesion: 0.60
Nodes (5): retryEngineInitialization(), base64ToArrayBuffer(), getSemoBuffer(), getSeplBuffer(), initReferenceEphemeris()

### Community 23 - "Community 23"
Cohesion: 0.60
Nodes (3): ExampleInstrumentedTest, Test, RunWith

### Community 24 - "Community 24"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 25 - "Community 25"
Cohesion: 0.40
Nodes (3): __dirname, __filename, workerMockPath

### Community 27 - "Community 27"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (3): vite, vite, vite

## Knowledge Gaps
- **115 isolated node(s):** `config`, `name`, `private`, `version`, `type` (+110 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 11` to `Community 0`, `Community 32`, `Community 24`, `Community 29`, `Community 31`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `react` connect `Community 0` to `Community 11`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `App()` connect `Community 0` to `Community 1`, `Community 5`, `Community 9`, `Community 14`, `Community 15`, `Community 22`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `config`, `name`, `private` to the rest of the system?**
  _115 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05704365079365079 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06015037593984962 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11491935483870967 - nodes in this community are weakly interconnected._