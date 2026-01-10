
# najia-core

Core logic library for Six Lines Divination (Liu Yao / NaJia), including NaJia calculation, Astrology (Four Pillars), and global hexagram analysis.

## Features

- **NaJia (纳甲)**: Full Jing Fang NaJia system implementation.
- **Astrology Support**: Four Pillars (BaZi), Life Stages, and Xun Kong.
- **Global Analysis**: San He, San Xing, Liu Chong, Liu He, Fan Yin, Fu Yin.
- **Analysis**: Detailed line relationships, day/month influence, and transformations.

## Installation

```bash
npm install najia-core
```

## API Reference

### 1. Hexagram Generation (`iching.ts`)

Functions for creating and manipulating hexagram structures.

#### `generateRandomHexagram(): HexagramData`
Generates a random hexagram using the 3-coin simulation method (probabilities: 6=1/8, 9=1/8, 7=3/8, 8=3/8).

```typescript
import { generateRandomHexagram } from 'najia-core';
const hex = generateRandomHexagram();
console.log(hex.lines); // ['young_yang', 'old_yin', ...]
```

#### `getTransformedHexagram(hexagram: HexagramData): HexagramData`
Returns the "Zhi Gua" (Transformed Hexagram) by flipping moving lines (Old Yin -> Young Yang, Old Yang -> Young Yin).

```typescript
import { getTransformedHexagram } from 'najia-core';
const zhiGua = getTransformedHexagram(hex);
```

---

### 2. NaJia Calculation (`najia.ts`)

The core module for calculating NaJia attributes (Stem, Branch, Element, Six God, Shi/Ying).

#### `getNaJiaData(hexagram, date, manualDayStem?): NaJiaLine[]`

- **hexagram**: `HexagramData` object.
- **date**: `Date` object (or string) for determining the Day Stem (for Six Gods).
- **manualDayStem** (Optional): Override Day Stem (e.g., '甲').

Returns an array of 6 `NaJiaLine` objects (Bottom to Top).

```typescript
import { getNaJiaData } from 'najia-core';

const lines = getNaJiaData(hexagram, new Date());
const bottomLine = lines[0];

console.log(bottomLine);
/* Output:
{
  stem: 'Jia',         // Heavenly Stem
  branch: 'Zi',        // Earthly Branch
  fiveElement: 'Water',// Five Element
  liuQin: 'Offspring', // Relative (Liu Qin)
  sixGod: 'Green Dragon', // Six God (Liu Shou)
  shiYing: 'Shi',      // 'Shi' (Subject) or 'Ying' (Object) or undefined
  fuShen: { ... }      // Hidden Spirit (Fu Shen) if applicable
}
*/
```

---

### 3. Astrology (`astrology.ts`)

Utilities for BaZi (Four Pillars) and calendar conversions.

#### `getAstrologyData(date: Date): AstrologyData`
Converts a Gregorian date into Lunar/Solar details and Four Pillars.

```typescript
import { getAstrologyData } from 'najia-core';
const astro = getAstrologyData(new Date());

console.log(astro.yearPillar);  // e.g. 'JiaZi'
console.log(astro.dayXunKong);  // e.g. 'XuHai' (Void Branches)
console.log(astro.lifeStages);  // Array of 12 Life Stages for the Day Stem
```

---

### 4. Global Analysis (`globalAnalysis.ts`)

Detects pattern-level attributes of the hexagram involving multiple lines.

#### `analyzeGlobalIndicators(...)`

Checks for San He (Three Harmony), San Xing (Penalties), Liu Chong (Clashes), etc.

```typescript
import { analyzeGlobalIndicators } from 'najia-core';

const alerts = analyzeGlobalIndicators(
  ['Zi', 'Yin', 'Chen', 'Wu', 'Shen', 'Xu'], // Main Hexagram Branches
  [],                                         // Transformed Branches (if any)
  [0, 3],                                     // Indices of moving lines
  'Yin',                                      // Month Branch
  'Shen',                                     // Day Branch
  'Heaven'                                    // Hexagram Name
);

alerts.forEach(alert => {
    console.log(`[${alert.level}] ${alert.type}: ${alert.message}`);
});
// Example: [warning] LiuChong: Main Hexagram Six Clash Detected
```

---

### 5. Detailed Analysis (`analysis.ts` & `relationships.ts`)

Low-level helpers for determining line status (Wang/Xiang, Po, Kong).

#### `analyzeLineStatus(lineBranch, lineElement, monthBranch)`
Returns 'Yue Po' (Month Clash), 'He Wang', 'Wang', 'Xiang', etc.

#### `analyzeDayStatus(...)`
Returns 'Ri Po' (Day Clash), 'An Dong' (Dark Move), 'Ru Mu' (Tomb), 'Kong' (Void).

#### `analyzeTransformation(...)`
Returns 'Hua Jin' (Advance), 'Hua Tui' (Retreat), 'Hui Tou Sheng' (Production), 'Hui Tou Ke' (Control).

```typescript
import { analyzeDayStatus } from 'najia-core';

// Check line status against Day
const status = analyzeDayStatus(
    'Zi', 'Water',  // Line Branch & Element
    'Wu',           // Day Branch
    'XuHai',        // Day Void/Empty
    false,          // Is Moving?
    'Shen'          // Month Branch
);
console.log(status); // ['Ri Po'] (Day Clash)
```

## License
ISC
