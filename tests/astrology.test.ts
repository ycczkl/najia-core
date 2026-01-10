
import { describe, it, expect } from 'vitest';
import { calculateXunKong, calculateLifeStages } from '../src/astrology';

describe('Astrology Logic', () => {
    describe('calculateXunKong', () => {
        it('should calculate correct Xun Kong for Jia Zi', () => {
            // Jia(0) Zi(0) -> group Jia Zi -> Kong is Xu Hai
            // Formula: (0 - 0 + 10) % 12 = 10 (Xu) -> Xu Hai
            expect(calculateXunKong('甲', '子')).toBe('戌亥');
        });

        it('should calculate correct Xun Kong for Jia Xu', () => {
            // Jia(0) Xu(10) -> group Jia Xu -> Kong is Shen You
            // (10 - 0 + 10) % 12 = 20 % 12 = 8 (Shen) -> Shen You
            expect(calculateXunKong('甲', '戌')).toBe('申酉');
        });

        it('should return empty string for invalid input', () => {
            expect(calculateXunKong('Foo', 'Bar')).toBe('');
        });
    });

    describe('calculateLifeStages', () => {
        it('should return correct stages for Jia Wood', () => {
            // Jia (Wood+) starts Chang Sheng at Hai (Pig)
            const stages = calculateLifeStages('甲');

            const hai = stages.find(s => s.branch === '亥');
            expect(hai?.stage).toBe('长生');

            const zi = stages.find(s => s.branch === '子');
            expect(zi?.stage).toBe('沐浴'); // Forward
        });

        it('should return correct stages for Yi Wood (Reverse)', () => {
            // Yi (Wood-) starts Chang Sheng at Wu (Horse) and goes backwards
            const stages = calculateLifeStages('乙');

            const wu = stages.find(s => s.branch === '午');
            expect(wu?.stage).toBe('长生');

            const si = stages.find(s => s.branch === '巳');
            expect(si?.stage).toBe('沐浴'); // Backwards: Wu(6) -> Si(5)
        });
    });
});
