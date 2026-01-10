
import { describe, it, expect } from 'vitest';
import { getNaJiaData } from '../src/najia';
import type { HexagramData, YaoType } from '../src/types';

describe('NaJia Logic', () => {
    it('should correctly calculate Qian (Creative) hexagram details', () => {
        // Qian is all Yang (7)
        const lines: YaoType[] = Array(6).fill('young_yang');
        const hexagram: HexagramData = { lines };

        // Manual Day Stem 'Jia' (Wood+) -> Qing Long starts at index 0
        const result = getNaJiaData(hexagram, new Date(), '甲');

        expect(result).toHaveLength(6);

        // Bottom Line (Index 0): Stem Jia, Branch Zi, Element Water
        expect(result[0].stem).toBe('甲');
        expect(result[0].branch).toBe('子');
        expect(result[0].fiveElement).toBe('水');
        // Palace Qian (Metal) generates Water (Parent generates Child) -> Zi Sun
        expect(result[0].liuQin).toBe('子孙');
        // Six God: Jia Day -> Qing Long at 0
        expect(result[0].sixGod).toBe('青龙');
        // Shi should be at line 5 (Index 5) for Pure Qian? Or Index 5 (Top)? 
        // Logic: Pure Qian has Shi at Top (Index 5).
        expect(result[5].shiYing).toBe('世');
        expect(result[2].shiYing).toBe('应');
    });

    it('should correctly calculate Kun (Receptive) hexagram details', () => {
        // Kun is all Yin (8)
        const lines: YaoType[] = Array(6).fill('young_yin');
        const hexagram: HexagramData = { lines };

        // Manual Day Stem 'Yi' (Wood-) -> Qing Long starts at index 0 (same as Jia)
        const result = getNaJiaData(hexagram, new Date(), '乙');

        expect(result[0].stem).toBe('乙');
        expect(result[0].branch).toBe('未'); // Kun Bottom is Wei (Earth)

        // Palace Kun (Earth) vs Line (Earth) -> Xiong Di (Brother)
        expect(result[0].liuQin).toBe('兄弟');

        // Pure Kun Shi at Top (Index 5)
        expect(result[5].shiYing).toBe('世');
    });

    it('should correctly assign Six Gods based on Day Stem', () => {
        const lines: YaoType[] = Array(6).fill('young_yang');
        const hexagram: HexagramData = { lines };

        // Wu (Earth+) -> Gou Chen (Index 2 in standard list)
        // Standard: Qing Long, Zhu Que, Gou Chen, Teng She, Bai Hu, Xuan Wu
        const result = getNaJiaData(hexagram, new Date(), '戊');

        expect(result[0].sixGod).toBe('勾陈');
        expect(result[1].sixGod).toBe('腾蛇');
    });
});
