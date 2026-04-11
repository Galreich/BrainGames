import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dicPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'dictionary-he',
  'index.dic',
);
const dicStr = fs.readFileSync(dicPath, 'utf-8');

const hebrewWords = { 4: [], 5: [], 6: [] };

for (const line of dicStr.split('\n').slice(1)) {
  const word = line.split('/')[0].trim();
  if (!/^[\u0590-\u05FF]+$/.test(word)) continue;
  if (word.length >= 4 && word.length <= 6) {
    hebrewWords[word.length].push(word);
  }
}

hebrewWords[5].push('להיות');

export default hebrewWords;
