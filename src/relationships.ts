
// Element Relationships
export const GENERATES: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
export const CONTROLS: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };

// Branch Relationships
export const CLASHES: Record<string, string> = {
    '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳'
};

export const COMBINATIONS: Record<string, string> = {
    '子': '丑', '丑': '子', '寅': '亥', '亥': '寅', '卯': '戌', '戌': '卯',
    '辰': '酉', '酉': '辰', '巳': '申', '申': '巳', '午': '未', '未': '午'
};

export const BRANCH_ELEMENTS: Record<string, string> = {
    '子': '水', '亥': '水',
    '寅': '木', '卯': '木',
    '巳': '火', '午': '火',
    '申': '金', '酉': '金',
    '辰': '土', '戌': '土', '丑': '土', '未': '土'
};

// Relation Helper
export const getElementRelation = (targetEl: string, myEl: string): string => {
    if (GENERATES[targetEl] === myEl) return 'sheng'; // Born by (Sheng)
    if (CONTROLS[targetEl] === myEl) return 'ke'; // Controlled by (Ke)
    if (targetEl === myEl) return 'wang'; // Same (Bang)
    if (GENERATES[myEl] === targetEl) return 'xie'; // Generates (Xie)
    if (CONTROLS[myEl] === targetEl) return 'hao'; // Controls (Hao)
    return '';
};

// Tombs (Graves)
export const TOMBS: Record<string, string> = {
    '金': '丑',
    '木': '未',
    '水': '辰', '土': '辰',
    '火': '戌'
};

/**
 * Calculates the status of a Line relative to the Month Branch.
 * Priority: 
 * 1. Yue Po (Clash)
 * 2. Yue He (Combine) -> He Wang
 * 3. Element Relation (Wang, Xiang, Xiu, Qiu, Si)
 */
export const analyzeLineStatus = (lineBranch: string, lineElement: string, monthBranch: string): string => {
    // 1. Yue Po (Clash)
    if (CLASHES[monthBranch] === lineBranch) return '月破'; // Yue Po

    // 2. Yue He (Combine)
    if (COMBINATIONS[monthBranch] === lineBranch) return '合旺'; // He Wang

    const monthElement = BRANCH_ELEMENTS[monthBranch];
    if (!monthElement) return ''; // Should not happen

    // 3. Element Relation
    // Month same as Line -> Wang
    if (monthElement === lineElement) return '旺';

    // Month generates Line -> Xiang
    if (GENERATES[monthElement] === lineElement) return '相';

    // Line generates Month -> Xiu
    if (GENERATES[lineElement] === monthElement) return '休';

    // Line controls Month -> Qiu
    if (CONTROLS[lineElement] === monthElement) return '囚';

    // Month controls Line -> Si
    if (CONTROLS[monthElement] === lineElement) return '死';

    return '';
};

/**
 * Calculates the Day Scan status (日辰扫描).
 * Returns an array of status tags (e.g., ['暗动', '空']).
 */
export const analyzeDayStatus = (
    lineBranch: string,
    lineElement: string,
    dayBranch: string,
    dayXunKong: string, // e.g. "子丑"
    isMoving: boolean,
    monthBranch: string
): string[] => {
    const statuses: string[] = [];
    const monthElement = BRANCH_ELEMENTS[monthBranch];

    // Determine Month Strength (Wang/Xiang)
    const isWangXiang = (monthElement === lineElement) || (GENERATES[monthElement] === lineElement);
    const isYuePo = CLASHES[monthBranch] === lineBranch;

    // 1. Clash (Chong)
    if (CLASHES[dayBranch] === lineBranch) {
        if (isWangXiang || isMoving) { // Standard Liu Yao often considers Clashed+Moving as Chong San/Conflict, but Clashed+Wang+Static as An Dong.
            // User Rule: "Day Clash Yao + Month Wang = An Dong"
            if (!isMoving && isWangXiang) statuses.push('暗动');
            else if (isMoving) statuses.push('日冲'); // Just generic clash if moving? Or Chong San.
            else statuses.push('日破'); // Weak + Clash
        } else {
            statuses.push('日破'); // Weak + Clash
        }
    }

    // 2. Combine (He)
    if (COMBINATIONS[dayBranch] === lineBranch) {
        if (!isMoving) statuses.push('合起');
        else statuses.push('绊住');
    }

    // 3. Tomb (Mu)
    if (TOMBS[lineElement] === dayBranch) {
        statuses.push('入墓'); // Day Tomb
    }

    // 4. Void (Xun Kong)
    if (dayXunKong.includes(lineBranch)) {
        // True vs Fake logic
        // "Fake Void": Wang/Xiang or Moving or Day Combine? User: "Wang/Moving = Fake (Temporarily Absent)"
        // "True Void": Yue Po / Ri Po
        // Let's just mark "Kong" for now, UI can color it.
        // Or refined names:
        if (isYuePo || statuses.includes('日破')) {
            statuses.push('真空');
        } else if (isWangXiang || isMoving || statuses.includes('合起')) {
            statuses.push('假空');
        } else {
            statuses.push('空');
        }
    }

    // 5. Sheng/Ke (General assist) - Optional labels if needed, usually implicit.
    // User mentioned: "Day Sheng = Add points". Maybe "日生"?
    // Let's leave out "Sheng/Ke" labels to avoid clutter unless requested as specific tags.
    // However, if no other status, maybe useful?
    // Let's check Day Controls.
    const dayElement = BRANCH_ELEMENTS[dayBranch];
    if (CONTROLS[dayElement] === lineElement) {
        // statuses.push('日克'); // Day controls
    }
    return statuses;
};

// 12 Life Stages - Jue (Extinction)
// Metal: Jue in Yin. Wood: Jue in Shen. Water/Earth: Jue in Si. Fire: Jue in Hai.
const JUE: Record<string, string> = {
    '金': '寅',
    '木': '申',
    '水': '巳', '土': '巳',
    '火': '亥'
};

// Jin / Tui (Advance / Retreat)
const HUA_JIN: Record<string, string> = {
    '申': '酉', '亥': '子', '寅': '卯', '巳': '午',
    '丑': '辰', '辰': '未', '未': '戌', '戌': '丑'
};
const HUA_TUI: Record<string, string> = {
    '酉': '申', '子': '亥', '卯': '寅', '午': '巳',
    '辰': '丑', '未': '辰', '戌': '未', '丑': '戌'
};

/**
 * Calculates the Dynamic Transformation status (动爻分析).
 */
export const analyzeTransformation = (
    originalElement: string,
    originalBranch: string,
    transformedElement: string,
    transformedBranch: string,
    dayBranch: string, // To check Hua Po/Hua Kong if needed (User asked for Hua Kong/Po)
    dayXunKong: string,
    monthBranch: string
): string[] => {
    const statuses: string[] = [];

    // 1. Hui Tou Sheng/Ke
    const rel = getElementRelation(transformedElement, originalElement);
    if (rel === 'sheng') statuses.push('回头生');
    if (rel === 'ke') statuses.push('回头克');

    // 2. Hua Jin / Hua Tui
    if (HUA_JIN[originalBranch] === transformedBranch) statuses.push('化进');
    if (HUA_TUI[originalBranch] === transformedBranch) statuses.push('化退');

    // 3. Hua Mu (Tomb) - Transformed Branch is Tomb of Original Element
    if (TOMBS[originalElement] === transformedBranch) statuses.push('化墓');

    // 4. Hua Jue (Extinction) - Transformed Branch is Jue of Original Element
    if (JUE[originalElement] === transformedBranch) statuses.push('化绝');

    // 5. Hua Kong (Void)
    if (dayXunKong.includes(transformedBranch)) statuses.push('化空');

    // 6. Hua Po (Broken) - Transformed Branch clashed by Month or Day
    // User said: "Hua Po: Transformed clashed by Month/Day". Usually Day Break is critical for results.
    const isDayBreak = CLASHES[dayBranch] === transformedBranch;
    const isMonthBreak = CLASHES[monthBranch] === transformedBranch;
    if (isDayBreak || isMonthBreak) statuses.push('化破');

    return statuses;
};
