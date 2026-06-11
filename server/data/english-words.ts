import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const englishWords: Record<number, string[]> = { 4: [], 5: [], 6: [] };

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
  const wordListPath = findFile(join('node_modules', 'word-list', 'words.txt'));
  if (!wordListPath) throw new Error('word-list words.txt not found');

  const wordArray = readFileSync(wordListPath, 'utf8').split('\n');

  for (const word of wordArray) {
    const trimmed = word.trim();
    if (trimmed.length >= 4 && trimmed.length <= 6) {
      englishWords[trimmed.length].push(trimmed);
    }
  }

  console.log(`English words loaded: 4-letter=${englishWords[4].length}, 5-letter=${englishWords[5].length}, 6-letter=${englishWords[6].length}`);
} catch (err) {
  console.error('Failed to load english word list:', err);
}

export default englishWords;
