import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('dist')) {
            results = results.concat(walk(fullPath));
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk('/Users/ramon/Documents/nutriapp/components');
files.push('/Users/ramon/Documents/nutriapp/App.tsx');

const MY_BG = '#fdf7e7';
const MY_TEXT = '#3c584b';
const MY_ACCENT = '#cbd9ce';

const classRegex = /(?:hover:|focus:)?(?:bg|text|border|ring|shadow|fill)-([a-zA-Z0-9-\[\]#\/]+)/g;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace all matching color utilities
    content = content.replace(classRegex, (match) => {
        // Skip layout/transparent
        if (match.includes('transparent') || match.includes('current') || match.includes('bg-opacity-10') || match.includes('bg-gradient-to-br') || match.includes('border-t') || match.includes('border-b') || match.includes('border-l') || match.includes('border-r') || match.includes('border-radius') || match.includes('border-dashed') || match.includes('shadow-md') || match.includes('shadow-lg') || match.includes('shadow-sm') || match.includes('shadow-xl') || match.includes('shadow-2xl') || match.match(/text-(sm|md|lg|xl|2xl|3xl|xs|center|left|right)/) || match.includes('ring-1') || match.includes('ring-2') || match.includes('ring-offset')) {
            if (match.includes('text-white') || match.includes('bg-white') || match.includes('shadow-blue') || match.includes('shadow-red') || match.includes('shadow-green') || match.includes('shadow-slate') || match.includes('ring-white') || match.includes('layer') || match.includes('border-color')) {
                // allow these to be processed below
            } else {
                return match; // preserve
            }
        }

        // Determine if it's a structural class that just happened to match
        if (match === 'border-2') return match;

        // If it's a Shadow color (e.g. shadow-blue-500)
        if (match.includes('shadow-')) {
            const prefix = match.split('shadow-')[0];
            return prefix + 'shadow-md'; 
        }

        // Texts -> ALL to MY_TEXT
        if (match.includes('text-')) {
            const prefix = match.split('text-')[0];
            return prefix + 'text-[' + MY_TEXT + ']';
        }

        // Backgrounds -> Accent or BG
        if (match.includes('bg-')) {
            const prefix = match.split('bg-')[0];
            // If it's blue, green, red, amber, orange, purple -> Accent
            if (match.match(/blue|green|red|amber|orange|purple|indigo|emerald|teal/i)) {
                return prefix + 'bg-[' + MY_ACCENT + ']';
            }
            // If it's white, black, slate, gray, zinc, neutral, stone, or our previous custom light colors -> BG
            if (match.match(/white|black|slate|gray|zinc|neutral|stone|fafafa|f2ead6|e6ddc5|dbd0b6|fdf7e7/i)) {
                return prefix + 'bg-[' + MY_BG + ']';
            }
            // Specific overrides for those we know are accents
            if (match.includes('#0070b8') || match.includes('#0085db') || match.includes('#4ade80') || match.includes('#b8c9bc') || match.includes('#bbf7d0') || match.includes('#cbd9ce')) {
                return prefix + 'bg-[' + MY_ACCENT + ']';
            }
            // Default to BG
            return prefix + 'bg-[' + MY_BG + ']';
        }

        // Borders
        if (match.includes('border-')) {
            const prefix = match.split('border-')[0];
            // If it's previously an accent or vibrant color
            if (match.match(/blue|green|red|amber|orange|purple/i) || match.includes('#cbd9ce')) {
                return prefix + 'border-[' + MY_ACCENT + ']';
            }
            // Default border to Text color for visibility (or Accent)
            return prefix + 'border-[' + MY_ACCENT + ']'; // use accent for borders so it's not too harsh
        }

        // Rings
        if (match.includes('ring-')) {
            const prefix = match.split('ring-')[0];
            return prefix + 'ring-[' + MY_ACCENT + ']';
        }

        // Fills
        if (match.includes('fill-')) {
            const prefix = match.split('fill-')[0];
            return prefix + 'fill-[' + MY_TEXT + ']';
        }

        return match;
    });

    fs.writeFileSync(file, content, 'utf8');
});

console.log('Strict replacement completed successfully!');
