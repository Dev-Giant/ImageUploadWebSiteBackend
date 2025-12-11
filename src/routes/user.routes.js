import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getProfile,
  getUserEntries,
  getUserPosition,
  getUserUploads,
} from '../controllers/user.controller.js';

const router = express.Router();

// All routes require authentication
router.use(auth(['user', 'admin', 'advertiser']));

router.get('/profile', getProfile);
router.get('/entries', getUserEntries);
router.get('/position', getUserPosition);

export default router;

