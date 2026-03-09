// Calculate the Optimal Recognition Point (ORP) 
// The ORP is usually slightly left of center for English words.
export function calculateORP(word: string): { left: string; center: string; right: string } {
    const cleanWord = word.trim();
    if (!cleanWord) return { left: '', center: '', right: '' };
    
    // Simple ORP calculation heuristic
    let centerIndex = 0;
    const len = cleanWord.length;
    
    switch (len) {
        case 1: centerIndex = 0; break;
        case 2:
        case 3: centerIndex = 1; break;
        case 4:
        case 5: centerIndex = 2; break;
        case 6:
        case 7:
        case 8:
        case 9: centerIndex = 3; break;
        case 10:
        case 11:
        case 12: centerIndex = 4; break;
        case 13: 
        case 14: centerIndex = 5; break;
        default: centerIndex = Math.floor(len / 3); // Fallback for very long words
    }

    return {
        left: cleanWord.substring(0, centerIndex),
        center: cleanWord.substring(centerIndex, centerIndex + 1),
        right: cleanWord.substring(centerIndex + 1)
    };
}

// Basic text parser to split raw text into displayable chunks
// In V1, we split by whitespace but keep punctuation attached to words.
export function parseText(rawText: string): string[] {
    // Regex matches words and includes attached punctuation
    // It also preserves paragraph breaks as distinct empty tokens if we want to pause on them
    const tokens = rawText.split(/\s+/);
    return tokens.filter(t => t.trim().length > 0);
}

// Calculate the millisecond delay for a specific word based on Base WPM
export function calculateWordDelay(word: string, baseWPM: number): number {
    const baseDelayMS = (60 / baseWPM) * 1000;
    
    let multiplier = 1.0;
    const trimmed = word.trim();
    
    // Punctuation heuristics
    if (trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?')) {
        multiplier = 2.0; // Longer pause at end of sentence
    } else if (trimmed.endsWith(',') || trimmed.endsWith(';') || trimmed.endsWith(':')) {
        multiplier = 1.5; // Short pause for mid-sentence punctuation
    } else if (trimmed.includes('-')) {
        multiplier = 1.2; // Slight pause for hyphens
    }

    // Word length heuristic (give slightly more time for very long words)
    if (trimmed.length > 8) {
        multiplier += 0.2;
    }

    return baseDelayMS * multiplier;
}
