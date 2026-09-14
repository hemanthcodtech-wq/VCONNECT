const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === 'dist' || file === '.git' || file === '.kombai') return;
        let fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            results.push(fullPath);
        }
    });
    return results;
}

const vkonFiles = walk('/Users/hemanthkancharla/Documents/zewotech/VKONNECT/vkon');
const vkonbeFiles = walk('/Users/hemanthkancharla/Documents/zewotech/VKONNECT/vkonbe');
const allFiles = [...vkonFiles, ...vkonbeFiles];

for (const file of allFiles) {
    if (!file.match(/\.(js|jsx|ts|tsx|html|css|md|json|txt|cjs|mjs)$/)) continue;
    if (file.endsWith('package-lock.json')) continue;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Specific email
    content = content.replace(/admin@UP Traders\.com/gi, 'admin@vconnect.com');
    
    // Name replacements
    content = content.replace(/UP Traders/g, 'VConnect');
    content = content.replace(/UP TRADERS/g, 'VCONNECT');
    content = content.replace(/uptraders\.in/g, 'vconnect.in');
    content = content.replace(/upraders\.com/g, 'vconnect.com');
    content = content.replace(/uptraders/gi, 'vconnect');
    content = content.replace(/Up Traders/gi, 'VConnect');

    // Color replacements
    content = content.replace(/brand-green/g, 'brand-blue');
    content = content.replace(/#106935/g, '#0033a0'); // the old green to the new blue
    
    if (file.endsWith('tailwind.config.js')) {
        content = content.replace(/'#F29D38'/g, "'#ff6600'"); // orange
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
