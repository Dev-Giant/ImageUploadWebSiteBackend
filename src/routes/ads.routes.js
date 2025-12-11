import express from 'express';
import { getAdsForPlatform } from '../controllers/ads.controller.js';

const router = express.Router();

// Public route to get ads for platform pages
router.get('/platform/:platform', getAdsForPlatform);

export default router;

