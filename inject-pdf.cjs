const fs = require('fs');
const { execSync } = require('child_process');

function fixFile(file) {
  let headContent;
  try {
    headContent = execSync(`git show HEAD:"${file}"`).toString();
  } catch(e) { return; }
  
  let currentContent = fs.readFileSync(file, 'utf8');

  // Extract the PDF button
  const pdfRegex = /<button[^>]*handleExportPDF[^>]*>[\s\S]*?<\/button>/g;
  const match = pdfRegex.exec(headContent);
  if (match) {
    const pdfButtonCode = match[0];
    
    // We want to insert it in currentContent where it was.
    // In these files, it's typically inside a div with display: flex, next to the Search bar.
    // Let's look for `<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>`
    // Or just look for `handlePrint` or `handleExportCSV` in HEAD to find the exact container.
    // A simpler way: The button was right before `{/* 📄 Excel Button` or something.
    // Let's just find the `onClick={handleExportPDF}` function definition in currentContent and put the button inside the actions div.
    
    const insertionPointMatch = /<button[^>]*onClick=\{[^}]*\}\s+style=\{\{\s*padding:\s*'0\.5rem\s+1rem'[^>]*>\s*<Download.*Excel/i;
    // Wait, the excel button is GONE.
    // Let's find the container that held it. It's usually the one with `gap: '0.75rem'`.
    
    // Actually, in currentContent, there is probably an empty spot where the buttons were.
    // Let's do a smart patch: find 40 characters BEFORE the PDF button in HEAD that STILL EXIST in currentContent.
    const headIndex = match.index;
    let beforeContext = headContent.substring(Math.max(0, headIndex - 40), headIndex);
    
    let insertIndex = currentContent.indexOf(beforeContext);
    
    // If we can't find it directly (because the previous button was also deleted), let's look further back
    if (insertIndex === -1) {
      // Look for the start of the action buttons container
      const containerMatch = /<div style=\{\{\s*display:\s*'flex',\s*alignItems:\s*'center',\s*gap:\s*'0\.75rem',\s*flexWrap:\s*'wrap'\s*\}\}>/.exec(currentContent);
      if (containerMatch) {
         insertIndex = containerMatch.index + containerMatch[0].length;
         currentContent = currentContent.slice(0, insertIndex) + '\n          ' + pdfButtonCode + currentContent.slice(insertIndex);
         fs.writeFileSync(file, currentContent, 'utf8');
         console.log('Restored PDF button in ' + file);
         return;
      }
    } else {
       currentContent = currentContent.slice(0, insertIndex + beforeContext.length) + pdfButtonCode + currentContent.slice(insertIndex + beforeContext.length);
       fs.writeFileSync(file, currentContent, 'utf8');
       console.log('Restored PDF button via context in ' + file);
       return;
    }
    console.log('Could not find insertion point in ' + file);
  }
}

fixFile('src/modules/Accountant/components/accounts/FinancialReportsTab.jsx');
fixFile('src/modules/Accountant/components/accounts/SupervisorWalletFundsTab.jsx');
