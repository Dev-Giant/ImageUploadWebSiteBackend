import { pool } from '../config/db.js';

//
// STATIC PAGES
//

export const getPages = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT slug, title, content, updated_at FROM static_pages');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

export const updatePage = async (req, res) => {
  const { slug } = req.params;
  const { title, content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO static_pages (slug, title, content, updated_at) VALUES ($1,$2,$3,NOW()) ON CONFLICT (slug) DO UPDATE SET title=$2, content=$3, updated_at=NOW() RETURNING *',
      [slug, title, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update page' });
  }
};

//
// ADS
//

export const getAds = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ads ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
};

export const createAd = async (req, res) => {
  const { title, image_path, link, placement, region, active } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ads (title, image_path, link, placement, region, active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, image_path, link, placement, region, active ?? true]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create ad' });
  }
};

export const updateAd = async (req, res) => {
  const { id } = req.params;
  const { title, image_path, link, placement, region, active } = req.body;
  try {
    await pool.query(
      'UPDATE ads SET title=$1, image_path=$2, link=$3, placement=$4, region=$5, active=$6 WHERE id=$7',
      [title, image_path, link, placement, region, active, id]
    );
    res.json({ message: 'Ad updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update ad' });
  }
};

export const deleteAd = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM ads WHERE id=$1', [id]);
    res.json({ message: 'Ad deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete ad' });
  }
};
