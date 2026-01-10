
# najia-core

[English Version](README_EN.md)

六爻纳甲占卜核心逻辑库，包含纳甲计算、八字排盘（四柱）、以及全局卦象分析功能。

## 功能特性

- **纳甲系统**: 完整的京房纳甲系统实现。
  - 生成天干、地支、五行、六神、世应、六亲。
  - 支持详细的伏神（飞伏神）逻辑。
- **八字排盘支持**:
  - 公历/农历转换（基于 `lunar-javascript`）。
  - 四柱（八字）排盘计算。
  - 十二长生与旬空计算。
- **全局分析**:
  - 检测三合局与三刑。
  - 识别六冲卦与六合卦。
  - 反吟与伏吟检测。
- **工具**:
  - 随机起卦（模拟铜钱掷币法）。
  - 卦象变换逻辑（本卦变之卦）。

## 安装

```bash
npm install najia-core
```

## 使用方法

### 1. 基础 hexagram 与纳甲数据

```typescript
import { generateRandomHexagram, getNaJiaData } from 'najia-core';

// 1. 生成或定义卦象
const hexagram = generateRandomHexagram();
// 或手动指定: { lines: ['young_yang', 'old_yin', ...] }

// 2. 根据当前日期计算纳甲详情（世应、五行等）
const najiaData = getNaJiaData(hexagram, new Date());

console.log(najiaData[0]);
// 输出: { stem: '甲', branch: '子', fiveElement: '水', sixGod: '青龙', ... }
```

### 2. 八字排盘

```typescript
import { getAstrologyData } from 'najia-core';

const astrology = getAstrologyData(new Date());
console.log(astrology.yearPillar); // 例如：'甲子'
```

### 3. 全局分析

```typescript
import { analyzeGlobalIndicators } from 'najia-core';

// 分析地支关系
const alerts = analyzeGlobalIndicators(
  ['子', '寅', '辰', ...], // 本卦地支
  ['', '', '', ...],      // 变卦地支（如有）
  [0],                    // 动爻索引
  '寅',                   // 月建
  '申',                   // 日建
  '乾为天'                // 卦名
);

console.log(alerts);
// 输出: [{ type: 'LiuChong', message: '主卦六冲', ... }]
```

## 许可证

ISC
