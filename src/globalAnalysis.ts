
import { CLASHES, COMBINATIONS, GENERATES, BRANCH_ELEMENTS } from './relationships';

// San He (Three Harmony) - Branch Groups
// Shen-Zi-Chen -> Water
// Hai-Mao-Wei -> Wood
// Yin-Wu-Xu -> Fire
// Si-You-Chou -> Metal
export const SAN_HE_GROUPS = [
    { branches: ['申', '子', '辰'], element: '水', name: '申子辰' },
    { branches: ['亥', '卯', '未'], element: '木', name: '亥卯未' },
    { branches: ['寅', '午', '戌'], element: '火', name: '寅午戌' },
    { branches: ['巳', '酉', '丑'], element: '金', name: '巳酉丑' }
];

// San Xing (Three Penalties)
// Yin-Si-Shen (Ungrateful)
// Chou-Wei-Xu (Bullying)
export const SAN_XING_GROUPS = [
    { branches: ['寅', '巳', '申'], type: '无恩之刑', name: '寅巳申' },
    { branches: ['丑', '未', '戌'], type: '恃势之刑', name: '丑未戌' }
];

export interface GlobalAlert {
    type: 'SanHe' | 'SanXing' | 'LiuChong' | 'LiuHe' | 'FanYin' | 'FuYin' | 'LianRu';
    level: 'info' | 'success' | 'warning' | 'error';
    message: string;
    details?: string;
}

/**
 * Analyzes System-Level Indicators (Global Analysis).
 */
export const analyzeGlobalIndicators = (
    hexagramBranches: string[], // Ben Gua Branches
    transformedBranches: string[], // Zhi Gua Branches (if any)
    movingIndices: number[], // Indices of moving lines
    monthBranch: string,
    dayBranch: string,
    hexagramName: string, // For reporting
    anDongIndices: number[] = [] // Optional: indices of "Dark Moving" lines
): GlobalAlert[] => {
    const alerts: GlobalAlert[] = [];

    // 1. Build the "Active Pool" for Combinations
    // Pool = Month + Day + Moving Yao (Ben) + Transformed Yao + Dark Moving Yao
    // Note: Static lines usually don't participate in formation unless referenced, but standard logic uses active energy.
    const activePool = new Set<string>();
    activePool.add(monthBranch);
    activePool.add(dayBranch);

    // Add Moving Lines (Ben + Zhi)
    movingIndices.forEach(idx => {
        activePool.add(hexagramBranches[idx]);
        if (transformedBranches[idx]) activePool.add(transformedBranches[idx]);
    });

    // Add Dark Moving Lines (An Dong) - assuming we get their indices or branches
    anDongIndices.forEach(idx => activePool.add(hexagramBranches[idx]));

    // --- A. San He Ju (Alliance) ---
    SAN_HE_GROUPS.forEach(group => {
        const found = group.branches.filter(b => activePool.has(b));
        const missing = group.branches.filter(b => !activePool.has(b));

        // 1. Complete (3/3)
        if (found.length === 3) {
            alerts.push({
                type: 'SanHe',
                level: 'success', // or info, depends on Yong Shen, but generally 'Effective'
                message: `成局！三合${group.element}局 (${group.name})`,
                details: '多方力量汇聚，能量极大。若合局为用神大吉，为忌神大凶。'
            });
        }
        // 2. Pending (2/3) - Only if at least one is Moving/Transformed (not just Month+Day)
        else if (found.length === 2) {

            // Re-verify participation
            const movingBranches = new Set<string>();
            movingIndices.forEach(i => {
                movingBranches.add(hexagramBranches[i]);
                if (transformedBranches[i]) movingBranches.add(transformedBranches[i]);
            });
            anDongIndices.forEach(i => movingBranches.add(hexagramBranches[i]));

            const participants = found.filter(b => movingBranches.has(b));

            // If at least one active line partcipates
            if (participants.length > 0) {
                alerts.push({
                    type: 'SanHe',
                    level: 'warning',
                    message: `三合局缺一！[${group.name}]`,
                    details: `目前半合。待 [${missing.join('')}] 的年/月/日填实，局势立即生效。`
                });
            }
        }
    });

    // --- B. San Xing (Conflict) ---
    SAN_XING_GROUPS.forEach(group => {
        const found = group.branches.filter(b => activePool.has(b));
        const missing = group.branches.filter(b => !activePool.has(b));

        if (found.length === 3) {
            alerts.push({
                type: 'SanXing',
                level: 'error',
                message: `三刑成局！(${group.name})`,
                details: '极度凶险。循环刑冲，纠纷伤灾。'
            });
        }
        else if (found.length === 2 && missing.length === 1) {
            const movingBranches = new Set<string>();
            movingIndices.forEach(i => {
                movingBranches.add(hexagramBranches[i]);
                if (transformedBranches[i]) movingBranches.add(transformedBranches[i]);
            });
            anDongIndices.forEach(i => movingBranches.add(hexagramBranches[i]));
            const participants = found.filter(b => movingBranches.has(b));

            if (participants.length > 0) {
                alerts.push({
                    type: 'SanXing',
                    level: 'error', // High alert
                    message: `三刑已聚齐两元！[${group.name}]`,
                    details: `危险预警！一旦 [${missing[0]}] 出现，灾难爆发。`
                });
            }
        }
    });

    // --- C. Liu Chong / Liu He (System Stability) ---

    // Check Main Hexagram
    let mainIsChong = false;
    let mainIsHe = false;

    const isChong = (b1: string, b2: string) => CLASHES[b1] === b2;
    const isHe = (b1: string, b2: string) => COMBINATIONS[b1] === b2;

    const pairs = [[0, 3], [1, 4], [2, 5]];
    const mainChongCount = pairs.filter(p => isChong(hexagramBranches[p[0]], hexagramBranches[p[1]])).length;
    const mainHeCount = pairs.filter(p => isHe(hexagramBranches[p[0]], hexagramBranches[p[1]])).length;

    if (mainChongCount === 3) {
        mainIsChong = true;
        alerts.push({
            type: 'LiuChong',
            level: 'warning',
            message: '主卦六冲 (System Instability)',
            details: '事散。冲则散，谋事难成。'
        });
    }
    if (mainHeCount === 3) {
        mainIsHe = true;
        alerts.push({
            type: 'LiuHe',
            level: 'info',
            message: '主卦六合 (System Stable)',
            details: '事成。难解难分，稳定拖延。'
        });
    }

    // Check Transformed Hexagram (if moving)
    if (movingIndices.length > 0) {
        const transChongCount = pairs.filter(p => isChong(transformedBranches[p[0]], transformedBranches[p[1]])).length;
        const transHeCount = pairs.filter(p => isHe(transformedBranches[p[0]], transformedBranches[p[1]])).length;

        const transIsChong = transChongCount === 3;
        const transIsHe = transHeCount === 3;

        // Transitions
        if (mainIsChong && transIsChong) {
            alerts.push({ type: 'LiuChong', level: 'error', message: '六冲变六冲', details: '彻底离散，无药可救。' });
        }
        if (mainIsHe && transIsHe) {
            alerts.push({ type: 'LiuHe', level: 'info', message: '六合变六合', details: '永远纠缠，无法摆脱。' });
        }
        if (mainIsChong && transIsHe) {
            alerts.push({ type: 'LiuHe', level: 'success', message: '冲中逢合', details: '先惊后喜，先散后成。' });
        }
        if (mainIsHe && transIsChong) {
            alerts.push({ type: 'LiuChong', level: 'error', message: '合处逢冲', details: '先好后坏，先成后散。' });
        }
    }

    // --- D. Fan Yin / Fu Yin ---
    if (movingIndices.length > 0) {
        // Check Gua Fan Yin (All 6 lines clash)
        const allClash = hexagramBranches.every((b, i) => isChong(b, transformedBranches[i]));
        if (allClash) {
            alerts.push({ type: 'FanYin', level: 'warning', message: '卦之反吟', details: '反复无常，推翻重来。' });
        }

        // Check Gua Fu Yin (All 6 lines same) - Typically when Main == Transformed but moves exist (e.g. Qian -> Qian)
        // Note: For Fu Yin usually applied when static hexagram is pure, or when moving lines result in same branch.
        const allSame = hexagramBranches.every((b, i) => b === transformedBranches[i]);

        movingIndices.forEach(i => {
            if (hexagramBranches[i] === transformedBranches[i]) {
                alerts.push({ type: 'FuYin', level: 'warning', message: `爻之伏吟 (第${i + 1}爻)`, details: '进退两难，痛苦呻吟。' });
            }
            if (isChong(hexagramBranches[i], transformedBranches[i])) {
                alerts.push({ type: 'FanYin', level: 'warning', message: `爻之反吟 (第${i + 1}爻)`, details: '动而逢冲，反反复复。' });
            }
        });
    }

    // --- E. Lian Ru (Chain Reaction) ---
    // Continuous generation chain among Moving/Transformed.
    // Algorithm: Find longest path of GENERATES in Active Pool.
    // Simplification: Check if we have 3+ elements in a generation chain ending at Yong Shen?
    // User example: "Wood -> Fire -> Earth -> Metal (Yong Shen)".

    const activeElements = new Set<string>();
    movingIndices.forEach(i => {
        if (BRANCH_ELEMENTS[hexagramBranches[i]]) activeElements.add(BRANCH_ELEMENTS[hexagramBranches[i]]);
        if (BRANCH_ELEMENTS[transformedBranches[i]]) activeElements.add(BRANCH_ELEMENTS[transformedBranches[i]]);
    });
    // Check chains
    const elements = Array.from(activeElements);

    let maxChain = 0;
    elements.forEach(start => {
        let current = start;
        let chain = 1;
        // Try to find next
        for (let k = 0; k < 5; k++) {
            const next = GENERATES[current];
            if (activeElements.has(next)) {
                chain++;
                current = next;
            } else {
                break;
            }
        }
        if (chain > maxChain) maxChain = chain;
    });

    if (maxChain >= 3) {
        alerts.push({
            type: 'LianRu',
            level: 'success',
            message: `连茹 (Chain Reaction: ${maxChain}连生)`,
            details: '五行连续相生，能量管道畅通。'
        });
    }

    return alerts;
};
