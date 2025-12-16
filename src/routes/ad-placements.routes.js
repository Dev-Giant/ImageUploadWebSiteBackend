import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getAdPlacements,
  getAllPlatforms,
  getActiveAds,
  getRegionalPricing,
  calculatePricing,
  createAdBooking,
  getAdvertiserBookings,
  updateBookingStatus
} from '../controllers/ad-placements.controller.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/platforms', getAllPlatforms);
router.get('/platforms/:platform/placements', getAdPlacements);
router.get('/platforms/:platform/active-ads', getActiveAds);
router.get('/regional-pricing', getRegionalPricing);
router.post('/calculate-pricing', calculatePricing);

// Advertiser routes (require advertiser authentication)
router.post('/bookings', auth(['advertiser', 'ancillary_advertiser']), createAdBooking);
router.get('/bookings', auth(['advertiser', 'ancillary_advertiser']), getAdvertiserBookings);

// Admin routes (require admin authentication)
router.put('/bookings/:id/status', auth(['admin']), updateBookingStatus);

export default router;