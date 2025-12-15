import { pool } from '../config/db.js';

// Campaigns
export const getCampaigns = async (req, res) => {
  const advertiserId = req.user.id;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM campaigns WHERE advertiser_id=$1 ORDER BY created_at DESC',
      [advertiserId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

export const createCampaign = async (req, res) => {
  const advertiserId = req.user.id;
  const { title, region, budget, start_date, end_date, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO campaigns (advertiser_id, title, region, budget, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [advertiserId, title, region, budget, start_date, end_date, status || 'pending']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
};

export const updateCampaign = async (req, res) => {
  const { id } = req.params;
  const advertiserId = req.user.id;
  const { title, region, budget, start_date, end_date, status } = req.body;
  try {
    await pool.query(
      `UPDATE campaigns SET title=$1, region=$2, budget=$3, start_date=$4, end_date=$5, status=$6
       WHERE id=$7 AND advertiser_id=$8`,
      [title, region, budget, start_date, end_date, status, id, advertiserId]
    );
    res.json({ message: 'Campaign updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
};

export const deleteCampaign = async (req, res) => {
  const { id } = req.params;
  const advertiserId = req.user.id;
  try {
    await pool.query('DELETE FROM campaigns WHERE id=$1 AND advertiser_id=$2', [id, advertiserId]);
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
};

// Billboards
export const getBillboards = async (req, res) => {
  const advertiserId = req.user.id;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM billboards WHERE advertiser_id=$1 ORDER BY created_at DESC',
      [advertiserId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch billboards' });
  }
};

export const createBillboard = async (req, res) => {
  const advertiserId = req.user.id;
  const { advertiser_name, postal_code, active } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO billboards (advertiser_id, advertiser_name, postal_code, active) VALUES ($1, $2, $3, $4) RETURNING *',
      [advertiserId, advertiser_name, postal_code, active ?? true]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create billboard' });
  }
};

export const updateBillboard = async (req, res) => {
  const { id } = req.params;
  const advertiserId = req.user.id;
  const { advertiser_name, postal_code, active } = req.body;
  try {
    await pool.query(
      'UPDATE billboards SET advertiser_name=$1, postal_code=$2, active=$3 WHERE id=$4 AND advertiser_id=$5',
      [advertiser_name, postal_code, active, id, advertiserId]
    );
    res.json({ message: 'Billboard updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update billboard' });
  }
};

// Analytics
export const getAnalytics = async (req, res) => {
  const advertiserId = req.user.id;
  const { campaignId } = req.query;
  try {
    let query, params;
    if (campaignId) {
      query = `
        SELECT 
          COUNT(DISTINCT u.id) as total_uploads,
          COUNT(DISTINCT u.user_id) as unique_users,
          COUNT(DISTINCT CASE WHEN u.platform = $2 THEN u.id END) as platform_uploads
        FROM uploads u
        JOIN billboards b ON u.billboard_id = b.id
        WHERE b.advertiser_id = $1 AND b.campaign_id = $2
      `;
      params = [advertiserId, campaignId];
    } else {
      query = `
        SELECT 
          COUNT(DISTINCT u.id) as total_uploads,
          COUNT(DISTINCT u.user_id) as unique_users
        FROM uploads u
        JOIN billboards b ON u.billboard_id = b.id
        WHERE b.advertiser_id = $1
      `;
      params = [advertiserId];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows[0] || { total_uploads: 0, unique_users: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Billing
export const getInvoices = async (req, res) => {
  const advertiserId = req.user.id;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM invoices WHERE advertiser_id=$1 ORDER BY created_at DESC',
      [advertiserId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Account
export const getAccount = async (req, res) => {
  const advertiserId = req.user.id;
  try {
    const { rows } = await pool.query(
      `SELECT 
        u.id, u.email, u.role, u.created_at,
        up.first_name, up.last_name, up.position, up.company,
        up.postal_code, up.country, up.state, up.city,
        up.phone_country_code, up.phone_number
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE u.id=$1`,
      [advertiserId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
};

export const updateAccount = async (req, res) => {
  const advertiserId = req.user.id;
  const {
    email,
    firstName,
    lastName,
    position,
    company,
    postalCode,
    country,
    state,
    city,
    phoneCountryCode,
    phoneNumber,
  } = req.body;
  try {
    await pool.query('BEGIN');

    if (email) {
      await pool.query('UPDATE users SET email=$1 WHERE id=$2', [email, advertiserId]);
    }

    await pool.query(
      `INSERT INTO user_profiles (
        user_id, first_name, last_name, position, company, postal_code,
        country, state, city, phone_country_code, phone_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        position = EXCLUDED.position,
        company = EXCLUDED.company,
        postal_code = EXCLUDED.postal_code,
        country = EXCLUDED.country,
        state = EXCLUDED.state,
        city = EXCLUDED.city,
        phone_country_code = EXCLUDED.phone_country_code,
        phone_number = EXCLUDED.phone_number,
        updated_at = NOW()`,
      [
        advertiserId,
        firstName || null,
        lastName || null,
        position || null,
        company || null,
        postalCode || null,
        country || null,
        state || null,
        city || null,
        phoneCountryCode || null,
        phoneNumber || null,
      ]
    );

    await pool.query('COMMIT');
    res.json({ message: 'Account updated' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update account' });
  }
};

