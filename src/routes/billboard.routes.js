import express from 'express';
import { searchBillboards } from '../controllers/billboard.controller.js';
const router = express.Router();

router.post('/search', searchBillboards);

export default router;
