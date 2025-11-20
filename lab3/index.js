const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'notes.txt');
const outputFile = path.join(__dirname, 'output_notes.txt');
const headerLine = 'Парний варіант — виконано студентом Скальський Володимир';

const fileContent = fs.readFileSync(inputFile, 'utf8');
const processedContent = headerLine + '\n' + fileContent;

fs.writeFileSync(outputFile, processedContent, 'utf8');

