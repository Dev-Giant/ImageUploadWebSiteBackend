import express from 'express';
import {
  searchBillboards,
  getBillboardsByPostalCodes,
  getBillboardsBySector,
  getAllBillboards
} from '../controllers/billboard.controller.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/search', searchBillboards);
router.post('/search/postal-codes', getBillboardsByPostalCodes);
router.get('/search/sector/:sector', getBillboardsBySector);
router.get('/all', getAllBillboards);

export default router;