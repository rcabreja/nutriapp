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

const files = walk('/Users/ramon/Documents/nutriapp');

const classRegex = /(?:bg|text|border|ring|shadow|fill|stroke)-([a-zA-Z0-9-\[\]#\/]+)/g;
const colorsList = new Set();

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = classRegex.exec(content)) !== null) {
        colorsList.add(match[0]);
    }
});

console.log(Array.from(colorsList).sort().join('\n'));
