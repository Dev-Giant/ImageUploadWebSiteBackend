import express from 'express';
import { 
  getDraws, 
  getLeaderboard, 
  getUserEntriesForDraw,
  generateEntry 
} from '../controllers/draw.controller.js';
import { getUserEntries } from '../controllers/user.controller.js';
import { getUserPosition } from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getDraws);
router.get('/:drawId/leaderboard', getLeaderboard);

// Protected routes
router.get('/entries', auth(['user', 'admin']), getUserEntries);
router.get('/position', auth(['user', 'admin']), getUserPosition);
router.get('/:drawId/entries', auth(['user', 'admin']), getUserEntriesForDraw);
router.post('/entry', auth(['user']), generateEntry);

export default router;
