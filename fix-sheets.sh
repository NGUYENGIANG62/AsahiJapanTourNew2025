#!/bin/bash

# Fix the Google Sheets range format issue
echo "Fixing Google Sheets range format..."

# Use sed to replace all instances of the problematic code
sed -i 's/const safeSheetName = `${sheetName}!A:Z`;/const safeSheetName = getSafeSheetName(sheetName);/g' server/googleSheetsService.ts

echo "Fixes applied! The application should now be able to connect to Google Sheets properly."