import type { HexagramData, YaoType } from './types';

/**
 * Generates a random Yao using the coin toss method simulation.
 * 3 coins: Front(3) / Back(2).
 * Sums:
 * 3+3+3=9 (Old Yang) - Prob 1/8
 * 2+2+2=6 (Old Yin) - Prob 1/8
 * 3+2+2=7 (Young Yang) - Prob 3/8
 * 3+3+2=8 (Young Yin) - Prob 3/8
 */
export function generateRandomYao(): YaoType {
    const toss = () => (Math.random() < 0.5 ? 2 : 3);
    const sum = toss() + toss() + toss();

    switch (sum) {
        case 6: return 'old_yin';
        case 7: return 'young_yang';
        case 8: return 'young_yin';
        case 9: return 'old_yang';
        default: return 'young_yang'; // Should not happen
    }
}

export function generateRandomHexagram(): HexagramData {
    const lines: YaoType[] = [];
    for (let i = 0; i < 6; i++) {
        lines.push(generateRandomYao());
    }
    return { lines };
}

/**
 * Transforms a hexagram by changing moving lines to their opposites.
 * Static lines remain unchanged.
 */
export function getTransformedHexagram(original: HexagramData): HexagramData {
    const newLines = original.lines.map(yao => {
        switch (yao) {
            case 'old_yin': return 'young_yang';   // 6 -> 7
            case 'old_yang': return 'young_yin';   // 9 -> 8
            case 'young_yang': return 'young_yang';
            case 'young_yin': return 'young_yin';
        }
    });
    return { lines: newLines };
}

/**
 * Check if the hexagram has any moving lines (and thus a different transformed state).
 */
export function hasTransformation(hexagram: HexagramData): boolean {
    return hexagram.lines.some(line => line === 'old_yin' || line === 'old_yang');
}
