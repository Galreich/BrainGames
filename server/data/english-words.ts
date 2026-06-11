import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const englishWords: Record<number, string[]> = { 4: [], 5: [], 6: [] };

try {
  const wordListPath = join(dirname(require.resolve('word-list/package.json')), 'words.txt');
  const wordArray = readFileSync(wordListPath, 'utf8').split('\n');

  for (const word of wordArray) {
    const trimmed = word.trim();
    if (trimmed.length >= 4 && trimmed.length <= 6) {
      englishWords[trimmed.length].push(trimmed);
    }
  }
} catch (err) {
  console.error('Failed to load english word list:', err);
}

export default englishWords;
