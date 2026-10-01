const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('React.use')) {
        let newContent = content.replace(/React\.use(Effect|State|Memo|Callback|Context|Ref)/g, 'use$1');
        
        // Find which ones we need to import
        const hooksToImport = [];
        ['useEffect', 'useState', 'useMemo', 'useCallback', 'useContext', 'useRef'].forEach(hook => {
          if (newContent.includes(`${hook}(`)) {
            // Check if it's already imported
            const importRegex = new RegExp(`import\\s+.*?\\b${hook}\\b.*?from\\s+['"]react['"]`);
            if (!importRegex.test(newContent)) {
              hooksToImport.push(hook);
            }
          }
        });

        if (hooksToImport.length > 0) {
          // Find the react import line
          const reactImportMatch = newContent.match(/import\s+(?:React\s*,?\s*)?(?:\{[^}]*\})?\s*from\s+['"]react['"];?/);
          if (reactImportMatch) {
            let importStr = reactImportMatch[0];
            const hasBraces = importStr.includes('{');
            if (hasBraces) {
              importStr = importStr.replace('{', `{ ${hooksToImport.join(', ')}, `);
            } else {
              importStr = importStr.replace('from', `, { ${hooksToImport.join(', ')} } from`);
            }
            newContent = newContent.replace(reactImportMatch[0], importStr);
          } else {
            // no react import? Add one
            newContent = `import { ${hooksToImport.join(', ')} } from 'react';\n` + newContent;
          }
        }
        
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
