import fs from 'fs';

const lines = fs.readFileSync('server.ts', 'utf-8').split('\n');
const stack = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let col = 0; col < line.length; col++) {
    const ch = line[col];
    if (ch === '{') stack.push({ line: i + 1, text: line.trim() });
    if (ch === '}') {
      if (stack.length > 0) stack.pop();
    }
  }
}

console.log('UNCLOSED BRACES STACK AT END OF FILE:');
console.log(stack);
