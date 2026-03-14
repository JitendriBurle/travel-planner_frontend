import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import babel from '@babel/core';

const files = globSync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', 'dist/**', 'detype-all.js']
});

files.forEach(file => {
  const isTsx = file.endsWith('.tsx');
  const code = fs.readFileSync(file, 'utf-8');
  
  const result = babel.transformSync(code, {
    filename: file,
    presets: [
      ['@babel/preset-typescript', { isTSX: isTsx, allExtensions: true }]
    ],
    retainLines: true,
  });

  if (result && result.code) {
    const ext = isTsx ? '.jsx' : '.js';
    const newPath = file.substring(0, file.lastIndexOf('.')) + ext;
    fs.writeFileSync(newPath, result.code);
    fs.unlinkSync(file);
    console.log(`Converted ${file} to ${newPath}`);
  }
});
