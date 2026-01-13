import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getBillboards,
  createBillboard,
  updateBillboard,
  getAnalytics,
  getInvoices,
  getAccount,
  updateAccount,
} from '../controllers/advertiser.controller.js';
import {
  uploadAdvertiserMedia,
  getAdvertiserMedia,
  deleteAdvertiserMedia,
} from '../controllers/advertiser-media.controller.js';

const router = express.Router();

// All routes require advertiser authentication
router.use(auth(['advertiser', 'ancillary_advertiser', 'admin']));

// Campaigns
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);
router.put('/campaigns/:id', updateCampaign);
router.delete('/campaigns/:id', deleteCampaign);

// Billboards
router.get('/billboards', getBillboards);
router.post('/billboards', createBillboard);
router.put('/billboards/:id', updateBillboard);

// Media Uploads
router.post('/media/upload', ...uploadAdvertiserMedia);
router.get('/media', getAdvertiserMedia);
router.delete('/media/:id', deleteAdvertiserMedia);

// Analytics
router.get('/analytics', getAnalytics);

// Billing
router.get('/invoices', getInvoices);

// Account
router.get('/account', getAccount);
router.put('/account', updateAccount);

export default router;

