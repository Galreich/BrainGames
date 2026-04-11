import { readFileSync } from 'fs';
import wordListPath from 'word-list';

const wordArray = readFileSync(wordListPath, 'utf8').split('\n');

const englishWords: Record<number, string[]> = { 4: [], 5: [], 6: [] };

for (const word of wordArray) {
  const trimmed = word.trim();
  if (trimmed.length >= 4 && trimmed.length <= 6) {
    englishWords[trimmed.length].push(trimmed);
  }
}

export default englishWords;
