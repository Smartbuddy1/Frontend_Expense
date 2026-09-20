const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Admin/Desktop/Expenses/ASEMS/src/modules/Admin/components/operations/modals';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Replace text colors
  content = content.replace(/color:\s*'#(0f172a|1e293b|334155)'/g, "color: 'var(--text-primary, #$1)'");
  content = content.replace(/color:\s*'#(475569|64748b)'/g, "color: 'var(--text-secondary, #$1)'");
  content = content.replace(/color:\s*'#94a3b8'/g, "color: 'var(--text-muted, #94a3b8)'");
  
  // Replace background colors
  content = content.replace(/backgroundColor:\s*'#ffffff'/g, "backgroundColor: 'var(--card-bg, #ffffff)'");
  content = content.replace(/backgroundColor:\s*'#f8fafc'/g, "backgroundColor: 'var(--bg-color, #f8fafc)'");
  content = content.replace(/backgroundColor:\s*'#f1f5f9'/g, "backgroundColor: 'var(--bg-color, #f1f5f9)'");
  
  // Replace border colors
  content = content.replace(/border:\s*'(.*?)#(e2e8f0|cbd5e1|f1f5f9)'/g, "border: '$1var(--border-color, #$2)'");
  content = content.replace(/borderBottom:\s*'(.*?)#(e2e8f0|cbd5e1|f1f5f9)'/g, "borderBottom: '$1var(--border-color, #$2)'");
  content = content.replace(/borderTop:\s*'(.*?)#(e2e8f0|cbd5e1|f1f5f9)'/g, "borderTop: '$1var(--border-color, #$2)'");

  // Fix inputs missing backgroundColor
  content = content.replace(/(color:\s*'var\(--text-primary,\s*#[^']+'\),)(\s*)(outline:\s*'none')/g, "$1$2backgroundColor: 'var(--input-bg, #ffffff)',$2$3");
  
  fs.writeFileSync(path.join(dir, file), content);
  console.log('Fixed', file);
}
