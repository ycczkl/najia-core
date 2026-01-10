
import type { NaJiaLine } from './najia';
import { Solar, Lunar } from 'lunar-javascript';
import {
    GENERATES, CONTROLS, CLASHES, COMBINATIONS,
    BRANCH_ELEMENTS, getElementRelation
} from './relationships';

// 12 Life Stages (for Tomb/Grave)
const TOMBS: Record<string, string> = {
    '金': '丑',
    '木': '未',
    '水': '辰', '土': '辰',
    '火': '戌'
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

export interface AnalysisResult {
    yongShenLine: NaJiaLine;
    lineIndex: number; // 0-5
    self: {
        isXunKong: boolean;
        isRuMu: boolean;
    };
    dayMonth: {
        monthRelation: string;
        dayRelation: string;
        dayClash: boolean;
        dayCombine: boolean;
        monthClash: boolean;
        monthCombine: boolean;
    };
    movingLines: Array<{
        index: number;
        line: NaJiaLine;
        relation: string;
    }>;
    transformation: {
        hasTransformation: boolean;
        relation: string;
    } | null;
}

import type { YaoType } from './types';

export function performAnalysis(
    lines: YaoType[],
    benGua: NaJiaLine[],
    zhiGua: NaJiaLine[],
    yongShenLiuQin: string,
    dateInput: Date | string,
    manualDayStem?: string
): AnalysisResult[] {
    // Normalize Date
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    // 1. Find Yong Shen Line(s)
    const indices: number[] = [];
    benGua.forEach((l, i) => {
        if (l.liuQin === yongShenLiuQin) indices.push(i);
    });

    const results: AnalysisResult[] = [];

    // Calculate Date Pillars for analysis
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const dayGanZhi = lunar.getDayInGanZhi();
    const dayBranch = dayGanZhi[1];
    const monthGanZhi = lunar.getMonthInGanZhi();
    const monthBranch = monthGanZhi[1];
    const dayXunKong = lunar.getDayXunKong(); // String like '子丑'

    const mEl = BRANCH_ELEMENTS[monthBranch];
    const dEl = BRANCH_ELEMENTS[dayBranch];

    indices.forEach(idx => {
        const line = benGua[idx];
        const element = line.fiveElement;
        const branch = line.branch;

        // --- Self Check ---
        const isXunKong = dayXunKong.includes(branch);
        // Ru Mu (Grave) - Check Day Branch vs Element Tomb
        const tombBranch = TOMBS[element];
        const isRuMu = dayBranch === tombBranch;

        // --- Day/Month ---
        const monthRelation = getElementRelation(mEl, element);
        const dayRelation = getElementRelation(dEl, element);

        const dayClash = CLASHES[dayBranch] === branch;
        const dayCombine = COMBINATIONS[dayBranch] === branch;
        const monthClash = CLASHES[monthBranch] === branch;
        const monthCombine = COMBINATIONS[monthBranch] === branch;

        // --- Moving Lines ---
        const movingLines: Array<{ index: number, line: NaJiaLine, relation: string }> = [];

        benGua.forEach((otherLine, otherIdx) => {
            if (idx === otherIdx) return; // Skip self

            // Check if other line is moving
            const isMoving = lines[otherIdx] === 'old_yin' || lines[otherIdx] === 'old_yang';

            if (isMoving) {
                const relate = getElementRelation(otherLine.fiveElement, element);
                if (relate) {
                    movingLines.push({
                        index: otherIdx,
                        line: otherLine,
                        relation: relate
                    });
                }
            }
        });

        // --- Transformation ---
        let transformation: { hasTransformation: boolean; relation: string } | null = null;
        const selfIsMoving = lines[idx] === 'old_yin' || lines[idx] === 'old_yang';

        if (selfIsMoving && zhiGua[idx]) {
            const zhiLine = zhiGua[idx];
            const zhiEl = zhiLine.fiveElement;
            const zhiBranch = zhiLine.branch;

            let rel = getElementRelation(zhiEl, element);

            if (rel === 'sheng') rel = 'sheng';
            else if (rel === 'ke') rel = 'ke';
            else if (rel === 'wang') rel = 'wang';

            // Hua Jin / Hua Tui
            if (HUA_JIN[branch] === zhiBranch) rel = 'hua_jin';
            if (HUA_TUI[branch] === zhiBranch) rel = 'hua_tui';

            transformation = {
                hasTransformation: true,
                relation: rel
            };
        }

        results.push({
            yongShenLine: line,
            lineIndex: idx,
            self: { isXunKong, isRuMu },
            dayMonth: { monthRelation, dayRelation, dayClash, dayCombine, monthClash, monthCombine },
            movingLines: movingLines,
            transformation: transformation
        });
    });

    return results;
}
