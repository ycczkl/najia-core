
import type { HexagramData, YaoType } from './types';
import { Lunar, Solar } from 'lunar-javascript';

// Types for Na Jia
export interface NaJiaLine {
    stem: string;  // Tian Gan
    branch: string; // Di Zhi
    fiveElement: string; // Wu Xing
    sixGod: string; // Liu Shou (e.g., Qing Long)
    shiYing?: string; // '世' or '应'
    liuQin?: string; // '父母', '兄弟', etc.
    fuShen?: {
        stem: string;
        branch: string;
        fiveElement: string;
        liuQin: string;
    };
    hexagramTypes?: string[];
}

// Trigram Binary to Name Map (Bottom -> Top)
// 0=Yin, 1=Yang
const TRIGRAMS: Record<string, string> = {
    '111': 'qian',
    '000': 'kun',
    '100': 'zhen',
    '011': 'xun',
    '010': 'kan',
    '101': 'li',
    '001': 'gen',
    '110': 'dui'
};


// Na Jia Rules (Jing Fang)
// Stem + Branches per Trigram Position (1-3 for Inner, 4-6 for Outer)
const NA_JIA_RULES: Record<string, { stemInner: string, branchInner: string[], stemOuter: string, branchOuter: string[] }> = {
    'qian': {
        stemInner: '甲', branchInner: ['子', '寅', '辰'],
        stemOuter: '壬', branchOuter: ['午', '申', '戌']
    },
    'kun': {
        stemInner: '乙', branchInner: ['未', '巳', '卯'],
        stemOuter: '癸', branchOuter: ['丑', '亥', '酉']
    },
    'zhen': {
        stemInner: '庚', branchInner: ['子', '寅', '辰'],
        stemOuter: '庚', branchOuter: ['午', '申', '戌']
    },
    'xun': {
        stemInner: '辛', branchInner: ['丑', '亥', '酉'],
        stemOuter: '辛', branchOuter: ['未', '巳', '卯']
    },
    'kan': {
        stemInner: '戊', branchInner: ['寅', '辰', '午'],
        stemOuter: '戊', branchOuter: ['申', '戌', '子']
    },
    'li': {
        stemInner: '己', branchInner: ['卯', '丑', '亥'],
        stemOuter: '己', branchOuter: ['酉', '未', '巳']
    },
    'gen': {
        stemInner: '丙', branchInner: ['辰', '午', '申'],
        stemOuter: '丙', branchOuter: ['戌', '子', '寅']
    },
    'dui': {
        stemInner: '丁', branchInner: ['巳', '卯', '丑'],
        stemOuter: '丁', branchOuter: ['亥', '酉', '未']
    }
};

// Six Gods (Liu Shou) based on Day Stem
const SIX_GODS_ORDER = ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武'];
const DAY_STEM_SIX_GODS_START: Record<string, number> = {
    '甲': 0, '乙': 0, // Jia/Yi -> Qing Long
    '丙': 1, '丁': 1, // Bing/Ding -> Zhu Que
    '戊': 2,         // Wu -> Gou Chen
    '己': 3,         // Ji -> Teng She
    '庚': 4, '辛': 4, // Geng/Xin -> Bai Hu
    '壬': 5, '癸': 5  // Ren/Gui -> Xuan Wu
};

// Dynamic Palace Logic
const PURE_GUAS: Record<string, { name: string, element: string, binary: string }> = {
    '111111': { name: 'qian', element: '金', binary: '111111' },
    '000000': { name: 'kun', element: '土', binary: '000000' },
    '100100': { name: 'zhen', element: '木', binary: '100100' },
    '011011': { name: 'xun', element: '木', binary: '011011' },
    '010010': { name: 'kan', element: '水', binary: '010010' },
    '101101': { name: 'li', element: '火', binary: '101101' },
    '001001': { name: 'gen', element: '土', binary: '001001' },
    '110110': { name: 'dui', element: '金', binary: '110110' }
};

function getHexagramInfo(lines: YaoType[]): { palaceElement: string, shiIndex: number, palaceName: string, isYouHun?: boolean, isGuiHun?: boolean } {
    const bits = lines.map(getBit); // [b1, b2, b3, b4, b5, b6] (Bottom->Top)
    const binary = bits.join('');

    // Check Pure
    if (PURE_GUAS[binary]) return { palaceElement: PURE_GUAS[binary].element, shiIndex: 5, palaceName: PURE_GUAS[binary].name };

    // Logic: Flip lines to find Pure
    let current = [...bits];

    // 1 Gen
    current[0] = current[0] === '1' ? '0' : '1';
    if (PURE_GUAS[current.join('')]) return { palaceElement: PURE_GUAS[current.join('')].element, shiIndex: 0, palaceName: PURE_GUAS[current.join('')].name };

    // 2 Gen
    current[1] = current[1] === '1' ? '0' : '1';
    if (PURE_GUAS[current.join('')]) return { palaceElement: PURE_GUAS[current.join('')].element, shiIndex: 1, palaceName: PURE_GUAS[current.join('')].name };

    // 3 Gen
    current[2] = current[2] === '1' ? '0' : '1';
    if (PURE_GUAS[current.join('')]) return { palaceElement: PURE_GUAS[current.join('')].element, shiIndex: 2, palaceName: PURE_GUAS[current.join('')].name };

    // 4 Gen
    current[3] = current[3] === '1' ? '0' : '1';
    if (PURE_GUAS[current.join('')]) return { palaceElement: PURE_GUAS[current.join('')].element, shiIndex: 3, palaceName: PURE_GUAS[current.join('')].name };

    // 5 Gen
    current[4] = current[4] === '1' ? '0' : '1';
    if (PURE_GUAS[current.join('')]) return { palaceElement: PURE_GUAS[current.join('')].element, shiIndex: 4, palaceName: PURE_GUAS[current.join('')].name };

    // 4 Gen (You Hun): Flip 3 back
    current[3] = current[3] === '1' ? '0' : '1';
    if (PURE_GUAS[current.join('')]) return { palaceElement: PURE_GUAS[current.join('')].element, shiIndex: 3, palaceName: PURE_GUAS[current.join('')].name, isYouHun: true };

    // 3 Gen (Gui Hun): Known specific mapping required for reliable fallback
    const GUI_HUN_MAP: Record<string, { e: string, n: string }> = {
        '111101': { e: '金', n: 'qian' }, // Da You (Qian)
        '000010': { e: '土', n: 'kun' }, // Bi (Kun)
        '100110': { e: '木', n: 'zhen' }, // Sui (Zhen)
        '011001': { e: '木', n: 'xun' }, // Gu (Xun)
        '010000': { e: '水', n: 'kan' }, // Shi (Kan)
        '101111': { e: '火', n: 'li' }, // Tong Ren (Li)
        '001010': { e: '土', n: 'gen' }, // Jian (Gen)
        '110100': { e: '金', n: 'dui' }, // Gui Mei (Dui)
    };

    if (GUI_HUN_MAP[binary]) return { palaceElement: GUI_HUN_MAP[binary].e, shiIndex: 2, palaceName: GUI_HUN_MAP[binary].n, isGuiHun: true };

    // Fallback
    return { palaceElement: '金', shiIndex: 2, palaceName: 'qian' };
}

const GENERATION: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
const CONTROL: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };

function getElementRelation(palaceElem: string, lineElem: string): string {
    if (palaceElem === lineElem) return '兄弟';
    if (GENERATION[palaceElem] === lineElem) return '子孙'; // Palace generates Line
    if (GENERATION[lineElem] === palaceElem) return '父母'; // Line generates Palace
    if (CONTROL[palaceElem] === lineElem) return '妻财';   // Palace controls Line
    if (CONTROL[lineElem] === palaceElem) return '官鬼';   // Line controls Palace
    return '';
}

function getBit(yao: YaoType): string {
    if (yao === 'young_yang' || yao === 'old_yang') return '1';
    return '0';
}

function getTrigramName(lines: YaoType[]): string {
    const bits = lines.map(getBit).join('');
    return TRIGRAMS[bits] || 'qian';
}

const BRANCH_TO_ELEMENT: Record<string, string> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

function getElementByBranch(branch: string): string {
    return BRANCH_TO_ELEMENT[branch] || '';
}

const SIX_COMBINATIONS = [['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未']];
const SIX_CLASHES = [['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']];

function isPairMatch(b1: string, b2: string, pairs: string[][]): boolean {
    return pairs.some(p => (p[0] === b1 && p[1] === b2) || (p[0] === b2 && p[1] === b1));
}

function checkHexagramType(lines: NaJiaLine[], shiIndex: number, palaceName: string, binary: string): string[] {
    const types: string[] = [];

    // Check Six Combinations (Earthly Branches of Lines 1-4, 2-5, 3-6)
    const b1 = lines[0].branch; const b4 = lines[3].branch;
    const b2 = lines[1].branch; const b5 = lines[4].branch;
    const b3 = lines[2].branch; const b6 = lines[5].branch;

    if (isPairMatch(b1, b4, SIX_COMBINATIONS) && isPairMatch(b2, b5, SIX_COMBINATIONS) && isPairMatch(b3, b6, SIX_COMBINATIONS)) {
        types.push('sixCombination');
    }

    // Check Six Clashes
    if (isPairMatch(b1, b4, SIX_CLASHES) && isPairMatch(b2, b5, SIX_CLASHES) && isPairMatch(b3, b6, SIX_CLASHES)) {
        types.push('sixClash');
    }

    return types;
}

// Generate NaJia data for any given hexagram lines (helper for Fu Shen)
function generateNaJiaLines(lines: YaoType[], palaceElement: string): NaJiaLine[] {
    const innerName = getTrigramName(lines.slice(0, 3));
    const outerName = getTrigramName(lines.slice(3, 6));
    const innerRule = NA_JIA_RULES[innerName];
    const outerRule = NA_JIA_RULES[outerName];

    const result: NaJiaLine[] = [];

    // Inner
    for (let i = 0; i < 3; i++) {
        const branch = innerRule.branchInner[i];
        const stem = innerRule.stemInner;
        const element = getElementByBranch(branch);
        result.push({
            stem, branch, fiveElement: element, sixGod: '',
            liuQin: getElementRelation(palaceElement, element)
        });
    }
    // Outer
    for (let i = 0; i < 3; i++) {
        const branch = outerRule.branchOuter[i];
        const stem = outerRule.stemOuter;
        const element = getElementByBranch(branch);
        result.push({
            stem, branch, fiveElement: element, sixGod: '',
            liuQin: getElementRelation(palaceElement, element)
        });
    }
    return result;
}

export function getNaJiaData(hexagram: HexagramData, dateInput: Date | string = new Date(), manualDayStem?: string): NaJiaLine[] {
    const lines = hexagram.lines;
    // Normalize Date
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    const { palaceElement, shiIndex, palaceName, isYouHun, isGuiHun } = getHexagramInfo(lines);
    const yingIndex = (shiIndex + 3) % 6;

    // Calculate Day Stem for Six Gods
    let dayStem: string;
    if (manualDayStem) {
        dayStem = manualDayStem;
    } else {
        const solar = Solar.fromDate(date);
        const lunar = solar.getLunar();
        const dayGanZhi = lunar.getDayInGanZhi();
        dayStem = dayGanZhi.substring(0, 1);
    }
    const startGodIndex = DAY_STEM_SIX_GODS_START[dayStem] || 0;

    // Generate basic data first
    const result = generateNaJiaLines(lines, palaceElement);

    // Calculate Hexagram Types
    const bits = lines.map(getBit);
    const binary = bits.join('');
    const types = checkHexagramType(result, shiIndex, palaceName, binary);
    if (isYouHun) types.push('wanderingSoul');
    if (isGuiHun) types.push('returningSoul');

    // Add Shi/Ying and Six Gods and Types
    for (let i = 0; i < 6; i++) {
        result[i].shiYing = (i === shiIndex ? '世' : (i === yingIndex ? '应' : ''));
        const godIndex = (startGodIndex + i) % 6;
        result[i].sixGod = SIX_GODS_ORDER[godIndex];
        result[i].hexagramTypes = types;
    }

    // Fu Shen Logic (Hidden Spirit)
    // 1. Identify present relations
    const presentRelations = new Set(result.map(l => l.liuQin));
    const allRelations = ['父母', '兄弟', '子孙', '妻财', '官鬼'];
    const missingRelations = allRelations.filter(r => !presentRelations.has(r));

    if (missingRelations.length > 0) {
        // Fetch Head Hexagram (Pure Gua)
        let pureBinary = '';
        Object.entries(PURE_GUAS).forEach(([bin, data]) => {
            if (data.name === palaceName) pureBinary = bin;
        });

        if (pureBinary) {
            const pureLinesArr: YaoType[] = pureBinary.split('').map(b => b === '1' ? 'old_yang' : 'old_yin') as YaoType[];
            const pureNaJia = generateNaJiaLines(pureLinesArr, palaceElement);

            // Map missing relations
            missingRelations.forEach(missingRel => {
                // Find line in Pure Gua with this relation
                const fuLine = pureNaJia.find(l => l.liuQin === missingRel);
                if (fuLine) {
                    const index = pureNaJia.indexOf(fuLine);
                    if (result[index]) {
                        result[index].fuShen = {
                            stem: fuLine.stem,
                            branch: fuLine.branch,
                            fiveElement: fuLine.fiveElement,
                            liuQin: fuLine.liuQin as string
                        };
                    }
                }
            });
        }
    }

    return result;
}
