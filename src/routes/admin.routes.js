import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getUsers,
  updateUserRole,
  deleteUser,
  getUploads,
  deleteUpload,
  getDraws,
  createDraw,
  updateDraw,
  deleteDraw
} from '../controllers/admin.controller.js';

const router = express.Router();

// Only admins can access
router.use(auth(['admin']));

// Users
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Uploads
router.get('/uploads', getUploads);
router.delete('/uploads/:id', deleteUpload);

// Draws
router.get('/draws', getDraws);
router.post('/draws', createDraw);
router.put('/draws/:id', updateDraw);
router.delete('/draws/:id', deleteDraw);

export default router;
