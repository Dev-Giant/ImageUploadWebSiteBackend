import { pool } from '../config/db.js';

// ---- USERS ----

// List all users
export const getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, email, role, created_at FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    await pool.query('UPDATE users SET role=$1 WHERE id=$2', [role, id]);
    res.json({ message: 'User role updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ---- UPLOADS ----

// List all uploads (both user and advertiser)
export const getUploads = async (req, res) => {
  try {
    const { upload_type } = req.query; // Optional filter: 'user' or 'advertiser'
    
    let query = `
      SELECT 
        u.id, 
        u.filename, 
        u.created_at, 
        u.user_id, 
        u.upload_type,
        u.platform,
        us.email AS user_email,
        us.role AS user_role
      FROM uploads u 
      JOIN users us ON u.user_id=us.id
    `;
    
    const params = [];
    if (upload_type) {
      query += ' WHERE u.upload_type=$1';
      params.push(upload_type);
    }
    
    query += ' ORDER BY u.created_at DESC';
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
};

// Delete upload
export const deleteUpload = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM uploads WHERE id=$1', [id]);
    res.json({ message: 'Upload deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete upload' });
  }
};

// ---- DRAWS ----

// List all draws
export const getDraws = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM draws ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch draws' });
  }
};

// Create draw
export const createDraw = async (req, res) => {
  const { name, country, city, wave } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO draws (name, country, city, wave, next_number) VALUES ($1, $2, $3, $4, 0) RETURNING *',
      [name, country, city, wave]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create draw' });
  }
};

// Update draw
export const updateDraw = async (req, res) => {
  const { id } = req.params;
  const { name, country, city, wave, next_number } = req.body;
  try {
    await pool.query(
      'UPDATE draws SET name=$1, country=$2, city=$3, wave=$4, next_number=$5 WHERE id=$6',
      [name, country, city, wave, next_number, id]
    );
    res.json({ message: 'Draw updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update draw' });
  }
};

// Delete draw
export const deleteDraw = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM draws WHERE id=$1', [id]);
    res.json({ message: 'Draw deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete draw' });
  }
};
