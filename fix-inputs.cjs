const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Admin/Desktop/Expenses/ASEMS/src/modules/Admin/components/operations/modals';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Just prepend backgroundColor to outline: 'none' inside style blocks, only if not already present
  // This is safe since inputs are usually the ones with outline: 'none'
  content = content.replace(/(\s*)(outline:\s*'none')/g, (match, p1, p2) => {
    return p1 + "backgroundColor: 'var(--input-bg, #ffffff)'," + p1 + p2;
  });
  
  fs.writeFileSync(path.join(dir, file), content);
  console.log('Fixed inputs', file);
}
