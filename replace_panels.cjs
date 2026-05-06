const fs = require('fs');
const path = require('path');

const dir = '/Users/ramon/Documents/nutriapp/components';

function processDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Pattern 1: Panels and cards with rounded-xl, rounded-2xl or rounded-3xl
            // e.g. bg-[#fdf7e7] border border-[#cbd9ce] rounded-xl
            content = content.replace(/(bg-\[#fdf7e7\] border border-\[#cbd9ce\]\s+(?:p-\d+\s+)?rounded-[23]?xl)/g, (match) => {
                return match.replace('bg-[#fdf7e7]', 'bg-[#cbd9ce]');
            });
            content = content.replace(/(bg-\[#fdf7e7\]\s+border border-\[#cbd9ce\]\s+rounded-[23]?xl)/g, (match) => {
                return match.replace('bg-[#fdf7e7]', 'bg-[#cbd9ce]');
            });

            // Pattern 2: the DataSettings card:
            // p-4 rounded-lg bg-[#fdf7e7] border border-[#cbd9ce] flex flex-col
            content = content.replace(/(p-4 rounded-lg bg-\[#fdf7e7\] border border-\[#cbd9ce\]\s+flex flex-col)/g, (match) => {
                return match.replace('bg-[#fdf7e7]', 'bg-[#cbd9ce]');
            });

            // Pattern 3: Section component definitions where we missed it
            // const Section = ({ title, icon: Icon, children }: any) => (
            //     <div className="bg-[#fdf7e7] border border-[#cbd9ce] rounded-xl
            content = content.replace(/const Section =[^=]+=>\s*\(\s*<div className="bg-\[#fdf7e7\] border border-\[#cbd9ce\] rounded-xl/g, (match) => {
                return match.replace('bg-[#fdf7e7]', 'bg-[#cbd9ce]');
            });

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}

processDirectory(dir);
console.log("Done");
