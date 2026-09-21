const fs = require('fs');
const { execSync } = require('child_process');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = dir + '/' + file;
    if (fs.statSync(fullPath).isDirectory()) results = results.concat(walk(fullPath));
    else if (fullPath.endsWith('.jsx')) results.push(fullPath);
  });
  return results;
}

const files = walk('src/modules');

files.forEach(file => {
  let currentContent = fs.readFileSync(file, 'utf8');
  let headContent;
  try {
    headContent = execSync(`git show HEAD:"${file}"`).toString();
  } catch (e) {
    return; // New file or error
  }

  const pdfRegex = /<button[^>]*handleExportPDF[^>]*>[\s\S]*?<\/button>/g;
  const pdfButtonsInHead = [...headContent.matchAll(pdfRegex)];
  const pdfButtonsInCurrent = [...currentContent.matchAll(pdfRegex)];

  if (pdfButtonsInHead.length > pdfButtonsInCurrent.length) {
    console.log(`Restoring PDF buttons in ${file}`);
    
    for (const match of pdfButtonsInHead) {
      if (!currentContent.includes(match[0])) {
        const headIndex = match.index;
        const beforeContext = headContent.substring(Math.max(0, headIndex - 40), headIndex);
        
        const insertIndex = currentContent.indexOf(beforeContext);
        if (insertIndex !== -1) {
          currentContent = currentContent.slice(0, insertIndex + beforeContext.length) + match[0] + currentContent.slice(insertIndex + beforeContext.length);
        } else {
          const afterContext = headContent.substring(headIndex + match[0].length, Math.min(headContent.length, headIndex + match[0].length + 40));
          const insertIndexAfter = currentContent.indexOf(afterContext);
          if (insertIndexAfter !== -1) {
             currentContent = currentContent.slice(0, insertIndexAfter) + match[0] + currentContent.slice(insertIndexAfter);
          } else {
             console.log(`COULD NOT FIND INSERTION POINT FOR ${file}`);
          }
        }
      }
    }
    fs.writeFileSync(file, currentContent, 'utf8');
  }
});
