const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.jsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src', 'modules'));

let totalRemoved = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // We explicitly match handlePrint* and handleExportCSV or handleExportExcel
  // We DO NOT match handleExportPDF
  const regex = /<button[^>]*(?:handlePrint[a-zA-Z]*|handleExportCSV|handleExportExcel)[^>]*>[\s\S]*?<\/button>/g;
  
  const matches = content.match(regex);
  if (matches) {
    totalRemoved += matches.length;
  }

  content = content.replace(regex, '');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${path.basename(file)} - removed ${matches.length} button(s)`);
  }
});

console.log(`\nTotal buttons removed: ${totalRemoved}`);
