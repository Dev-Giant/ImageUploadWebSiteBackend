import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { pool } from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

// Upload folder setup
const uploadDir = 'src/uploads/advertiser-media';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, and MP4 are allowed.'), false);
    }
  }
});

// Upload advertiser media
export const uploadAdvertiserMedia = [
  verifyToken,
  upload.single('file'),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const advertiserId = req.user.id;
      const { tag, description } = req.body;

      // Verify user is an advertiser
      const userCheck = await pool.query('SELECT role FROM users WHERE id=$1', [advertiserId]);
      if (userCheck.rows.length === 0 || !['advertiser', 'admin'].includes(userCheck.rows[0].role)) {
        return res.status(403).json({ error: 'Only advertisers can upload media' });
      }

      // Save compressed image (for images) or original file (for videos)
      const timestamp = Date.now();
      const originalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `adv_${timestamp}_${originalName}`;
      const filepath = path.join(uploadDir, filename);

      if (req.file.mimetype.startsWith('image/')) {
        // Compress and resize images
        await sharp(req.file.buffer)
          .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(filepath);
      } else {
        // Save video as-is
        fs.writeFileSync(filepath, req.file.buffer);
      }

      // Get file size
      const stats = fs.statSync(filepath);
      const sizeKB = Math.round(stats.size / 1024);

      // Record upload in database with upload_type = 'advertiser'
      const result = await pool.query(
        `INSERT INTO uploads (user_id, filename, platform, tag_count, upload_type) 
         VALUES ($1, $2, $3, $4, 'advertiser') 
         RETURNING id, filename, created_at`,
        [advertiserId, filename, tag || 'General', 0]
      );

      const uploadRecord = result.rows[0];

      res.json({
        message: 'Media uploaded successfully',
        id: uploadRecord.id,
        filename: uploadRecord.filename,
        url: `http://localhost:4000/uploads/advertiser-media/${filename}`,
        size: sizeKB,
        format: req.file.mimetype,
        tag: tag || 'General',
        createdAt: uploadRecord.created_at,
      });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: err.message || 'Upload failed' });
    }
  },
];

// Get advertiser's media uploads
export const getAdvertiserMedia = async (req, res) => {
  try {
    const advertiserId = req.user.id;

    const { rows } = await pool.query(
      `SELECT 
        id, 
        filename, 
        platform as tag,
        created_at,
        upload_type
      FROM uploads 
      WHERE user_id=$1 AND upload_type='advertiser'
      ORDER BY created_at DESC`,
      [advertiserId]
    );

    // Add full URLs
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
    const media = rows.map(row => ({
      id: row.id,
      name: row.filename,
      url: `${baseUrl}/uploads/advertiser-media/${row.filename}`,
      tag: row.tag || 'General',
      createdAt: row.created_at,
      format: row.filename.match(/\.(jpg|jpeg|png|gif|mp4)$/i)?.[1] || 'unknown',
    }));

    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
};

// Delete advertiser media
export const deleteAdvertiserMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const advertiserId = req.user.id;

    // Get the upload record
    const { rows } = await pool.query(
      'SELECT filename FROM uploads WHERE id=$1 AND user_id=$2 AND upload_type=$3',
      [id, advertiserId, 'advertiser']
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const filename = rows[0].filename;
    const filepath = path.join(uploadDir, filename);

    // Delete file from filesystem
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete record from database
    await pool.query('DELETE FROM uploads WHERE id=$1', [id]);

    res.json({ message: 'Media deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete media' });
  }
};

// Approve media (for admin use)
export const approveAdvertiserMedia = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    const adminCheck = await pool.query('SELECT role FROM users WHERE id=$1', [req.user.id]);
    if (adminCheck.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can approve media' });
    }

    // For now, we'll just mark it as approved by updating a status field
    // If you want to add a status column later, you can do:
    // await pool.query('UPDATE uploads SET status=$1 WHERE id=$2', ['approved', id]);
    
    res.json({ message: 'Media approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve media' });
  }
};

