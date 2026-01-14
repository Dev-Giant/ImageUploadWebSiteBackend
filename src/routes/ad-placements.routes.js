import express from 'express';
import * as adPlacementsController from '../controllers/ad-placements.controller.js';
import { verifyToken, auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/platforms/:platform/active-ads', adPlacementsController.getActiveAds);
router.post('/track/impression', adPlacementsController.trackImpression);
router.post('/track/click', adPlacementsController.trackClick);
router.get('/regional-pricing', adPlacementsController.getRegionalPricing); // Public for pricing transparency

// Platform routes (authentication required)
router.get('/platforms', verifyToken, adPlacementsController.getPlatforms);
router.get('/platforms/:platform/placements', verifyToken, adPlacementsController.getPlatformPlacements);

// Pricing calculation (authentication required)
router.post('/calculate-pricing', verifyToken, adPlacementsController.calculatePricing);

// Booking routes (authentication required)
router.post('/bookings', verifyToken, adPlacementsController.createBooking);
router.get('/bookings', verifyToken, adPlacementsController.getBookings);

// Admin-only routes
router.put('/bookings/:id/status', auth(['admin']), adPlacementsController.updateBookingStatus);

export default router;
