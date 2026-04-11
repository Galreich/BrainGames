import express from 'express';
import { hebrewWords, englishWords } from '../data';

const router = express.Router();

// GET /api/words/hebrew?length=5
router.get('/hebrew', (req, res) => {
  const length = parseInt(req.query.length) || 5;

  if (![4, 5, 6].includes(length)) {
    return res.status(400).json({ error: 'Word_length_invalid' });
  }

  const wordList = hebrewWords[length];
  if (!wordList || wordList.length === 0) {
    return res.status(404).json({ error: 'No_words_found' });
  }

  // Return a random word
  const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
  console.log(`Selected Hebrew word: ${randomWord} (length: ${length})`);

  res.json({
    word: randomWord,
    length,
    language: 'hebrew',
  });
});

// GET /api/words/english?length=5
router.get('/english', (req, res) => {
  const length = parseInt(req.query.length) || 5;

  if (![4, 5, 6].includes(length)) {
    return res.status(400).json({ error: 'Word_length_invalid' });
  }

  const wordList = englishWords[length];
  if (!wordList || wordList.length === 0) {
    return res.status(404).json({ error: 'No_words_found' });
  }

  // Return a random word
  const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
  console.log(`Selected English word: ${randomWord} (length: ${length})`);

  res.json({
    word: randomWord,
    length,
    language: 'english',
  });
});

// GET /api/words/hebrew/validate?word=שלום
router.get('/hebrew/validate', (req, res) => {
  const { word } = req.query;
  if (!word) return res.status(400).json({ error: 'Word_required' });

  const length = word.length;
  const wordList = hebrewWords[length] || [];
  const isValid = wordList.includes(word);

  res.json({ word, isValid, length });
});

// GET /api/words/english/validate?word=happy
router.get('/english/validate', (req, res) => {
  const { word } = req.query;
  if (!word) return res.status(400).json({ error: 'Word_required' });

  const length = word.length;
  const wordList = englishWords[length] || [];
  const isValid = wordList.map((w) => w.toLowerCase()).includes(word.toLowerCase());

  res.json({ word, isValid, length });
});

export default router;
