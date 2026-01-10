
# najia-core

[English Version](README_EN.md)

六爻纳甲占卜核心逻辑库，包含纳甲计算、八字排盘（四柱）、以及全局卦象分析功能。

## 功能特性

- **纳甲系统**: 完整的京房纳甲系统实现。
- **八字排盘**: 支持四柱（八字）、十二长生、旬空计算。
- **全局分析**: 支持三合局、三刑、六冲、六合、反吟、伏吟检测。
- **详细断卦**: 支持旺相休囚死、月破、日破、暗动、化进化退等详细状态分析。

## 安装

```bash
npm install najia-core
```

## API 参考文档

### 1. 卦象生成 (`iching.ts`)

用于创建和操作卦象结构的函数。

#### `generateRandomHexagram(): HexagramData`
使用铜钱起卦法（模拟）生成随机卦象（概率：老阴/老阳各1/8，少阴/少阳各3/8）。

```typescript
import { generateRandomHexagram } from 'najia-core';
const hex = generateRandomHexagram();
console.log(hex.lines); // ['young_yang', 'old_yin', ...]
```

#### `getTransformedHexagram(hexagram: HexagramData): HexagramData`
获取“之卦”（变卦）。逻辑：老阴变少阳，老阳变少阴，静爻不变。

```typescript
import { getTransformedHexagram } from 'najia-core';
const zhiGua = getTransformedHexagram(hex);
```

---

### 2. 纳甲计算 (`najia.ts`)

核心模块，用于计算每一爻的纳甲属性（天干、地支、五行、六神、世应、六亲）。

#### `getNaJiaData(hexagram, date, manualDayStem?): NaJiaLine[]`

- **hexagram**: `HexagramData` 对象。
- **date**: `Date` 对象（或字符串），用于确定日干（排六神用）。
- **manualDayStem** (可选): 手动指定日干（如 '甲'）。

返回包含6个 `NaJiaLine` 对象的数组（顺序：初爻 -> 上爻）。

```typescript
import { getNaJiaData } from 'najia-core';

const lines = getNaJiaData(hexagram, new Date());
const bottomLine = lines[0];

console.log(bottomLine);
/* 输出示例:
{
  stem: '甲',          // 天干
  branch: '子',        // 地支
  fiveElement: '水',   // 五行
  liuQin: '子孙',      // 六亲
  sixGod: '青龙',      // 六神
  shiYing: '世',       // 世应 ('世' 或 '应')
  fuShen: { ... }     // 伏神信息（如有）
}
*/
```

---

### 3. 八字排盘 (`astrology.ts`)

提供八字四柱及历法转换工具。

#### `getAstrologyData(date: Date): AstrologyData`
将公历日期转换为农历干支信息。

```typescript
import { getAstrologyData } from 'najia-core';
const astro = getAstrologyData(new Date());

console.log(astro.yearPillar);  // 例如 '甲子'
console.log(astro.dayXunKong);  // 例如 '戌亥' (日空)
console.log(astro.lifeStages);  // 十二长生状态数组 (基于日干)
```

---

### 4. 全局分析 (`globalAnalysis.ts`)

检测涉及多爻的全局卦象模式。

#### `analyzeGlobalIndicators(...)`

检测三合局、三刑、六冲、六合等。

```typescript
import { analyzeGlobalIndicators } from 'najia-core';

const alerts = analyzeGlobalIndicators(
  ['子', '寅', '辰', '午', '申', '戌'], // 本卦地支
  [],                                 // 变卦地支
  [0, 3],                             // 动爻索引
  '寅',                               // 月建
  '申',                               // 日建
  '乾为天'                             // 卦名
);

alerts.forEach(alert => {
    console.log(`[${alert.level}] ${alert.type}: ${alert.message}`);
});
// 示例: [warning] LiuChong: 主卦六冲
```

---

### 5. 详细断卦与状态分析 (`analysis.ts` & `relationships.ts`)

底层辅助函数，用于判断旺衰、月破、空亡等状态。

#### `analyzeLineStatus(lineBranch, lineElement, monthBranch)`
判断月建关系：返回 '月破'、'合旺'、'旺'、'相' 等。

#### `analyzeDayStatus(...)`
判断日建关系：返回 '日破'、'暗动'、'入墓'、'空' 等。

#### `analyzeTransformation(...)`
判断动爻变化：返回 '化进'、'化退'、'回头生'、'回头克' 等。

```typescript
import { analyzeDayStatus } from 'najia-core';

// 检查某爻与日辰的关系
const status = analyzeDayStatus(
    '子', '水',    // 爻支与五行
    '午',         // 日建
    '戌亥',        // 旬空
    false,        // 是否动爻
    '申'          // 月建
);
console.log(status); // ['日破'] (子午冲)
```

## 许可证
ISC
