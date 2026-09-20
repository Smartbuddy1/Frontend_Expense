const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('c:/Users/Admin/Desktop/Expenses/ASEMS/src/modules/Operations', (filepath) => {
    if (!filepath.endsWith('.jsx')) return;
    if (filepath.includes('PrintTemplate')) return;
    
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;

    // text colors
    content = content.replace(/color: '#0f172a'/g, "color: 'var(--text-primary, #0f172a)'");
    content = content.replace(/color: '#1e293b'/g, "color: 'var(--text-primary, #1e293b)'");
    content = content.replace(/color: '#334155'/g, "color: 'var(--text-secondary, #334155)'");
    content = content.replace(/color: '#475569'/g, "color: 'var(--text-secondary, #475569)'");
    
    // backgrounds
    content = content.replace(/backgroundColor: '#ffffff'/g, "backgroundColor: 'var(--card-bg, #ffffff)'");
    content = content.replace(/background: '#ffffff'/g, "background: 'var(--card-bg, #ffffff)'");
    content = content.replace(/backgroundColor: '#f8fafc'/g, "backgroundColor: 'var(--bg-color, #f8fafc)'");
    content = content.replace(/backgroundColor: '#f1f5f9'/g, "backgroundColor: 'var(--table-header-bg, #f1f5f9)'");
    content = content.replace(/background: '#f8fafc'/g, "background: 'var(--bg-color, #f8fafc)'");
    
    // borders
    content = content.replace(/border: '1px solid #e2e8f0'/g, "border: '1px solid var(--border-color, #e2e8f0)'");
    content = content.replace(/border: '1.5px solid #cbd5e1'/g, "border: '1.5px solid var(--border-color, #cbd5e1)'");
    content = content.replace(/border: '1px solid #cbd5e1'/g, "border: '1px solid var(--border-color, #cbd5e1)'");
    content = content.replace(/borderBottom: '1px solid #e2e8f0'/g, "borderBottom: '1px solid var(--border-color, #e2e8f0)'");
    content = content.replace(/borderBottom: '1px solid #e8ecf2'/g, "borderBottom: '1px solid var(--border-color, #e8ecf2)'");
    content = content.replace(/borderBottom: '1px solid #f1f5f9'/g, "borderBottom: '1px solid var(--border-color, #f1f5f9)'");
    
    // specific string cases
    content = content.replace(/color: "#0f172a"/g, 'color: "var(--text-primary, #0f172a)"');
    content = content.replace(/color: "#334155"/g, 'color: "var(--text-secondary, #334155)"');
    content = content.replace(/color: "#475569"/g, 'color: "var(--text-secondary, #475569)"');

    if (content !== original) {
        fs.writeFileSync(filepath, content);
        console.log('Fixed', path.basename(filepath));
    }
});
