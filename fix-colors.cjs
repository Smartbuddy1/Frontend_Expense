const fs = require('fs');
const path = require('path');
const dirs = [
  'c:/Users/Admin/Desktop/Expenses/ASEMS/src/modules/Admin/components/operations/modals',
  'c:/Users/Admin/Desktop/Expenses/ASEMS/src/modules/Operations/components/operations/modals'
];

dirs.forEach(d => {
  fs.readdirSync(d).forEach(f => {
    if(f.endsWith('.jsx')) {
      let c = fs.readFileSync(path.join(d,f), 'utf8');
      
      c = c.replace(/backgroundColor:\s*'(#ffffff|#fff)'/gi, "backgroundColor: 'var(--card-bg, $1)'");
      c = c.replace(/background:\s*'(#ffffff|#fff)'/gi, "background: 'var(--card-bg, $1)'");
      
      c = c.replace(/e\.currentTarget\.style\.backgroundColor\s*=\s*'#f1f5f9'/gi, "e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(255,255,255,0.1))'");
      c = c.replace(/e\.currentTarget\.style\.backgroundColor\s*=\s*'#ffffff'/gi, "e.currentTarget.style.backgroundColor = 'transparent'");
      
      c = c.replace(/color:\s*'#0f172a'/gi, "color: 'var(--text-primary, #0f172a)'");
      c = c.replace(/color:\s*'#334155'/gi, "color: 'var(--text-primary, #334155)'");
      c = c.replace(/color:\s*'#64748b'/gi, "color: 'var(--text-secondary, #64748b)'");
      
      c = c.replace(/e\.currentTarget\.style\.color\s*=\s*'#0f172a'/gi, "e.currentTarget.style.color = 'var(--text-primary, #0f172a)'");
      
      c = c.replace(/borderTop:\s*'1px solid #f1f5f9'/gi, "borderTop: '1px solid var(--border-color, #e2e8f0)'");
      c = c.replace(/border:\s*'1px solid #e2e8f0'/gi, "border: '1px solid var(--border-color, #e2e8f0)'");
      c = c.replace(/border:\s*'1px solid #334155'/gi, "border: '1px solid var(--border-color, #334155)'");
      
      c = c.replace(/backgroundColor:\s*editingProject\s*\?\s*'#f8fafc'\s*:\s*'#ffffff'/gi, "backgroundColor: editingProject ? 'var(--hover-bg, #f8fafc)' : 'var(--card-bg, #ffffff)'");
      
      fs.writeFileSync(path.join(d,f), c);
    }
  });
});
console.log('Fixed hardcoded colors globally.');
