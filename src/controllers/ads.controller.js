import { pool } from '../config/db.js';

// Get ads for a specific platform and placement
export const getAdsForPlatform = async (req, res) => {
  const { platform } = req.params;
  const { placement } = req.query;
  try {
    let query = 'SELECT * FROM ads WHERE active=true';
    const params = [];
    
    if (platform) {
      query += ' AND platform=$1';
      params.push(platform);
    }
    
    if (placement) {
      query += ` AND placement=$${params.length + 1}`;
      params.push(placement);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 10';
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
};

