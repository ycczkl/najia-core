
import { Lunar, Solar } from 'lunar-javascript';

export interface AstrologyData {
    solarDate: string;
    lunarDate: string;
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    dayXunKong: string;
    hourXunKong: string;
    monthJian: string;
    lifeStages: { branch: string; stage: string }[];
}

export const STAGES = [
    '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'
];

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

export const BRANCHES = [
    '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
];

// Start Branch for 'Chang Sheng' based on Stem
// Jia(Wood+) -> Hai(11) | Yi(Wood-) -> Wu(6)
// Bing(Fire+) -> Yin(2) | Ding(Fire-) -> You(9)
// Wu(Earth+) -> Yin(2)  | Ji(Earth-) -> You(9)
// Geng(Metal+) -> Si(5) | Xin(Metal-) -> Zi(0)
// Ren(Water+) -> Shen(8)| Gui(Water-) -> Mao(3)
const CHANG_SHENG_START: Record<string, number> = {
    '甲': 11, '乙': 6,
    '丙': 2, '丁': 9,
    '戊': 2, '己': 9,
    '庚': 5, '辛': 0,
    '壬': 8, '癸': 3
};

// Forward (1) or Backward (-1)
const DIRECTION: Record<string, number> = {
    '甲': 1, '乙': -1,
    '丙': 1, '丁': -1,
    '戊': 1, '己': -1,
    '庚': 1, '辛': -1,
    '壬': 1, '癸': -1
};

export function getAstrologyData(date: Date): AstrologyData {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    const dayStem = lunar.getDayGan(); // Returns string char

    const lifeStages = calculateLifeStages(dayStem);

    return {
        solarDate: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日${solar.getHour()}时${solar.getMinute()}分`,
        lunarDate: lunar.toString(),
        yearPillar: lunar.getYearInGanZhi() + '年',
        monthPillar: lunar.getMonthInGanZhi() + '月',
        dayPillar: lunar.getDayInGanZhi() + '日',
        hourPillar: lunar.getTimeInGanZhi() + '时',
        dayXunKong: lunar.getDayXunKong(),
        hourXunKong: lunar.getTimeXunKong(),
        monthJian: lunar.getMonthInGanZhi(),
        lifeStages
    };
}

export interface GanZhi {
    stem: string;
    branch: string;
}

export interface FourPillars {
    year: GanZhi;
    month: GanZhi;
    day: GanZhi;
    hour: GanZhi;
}

export function calculateLifeStages(dayStem: string): { branch: string; stage: string }[] {
    const startIdx = CHANG_SHENG_START[dayStem] || 0;
    const direction = DIRECTION[dayStem] || 1;

    return BRANCHES.map((branch, i) => {
        let stageIdx;
        if (direction === 1) {
            stageIdx = (i - startIdx + 12) % 12;
        } else {
            stageIdx = (startIdx - i + 12) % 12;
        }

        return {
            branch: branch,
            stage: STAGES[stageIdx]
        };
    });
}

export function calculateXunKong(stem: string, branch: string): string {
    const sIdx = STEMS.indexOf(stem);
    const bIdx = BRANCHES.indexOf(branch);
    if (sIdx === -1 || bIdx === -1) return '';

    // Formula: (BranchIdx - StemIdx + 10) % 12 -> gives Empty1 index
    const e1 = (bIdx - sIdx + 10) % 12;
    const e2 = (e1 + 1) % 12;
    return BRANCHES[e1] + BRANCHES[e2];
}

export function formatManualAstrologyData(pillars: FourPillars): AstrologyData {
    return {
        solarDate: "Manual Input (手动输入)",
        lunarDate: "N/A",
        yearPillar: `${pillars.year.stem}${pillars.year.branch}年`,
        monthPillar: `${pillars.month.stem}${pillars.month.branch}月`,
        dayPillar: `${pillars.day.stem}${pillars.day.branch}日`,
        hourPillar: `${pillars.hour.stem}${pillars.hour.branch}时`,
        dayXunKong: calculateXunKong(pillars.day.stem, pillars.day.branch),
        hourXunKong: calculateXunKong(pillars.hour.stem, pillars.hour.branch),
        monthJian: `${pillars.month.stem}${pillars.month.branch}`,
        lifeStages: calculateLifeStages(pillars.day.stem)
    };
}
