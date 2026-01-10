
# najia-core

Core logic library for Six Lines Divination (Liu Yao / NaJia), including NaJia calculation, Astrology (Four Pillars), and global hexagram analysis.

## Features

- **NaJia (纳甲)**: Full Jing Fang NaJia system implementation.
  - Generates Stems, Branches, Five Elements, Six Gods, Shi/Ying, Liu Qin.
  - Supports detailed Fu Shen (Hidden Spirit) logic.
- **Astrology Support**: 
  - Solar/Lunar date conversion (powered by `lunar-javascript`).
  - Four Pillars (BaZi) calculation.
  - 12 Life Stages (Chang Sheng) and Xun Kong (Void) calculation.
- **Global Analysis**:
  - Detects San He (Three Harmony) & San Xing (Three Penalties).
  - Identifies Liu Chong (Six Clashes) & Liu He (Six Combinations).
  - Fan Yin / Fu Yin detection.
- **Utility**:
  - Random Hexagram generation (Coin Toss method).
  - Hexagram transformation logic.

## Installation

```bash
npm install najia-core
```

## Usage

### 1. Basic Hexagram & NaJia

```typescript
import { generateRandomHexagram, getNaJiaData } from 'najia-core';

// 1. Generate or define a hexagram
const hexagram = generateRandomHexagram(); 
// or manually: { lines: ['young_yang', 'old_yin', ...] }

// 2. Calculate NaJia details (Shi/Ying, Elements, etc.) based on current date
const najiaData = getNaJiaData(hexagram, new Date());

console.log(najiaData[0]); 
// Output: { stem: 'Jia', branch: 'Zi', fiveElement: 'Water', sixGod: 'Green Dragon', ... }
```

### 2. Astrology & Pillars

```typescript
import { getAstrologyData } from 'najia-core';

const astrology = getAstrologyData(new Date());
console.log(astrology.yearPillar); // e.g., '甲子'
```

### 3. Global Analysis

```typescript
import { analyzeGlobalIndicators } from 'najia-core';

// Analyze relationships between branches
const alerts = analyzeGlobalIndicators(
  ['子', '寅', '辰', ...], // Hexagram Branches
  ['', '', '', ...],      // Transformed Branches (if any)
  [0],                    // Moving Line Indices
  '寅',                   // Month Branch
  '申',                   // Day Branch
  'Heaven'                // Hexagram Name
);

console.log(alerts);
// Output: [{ type: 'LiuChong', message: 'Six Clash Detected', ... }]
```

## License

ISC
