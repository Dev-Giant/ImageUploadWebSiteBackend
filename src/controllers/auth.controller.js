import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

export const register = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    // Default to 'user' role if not specified, or if role is provided (for admin/advertiser registration)
    const userRole = role || 'user';
    await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
      [email, hashed, userRole]
    );
    res.json({ message: 'User registered' });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};
