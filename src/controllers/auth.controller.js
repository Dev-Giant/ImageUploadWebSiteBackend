import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const ALLOWED_ROLES = ['user', 'advertiser', 'ancillary_advertiser', 'admin'];

export const register = async (req, res) => {
  const {
    email,
    password,
    role,
    // Name fields (different forms use different names)
    firstName,
    lastName,
    username,
    // Personal info
    dateOfBirth,
    gender,
    // Contact info
    phoneCountryCode,
    phoneNumber,
    mobileNumber,
    areaCode,
    // Address fields
    postalCode,
    country,
    state,
    stateRegion,
    city,
    street,
    // Professional info
    position,
    company,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const userRole = ALLOWED_ROLES.includes(role) ? role : 'user';

    await pool.query('BEGIN');

    const userResult = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashed, userRole]
    );

    const newUser = userResult.rows[0];

    // Save profile data for ALL roles
    await pool.query(
      `INSERT INTO user_profiles (
        user_id, first_name, last_name, username, date_of_birth, gender,
        phone_country_code, phone_number, mobile_number, area_code,
        postal_code, country, state, state_region, city, street,
        position, company
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (user_id) DO UPDATE SET
        first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name),
        username = COALESCE(EXCLUDED.username, user_profiles.username),
        date_of_birth = COALESCE(EXCLUDED.date_of_birth, user_profiles.date_of_birth),
        gender = COALESCE(EXCLUDED.gender, user_profiles.gender),
        phone_country_code = COALESCE(EXCLUDED.phone_country_code, user_profiles.phone_country_code),
        phone_number = COALESCE(EXCLUDED.phone_number, user_profiles.phone_number),
        mobile_number = COALESCE(EXCLUDED.mobile_number, user_profiles.mobile_number),
        area_code = COALESCE(EXCLUDED.area_code, user_profiles.area_code),
        postal_code = COALESCE(EXCLUDED.postal_code, user_profiles.postal_code),
        country = COALESCE(EXCLUDED.country, user_profiles.country),
        state = COALESCE(EXCLUDED.state, user_profiles.state),
        state_region = COALESCE(EXCLUDED.state_region, user_profiles.state_region),
        city = COALESCE(EXCLUDED.city, user_profiles.city),
        street = COALESCE(EXCLUDED.street, user_profiles.street),
        position = COALESCE(EXCLUDED.position, user_profiles.position),
        company = COALESCE(EXCLUDED.company, user_profiles.company),
        updated_at = NOW()`,
      [
        newUser.id,
        firstName || null,
        lastName || null,
        username || null,
        dateOfBirth || null,
        gender || null,
        phoneCountryCode || areaCode || null, // Use areaCode as fallback
        phoneNumber || mobileNumber || null, // Use mobileNumber as fallback
        mobileNumber || null,
        areaCode || null,
        postalCode || null,
        country || null,
        state || stateRegion || null, // Use stateRegion as fallback
        stateRegion || null,
        city || null,
        street || null,
        position || null,
        company || null,
      ]
    );

    await pool.query('COMMIT');

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'User registered', token, user: newUser });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    if (err.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
};

export const login = async (req, res) => {
  const { email, password, role: requestedRole } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    if (requestedRole && requestedRole !== user.role) {
      return res.status(403).json({ error: `User is not registered as ${requestedRole}` });
    }

    // Get profile data for all roles
    const profileResult = await pool.query(
      `SELECT first_name, last_name, username, date_of_birth, gender,
              phone_country_code, phone_number, mobile_number, area_code,
              postal_code, country, state, state_region, city, street,
              position, company
       FROM user_profiles WHERE user_id=$1`,
      [user.id]
    );
    const userProfile = profileResult.rows[0] || null;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, profile: userProfile } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};
