// English word lists organized by word length
// All words are appropriate for elementary school students
import fs from 'fs';
import wordList from 'word-list';
const wordListPath = wordList.default || wordList;
const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');
const englishWords = {
  4: [],
  5: [],
  6: []
};
for (const word of wordArray) {
  const trimmed = word.trim();
  if (trimmed.length === 4) {
    englishWords[4].push(trimmed);
  }
  if (trimmed.length === 5) {
    englishWords[5].push(trimmed);
  }
  if (trimmed.length === 6) {
    englishWords[6].push(trimmed);
  }
}

export default englishWords;
