import { pool } from '../config/db.js';
import { formatDrawNumber } from '../utils/drawNumber.js';

// Get all draws (public)
export const getDraws = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM draws ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch draws' });
  }
};

// Get leaderboard for a draw
export const getLeaderboard = async (req, res) => {
  const { drawId } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT 
        u.id as user_id,
        u.email,
        COUNT(e.id) as entry_count,
        MAX(e.created_at) as last_entry
       FROM entries e
       JOIN users u ON e.user_id = u.id
       WHERE e.draw_id=$1
       GROUP BY u.id, u.email
       ORDER BY entry_count DESC, last_entry ASC
       LIMIT 100`,
      [drawId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

// Get user entries for a specific draw
export const getUserEntriesForDraw = async (req, res) => {
  const userId = req.user.id;
  const { drawId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM entries WHERE user_id=$1 AND draw_id=$2 ORDER BY created_at DESC',
      [userId, drawId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

export const generateEntry = async (req, res) => {
  const { draw_id } = req.body;
  const userId = req.user.id;
  try {
    const drawRes = await pool.query('SELECT * FROM draws WHERE id=$1', [draw_id]);
    const draw = drawRes.rows[0];
    if (!draw) return res.status(404).json({ error: 'Draw not found' });

    const next = draw.next_number + 1;
    const drawNumber = formatDrawNumber(draw.country, draw.city, draw.wave, next);

    await pool.query('UPDATE draws SET next_number=$1 WHERE id=$2', [next, draw.id]);
    await pool.query(
      'INSERT INTO entries (user_id, draw_id, entry_number) VALUES ($1, $2, $3)',
      [userId, draw.id, drawNumber]
    );

    res.json({ message: 'Entry created', drawNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create entry' });
  }
};
