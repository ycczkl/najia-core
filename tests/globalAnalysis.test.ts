
import { describe, it, expect } from 'vitest';
import { analyzeGlobalIndicators } from '../src/globalAnalysis';

describe('Global Analysis', () => {
    it('should detect San He (Three Harmony) - Water Bureau', () => {
        // Shen Zi Chen -> Water
        // Mock data: Main Hexagram has Shen, Zi, Chen
        const hexBranches = ['申', '子', '辰', '午', '未', '酉'];
        const transBranches = ['', '', '', '', '', '']; // Static
        const movingIndices: number[] = [0, 1, 2]; // Assume bottom three are moving/active

        // Month/Day irrelevant if full 3 present in Active Pool?
        // Logic requires Active Pool (Month + Day + Moving + Transformed)
        const alerts = analyzeGlobalIndicators(
            hexBranches, transBranches, movingIndices,
            '午', '未', // Month, Day
            'Test Hex'
        );

        const sanHe = alerts.find(a => a.type === 'SanHe');
        expect(sanHe).toBeDefined();
        expect(sanHe?.message).toContain('申子辰');
    });

    it('should detect Liu Chong (Six Clash) in Main Hexagram', () => {
        // Qian (Heaven) is Six Clash?
        // Qian: Zi, Yin, Chen | Wu, Shen, Xu
        // Pairs: 1-4 (Zi-Wu clash), 2-5 (Yin-Shen clash), 3-6 (Chen-Xu clash)
        // Yes, Qian is a Six Clash hexagram.
        const hexBranches = ['子', '寅', '辰', '午', '申', '戌'];

        const alerts = analyzeGlobalIndicators(
            hexBranches, [], [],
            '寅', '申',
            'Qian'
        );

        const liuChong = alerts.find(a => a.type === 'LiuChong');
        expect(liuChong).toBeDefined();
        expect(liuChong?.message).toContain('主卦六冲');
    });
});
