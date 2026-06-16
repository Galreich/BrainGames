import express, { Request, Response } from 'express';
import hebrewWords from '../data/hebrew-words';
import englishWords from '../data/english-words';

const router = express.Router();

// GET /api/words/hebrew?length=5
router.get('/hebrew', (req: Request, res: Response) => {
  const length = parseInt(req.query.length as string) || 5;

  if (![4, 5, 6].includes(length)) {
    return res.status(400).json({ error: 'Word_length_invalid' });
  }

  console.log(hebrewWords[length]);
  const wordList = hebrewWords[length];
  if (!wordList || wordList.length === 0) {
    return res.status(404).json({ error: 'No_words_found' });
  }

  const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
  console.log(`Selected Hebrew word: ${randomWord} (length: ${length})`);

  res.json({ word: randomWord, length, language: 'hebrew' });
});

// GET /api/words/english?length=5
router.get('/english', (req: Request, res: Response) => {
  const length = parseInt(req.query.length as string) || 5;

  if (![4, 5, 6].includes(length)) {
    return res.status(400).json({ error: 'Word_length_invalid' });
  }

  const wordList = englishWords[length];
  if (!wordList || wordList.length === 0) {
    return res.status(404).json({ error: 'No_words_found' });
  }

  const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
  console.log(`Selected English word: ${randomWord} (length: ${length})`);

  res.json({ word: randomWord, length, language: 'english' });
});

// GET /api/words/hebrew/validate?word=שלום
router.get('/hebrew/validate', (req: Request, res: Response) => {
  const word = req.query.word as string | undefined;
  if (!word) return res.status(400).json({ error: 'Word_required' });

  const length = word.length;
  const wordList = hebrewWords[length] || [];
  const isValid = wordList.includes(word);

  res.json({ word, isValid, length });
});

// GET /api/words/english/validate?word=happy
router.get('/english/validate', (req: Request, res: Response) => {
  const word = req.query.word as string | undefined;
  if (!word) return res.status(400).json({ error: 'Word_required' });

  const length = word.length;
  const wordList = englishWords[length] || [];
  const isValid = wordList
    .map((w) => w.toLowerCase())
    .includes(word.toLowerCase());

  res.json({ word, isValid, length });
});

export default router;
