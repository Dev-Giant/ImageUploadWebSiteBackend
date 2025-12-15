import { pool } from '../config/db.js';

// Get user profile
export const getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(
      `SELECT 
        u.id, u.email, u.role, u.created_at,
        up.first_name, up.last_name, up.username, up.date_of_birth, up.gender,
        up.phone_country_code, up.phone_number, up.mobile_number, up.area_code,
        up.postal_code, up.country, up.state, up.state_region, up.city, up.street,
        up.position, up.company
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE u.id=$1`,
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Get user entries
export const getUserEntries = async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(
      `SELECT e.id, e.entry_number, e.created_at, d.name as draw_name, d.country, d.city, d.wave
       FROM entries e
       JOIN draws d ON e.draw_id = d.id
       WHERE e.user_id=$1
       ORDER BY e.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

// Get user position in leaderboard
export const getUserPosition = async (req, res) => {
  const userId = req.user.id;
  try {
    // Get total entries for user
    const entryCount = await pool.query(
      'SELECT COUNT(*) as count FROM entries WHERE user_id=$1',
      [userId]
    );
    
    // Get user's rank
    const rankResult = await pool.query(
      `SELECT COUNT(*) + 1 as rank
       FROM (
         SELECT user_id, COUNT(*) as entry_count
         FROM entries
         GROUP BY user_id
         HAVING COUNT(*) > (
           SELECT COUNT(*) FROM entries WHERE user_id=$1
         )
       ) as ranked_users`,
      [userId]
    );

    res.json({
      totalEntries: parseInt(entryCount.rows[0].count),
      rank: parseInt(rankResult.rows[0].rank),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch position' });
  }
};

// Get user uploads
export const getUserUploads = async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(
      'SELECT id, filename, platform, created_at FROM uploads WHERE user_id=$1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
};

