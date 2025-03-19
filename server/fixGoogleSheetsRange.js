// This script will modify the googleSheetsService.ts file to fix range parsing errors
const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.resolve(__dirname, 'googleSheetsService.ts');

// Read the file content
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences of A:Z range with simple sheet name
content = content.replace(/const safeSheetName = `\${sheetName}!A:Z`;/g, 'const safeSheetName = sheetName;');

// Write the changes back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('Sheet range format fixed!');