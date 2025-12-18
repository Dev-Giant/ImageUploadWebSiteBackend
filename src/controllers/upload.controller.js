import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { pool } from '../config/db.js';
import { createSweepstakeEntry } from '../utils/entryHelper.js';
import { verifyToken } from '../middleware/auth.js';

// ---- Upload folder setup ----
const uploadDir = 'src/uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ---- Multer setup ----
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---- Upload function ----
export const uploadImage = [
  verifyToken,
  upload.single('image'),

  async (req, res) => {
    try {
      const { platform, country, city, wave, tag_count } = req.body;
      const userId = req.user.id;

      // Limit uploads per day (15 max)
      const limit = process.env.UPLOAD_LIMIT || 15;
      const { rows: uploadsToday } = await pool.query(
        "SELECT COUNT(*) FROM uploads WHERE user_id=$1 AND created_at::date = CURRENT_DATE",
        [userId]
      );
      if (parseInt(uploadsToday[0].count) >= limit) {
        return res.status(400).json({ error: `Daily upload limit of ${limit} reached.` });
      }

      // Save compressed image
      const filename = `${Date.now()}-${req.file.originalname}`;
      const filepath = path.join(uploadDir, filename);
      await sharp(req.file.buffer).resize(1024).jpeg({ quality: 80 }).toFile(filepath);

      // Record upload (tag_count defaults to 0 if not provided)
      const tagCount = parseInt(tag_count) || 0;
      await pool.query(
        'INSERT INTO uploads (user_id, filename, platform, tag_count) VALUES ($1, $2, $3, $4)',
        [userId, filename, platform, tagCount]
      );

      // Create sweepstake entry
      const entryNumber = await createSweepstakeEntry(userId, { country, city, wave });

      res.json({
        message: 'Upload successful',
        entryNumber,
        filename,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Upload failed' });
    }
  },
];
