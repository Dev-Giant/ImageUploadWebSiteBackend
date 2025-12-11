import express from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { getUserUploads } from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Upload route (already has verifyToken in uploadImage array)
router.post('/', ...uploadImage);

// Get user's uploads (requires auth)
router.get('/user', auth(['user', 'admin', 'advertiser']), getUserUploads);

export default router;
