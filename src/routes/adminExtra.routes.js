import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getPages,
  updatePage,
  getAds,
  createAd,
  updateAd,
  deleteAd
} from '../controllers/adminExtra.controller.js';

const router = express.Router();
router.use(auth(['admin']));

// Static pages
router.get('/pages', getPages);
router.put('/pages/:slug', updatePage);

// Ads
router.get('/ads', getAds);
router.post('/ads', createAd);
router.put('/ads/:id', updateAd);
router.delete('/ads/:id', deleteAd);

export default router;
