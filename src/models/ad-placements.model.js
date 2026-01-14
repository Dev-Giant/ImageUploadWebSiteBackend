import { pool } from '../config/db.js';

// Platforms Model
export const Platform = {
  async getAll() {
    const result = await pool.query(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM placements WHERE platform_id = p.id) as total_placements,
        (SELECT COUNT(*) FROM placements WHERE platform_id = p.id AND availability_status = 'available') as available_placements,
        (SELECT COUNT(*) FROM placements WHERE platform_id = p.id AND availability_status = 'booked') as booked_placements
      FROM platforms p
      ORDER BY p.display_name
    `);
    return result.rows;
  },

  async getByName(name) {
    const result = await pool.query('SELECT * FROM platforms WHERE name = $1', [name]);
    return result.rows[0];
  },

  async create(platformData) {
    const { name, display_name } = platformData;
    const result = await pool.query(
      'INSERT INTO platforms (name, display_name) VALUES ($1, $2) RETURNING *',
      [name, display_name]
    );
    return result.rows[0];
  }
};

// Placements Model
export const Placement = {
  async getByPlatform(platformId) {
    const result = await pool.query(`
      SELECT 
        pl.*,
        p.name as platform_name,
        p.display_name as platform_display_name,
        b.id as booking_id,
        b.campaign_name as booked_campaign,
        b.start_date as booked_start,
        b.end_date as booked_end
      FROM placements pl
      JOIN platforms p ON pl.platform_id = p.id
      LEFT JOIN bookings b ON pl.id = b.placement_id 
        AND b.status IN ('approved', 'active') 
        AND CURRENT_DATE BETWEEN b.start_date AND b.end_date
      WHERE pl.platform_id = $1
      ORDER BY pl.placement_type, pl.position_name
    `, [platformId]);
    
    return result.rows.map(row => ({
      ...row,
      availability_status: row.booking_id ? 'booked' : 'available'
    }));
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM placements WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(placementData) {
    const { platform_id, placement_type, position_name, width, height, base_price, description } = placementData;
    const result = await pool.query(
      `INSERT INTO placements (platform_id, placement_type, position_name, width, height, base_price, description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [platform_id, placement_type, position_name, width, height, base_price, description]
    );
    return result.rows[0];
  },

  async updateAvailability(id, status) {
    await pool.query('UPDATE placements SET availability_status = $1 WHERE id = $2', [status, id]);
  }
};

// Bookings Model
export const Booking = {
  async getAll(advertiserId = null) {
    let query = `
      SELECT 
        b.*,
        pl.placement_type,
        pl.position_name,
        pl.width,
        pl.height,
        p.name as platform_name,
        p.display_name as platform_display_name,
        u.email as advertiser_email
      FROM bookings b
      JOIN placements pl ON b.placement_id = pl.id
      JOIN platforms p ON pl.platform_id = p.id
      JOIN users u ON b.advertiser_id = u.id
    `;
    
    const params = [];
    if (advertiserId) {
      query += ' WHERE b.advertiser_id = $1';
      params.push(advertiserId);
    }
    
    query += ' ORDER BY b.created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(`
      SELECT 
        b.*,
        pl.placement_type,
        pl.position_name,
        pl.width,
        pl.height,
        p.name as platform_name,
        p.display_name as platform_display_name
      FROM bookings b
      JOIN placements pl ON b.placement_id = pl.id
      JOIN platforms p ON pl.platform_id = p.id
      WHERE b.id = $1
    `, [id]);
    return result.rows[0];
  },

  async create(bookingData) {
    const {
      advertiser_id,
      placement_id,
      campaign_name,
      ad_image_url,
      ad_link_url,
      region,
      postal_code,
      start_date,
      end_date,
      monthly_price,
      total_price
    } = bookingData;

    const result = await pool.query(
      `INSERT INTO bookings 
       (advertiser_id, placement_id, campaign_name, ad_image_url, ad_link_url, 
        region, postal_code, start_date, end_date, monthly_price, total_price, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending') RETURNING *`,
      [advertiser_id, placement_id, campaign_name, ad_image_url, ad_link_url, 
       region, postal_code, start_date, end_date, monthly_price, total_price]
    );

    return result.rows[0];
  },

  async updateStatus(id, status) {
    await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, id]);
    
    // If approved or active, mark placement as booked
    if (status === 'approved' || status === 'active') {
      const booking = await this.getById(id);
      await Placement.updateAvailability(booking.placement_id, 'booked');
    }
    
    // If completed or cancelled, mark placement as available
    if (status === 'completed' || status === 'cancelled') {
      const booking = await this.getById(id);
      await Placement.updateAvailability(booking.placement_id, 'available');
    }
  },

  async getActiveAds(platformId) {
    const result = await pool.query(`
      SELECT 
        b.*,
        pl.placement_type,
        pl.position_name,
        pl.width,
        pl.height,
        p.name as platform_name
      FROM bookings b
      JOIN placements pl ON b.placement_id = pl.id
      JOIN platforms p ON pl.platform_id = p.id
      WHERE p.id = $1
        AND b.status = 'active'
        AND CURRENT_DATE BETWEEN b.start_date AND b.end_date
      ORDER BY pl.placement_type, pl.position_name
    `, [platformId]);
    return result.rows;
  },

  async trackImpression(bookingId) {
    await pool.query('UPDATE bookings SET impressions = impressions + 1 WHERE id = $1', [bookingId]);
  },

  async trackClick(bookingId) {
    await pool.query('UPDATE bookings SET clicks = clicks + 1 WHERE id = $1', [bookingId]);
  }
};

// Regional Pricing Model
export const RegionalPricing = {
  async getAll() {
    const result = await pool.query('SELECT * FROM regional_pricing ORDER BY country, state, region_name');
    return result.rows;
  },

  async getByRegion(region, country, state) {
    let query = 'SELECT * FROM regional_pricing WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (region) {
      query += ` AND region_name ILIKE $${paramCount}`;
      params.push(`%${region}%`);
      paramCount++;
    }
    if (country) {
      query += ` AND country = $${paramCount}`;
      params.push(country);
      paramCount++;
    }
    if (state) {
      query += ` AND state = $${paramCount}`;
      params.push(state);
      paramCount++;
    }
    
    const result = await pool.query(query, params);
    return result.rows[0] || { price_multiplier: 1.0 }; // Default multiplier if not found
  },

  async create(pricingData) {
    const { region_name, country, state, price_multiplier, description } = pricingData;
    const result = await pool.query(
      'INSERT INTO regional_pricing (region_name, country, state, price_multiplier, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [region_name, country, state, price_multiplier, description]
    );
    return result.rows[0];
  }
};
