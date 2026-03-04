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
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css') || fullPath.endsWith('.html')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk('/Users/ramon/Documents/nutriapp/components');
files.push('/Users/ramon/Documents/nutriapp/App.tsx');
files.push('/Users/ramon/Documents/nutriapp/index.html');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    content = content.replace(/bg-\[#fdf7e7\]\(--primary\)\]/g, 'bg-[#cbd9ce]');
    content = content.replace(/bg-\[#fdf7e7\]\(--card-bg\)\]/g, 'bg-[#fdf7e7]');
    content = content.replace(/bg-\[#fdf7e7\]\(--app-bg\)\]/g, 'bg-[#fdf7e7]');
    
    content = content.replace(/text-\[#3c584b\]\(--text-\[#3c584b\]\)\]/g, 'text-[#3c584b]');
    content = content.replace(/text-\[#3c584b\]\(--primary\)\]/g, 'text-[#cbd9ce]');
    
    content = content.replace(/border-\[#cbd9ce\]\(--primary\)\]/g, 'border-[#cbd9ce]');
    content = content.replace(/border-\[#cbd9ce\]\(--card-bg\)\]/g, 'border-[#cbd9ce]');
    content = content.replace(/border-\[#cbd9ce\]\(--app-bg\)\]/g, 'border-[#cbd9ce]');
    
    content = content.replace(/ring-\[#cbd9ce\]\(--primary\)\]/g, 'ring-[#cbd9ce]');
    
    // Any remaining catching just in case:
    content = content.replace(/\[#fdf7e7\]\(--[a-zA-Z0-9-\[\]#\/]+\)\]/g, '[#fdf7e7]');
    content = content.replace(/\[#cbd9ce\]\(--[a-zA-Z0-9-\[\]#\/]+\)\]/g, '[#cbd9ce]');
    content = content.replace(/\[#3c584b\]\(--[a-zA-Z0-9-\[\]#\/]+\)\]/g, '[#3c584b]');

    fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed CSS corruption!');
