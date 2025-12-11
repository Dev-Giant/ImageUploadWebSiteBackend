import { pool } from '../config/db.js';

export const searchBillboards = async (req, res) => {
  const { postalCodes } = req.body; // array of 4 postal codes
  try {
    const { rows } = await pool.query(
      `SELECT *, 
       CASE WHEN created_at > NOW() - INTERVAL '3 months' THEN 'new' ELSE 'old' END AS age_group
       FROM billboards
       WHERE postal_code = ANY($1::text[])`,
      [postalCodes]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
};
