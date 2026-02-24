export interface BodyCompResult {
    label: string;
    color: string;
}

export const getBodyCompositionCategory = (gender: 'M' | 'F', age: number, avgFold: number): BodyCompResult | null => {
    if (age < 15 || !avgFold || avgFold <= 0) return null;

    // Determine Age Group
    let ageGroup: '15-39' | '40-59' | '60-79' | null = null;
    if (age >= 15 && age <= 39) ageGroup = '15-39';
    else if (age >= 40 && age <= 59) ageGroup = '40-59';
    else if (age >= 60) ageGroup = '60-79'; // Treating >79 as 60-79 for now

    if (!ageGroup) return null; // Should not happen with current logic

    const ranges = {
        'F': {
            '15-39': { low: 16, healthy: 28, overweight: 39 },
            '40-59': { low: 18, healthy: 30, overweight: 40 },
            '60-79': { low: 20, healthy: 32, overweight: 42 },
        },
        'M': {
            '15-39': { low: 8, healthy: 20, overweight: 25 },
            '40-59': { low: 11, healthy: 22, overweight: 28 },
            '60-79': { low: 13, healthy: 25, overweight: 30 },
        }
    };

    const criteria = ranges[gender][ageGroup];

    if (avgFold < criteria.low) {
        return { label: 'Bajo en grasa', color: 'text-blue-400' };
    } else if (avgFold <= criteria.healthy) {
        return { label: 'Saludable', color: 'text-green-400' };
    } else if (avgFold <= criteria.overweight) {
        return { label: 'Sobrepeso', color: 'text-yellow-400' };
    } else {
        return { label: 'Obesidad', color: 'text-red-400' };
    }
};
