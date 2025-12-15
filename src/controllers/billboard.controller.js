import { pool } from '../config/db.js';

// Search billboards with filters
export const searchBillboards = async (req, res) => {
  try {
    const { 
      postal_codes, 
      sector, 
      country, 
      state, 
      age_filter, // 'new' (under 3 months), 'old' (over 3 months), 'all'
      active_only = true 
    } = req.query;

    let query = `
      SELECT 
        b.*,
        up.company as advertiser_company,
        up.first_name,
        up.last_name,
        EXTRACT(EPOCH FROM (NOW() - b.created_at)) / (24 * 3600) as age_days
      FROM billboards b
      LEFT JOIN users u ON b.advertiser_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    // Filter by active status
    if (active_only === 'true') {
      query += ` AND b.active = true`;
    }

    // Filter by postal codes
    if (postal_codes) {
      const codes = postal_codes.split(',').map(code => code.trim());
      paramCount++;
      query += ` AND b.postal_code = ANY($${paramCount})`;
      params.push(codes);
    }

    // Filter by age (under/over 3 months = 90 days)
    if (age_filter === 'new') {
      query += ` AND b.created_at >= NOW() - INTERVAL '90 days'`;
    } else if (age_filter === 'old') {
      query += ` AND b.created_at < NOW() - INTERVAL '90 days'`;
    }

    // Filter by sector (company name for now, could be enhanced with a sectors table)
    if (sector) {
      paramCount++;
      query += ` AND LOWER(up.company) LIKE LOWER($${paramCount})`;
      params.push(`%${sector}%`);
    }

    // Filter by country/state (from user profiles)
    if (country) {
      paramCount++;
      query += ` AND LOWER(up.country) = LOWER($${paramCount})`;
      params.push(country);
    }

    if (state) {
      paramCount++;
      query += ` AND LOWER(up.state) = LOWER($${paramCount})`;
      params.push(state);
    }

    query += ` ORDER BY b.created_at DESC`;

    const { rows } = await pool.query(query, params);
    
    // Group results by age for easier frontend handling
    const newBillboards = rows.filter(b => b.age_days <= 90);
    const oldBillboards = rows.filter(b => b.age_days > 90);

    res.json({
      total: rows.length,
      new: newBillboards,
      old: oldBillboards,
      all: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to search billboards' });
  }
};

// Search by multiple postal codes (up to 4 as per requirements)
export const getBillboardsByPostalCodes = async (req, res) => {
  try {
    const { postal_codes } = req.body;
    
    if (!postal_codes || !Array.isArray(postal_codes) || postal_codes.length === 0) {
      return res.status(400).json({ error: 'postal_codes array is required' });
    }

    if (postal_codes.length > 4) {
      return res.status(400).json({ error: 'Maximum 4 postal codes allowed' });
    }

    const { rows } = await pool.query(
      `SELECT 
        b.*,
        up.company as advertiser_company,
        up.first_name,
        up.last_name,
        EXTRACT(EPOCH FROM (NOW() - b.created_at)) / (24 * 3600) as age_days
      FROM billboards b
      LEFT JOIN users u ON b.advertiser_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE b.postal_code = ANY($1) AND b.active = true
      ORDER BY b.created_at DESC`,
      [postal_codes]
    );

    // Group by postal code and age
    const result = {};
    postal_codes.forEach(code => {
      const billboards = rows.filter(b => b.postal_code === code);
      result[code] = {
        total: billboards.length,
        new: billboards.filter(b => b.age_days <= 90),
        old: billboards.filter(b => b.age_days > 90)
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to search billboards by postal codes' });
  }
};

// Search by advertiser sector
export const getBillboardsBySector = async (req, res) => {
  try {
    const { sector } = req.params;
    
    const { rows } = await pool.query(
      `SELECT 
        b.*,
        up.company as advertiser_company,
        up.first_name,
        up.last_name,
        EXTRACT(EPOCH FROM (NOW() - b.created_at)) / (24 * 3600) as age_days
      FROM billboards b
      LEFT JOIN users u ON b.advertiser_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE LOWER(up.company) LIKE LOWER($1) AND b.active = true
      ORDER BY b.created_at DESC`,
      [`%${sector}%`]
    );

    const newBillboards = rows.filter(b => b.age_days <= 90);
    const oldBillboards = rows.filter(b => b.age_days > 90);

    res.json({
      sector,
      total: rows.length,
      new: newBillboards,
      old: oldBillboards,
      all: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to search billboards by sector' });
  }
};

// Get all billboards (for general browsing)
export const getAllBillboards = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        b.*,
        up.company as advertiser_company,
        up.first_name,
        up.last_name,
        EXTRACT(EPOCH FROM (NOW() - b.created_at)) / (24 * 3600) as age_days
      FROM billboards b
      LEFT JOIN users u ON b.advertiser_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE b.active = true
      ORDER BY b.created_at DESC`
    );

    const newBillboards = rows.filter(b => b.age_days <= 90);
    const oldBillboards = rows.filter(b => b.age_days > 90);

    res.json({
      total: rows.length,
      new: newBillboards,
      old: oldBillboards,
      all: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch billboards' });
  }
};