import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const hebrewWords: Record<number, string[]> = { 4: [], 5: [], 6: [] };

function findFile(relativePath: string): string | null {
  const candidates = [
    join(__dirname, '..', relativePath),
    resolve(relativePath),
    join(process.cwd(), relativePath),
    join(process.cwd(), 'server', relativePath),
  ];
  return candidates.find((p) => existsSync(p)) || null;
}

try {
  const dicPath = findFile(join('node_modules', 'dictionary-he', 'index.dic'));
  if (!dicPath) throw new Error('dictionary-he index.dic not found');

  const dicStr = readFileSync(dicPath, 'utf-8');

  for (const line of dicStr.split('\n').slice(1)) {
    const word = line.split('/')[0].trim();
    if (!/^[\u0590-\u05FF]+$/.test(word)) continue;
    if (word.length >= 4 && word.length <= 6) {
      hebrewWords[word.length].push(word);
    }
  }

  hebrewWords[5].push('להיות');
  console.log(`Hebrew words loaded: 4-letter=${hebrewWords[4].length}, 5-letter=${hebrewWords[5].length}, 6-letter=${hebrewWords[6].length}`);
} catch (err) {
  console.error('Failed to load hebrew word list:', err);
}

export default hebrewWords;
