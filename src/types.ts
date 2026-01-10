export type YaoType =
    | 'old_yin'    // 6 (Moving Yin -> Yang)
    | 'young_yang' // 7 (Static Yang)
    | 'young_yin'  // 8 (Static Yin)
    | 'old_yang';  // 9 (Moving Yang -> Yin)

export interface HexagramData {
    lines: YaoType[]; // Index 0 is bottom line (position 1), Index 5 is top line (position 6)
}

export const YAO_VALUES: Record<YaoType, number> = {
    'old_yin': 6,
    'young_yang': 7,
    'young_yin': 8,
    'old_yang': 9
};
