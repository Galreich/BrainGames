import { readFileSync } from 'fs';
import { join } from 'path';

const dicPath = join(__dirname, '..', 'node_modules', 'dictionary-he', 'index.dic');
const dicStr = readFileSync(dicPath, 'utf-8');

const hebrewWords: Record<number, string[]> = { 4: [], 5: [], 6: [] };

for (const line of dicStr.split('\n').slice(1)) {
  const word = line.split('/')[0].trim();
  if (!/^[\u0590-\u05FF]+$/.test(word)) continue;
  if (word.length >= 4 && word.length <= 6) {
    hebrewWords[word.length].push(word);
  }
}

hebrewWords[5].push('להיות');

export default hebrewWords;
