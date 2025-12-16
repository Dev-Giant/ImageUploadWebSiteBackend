import { pool } from '../config/db.js';

// Get all available ad placements for a specific platform
export const getAdPlacements = async (req, res) => {
  try {
    const { platform } = req.params;
    
    const { rows } = await pool.query(`
      SELECT 
        ap.id,
        ap.position_name,
        ap.position_order,
        ap.base_price,
        apt.name as placement_type,
        apt.description,
        apt.width,
        apt.height,
        sp.display_name as platform_name,
        CASE 
          WHEN ab.id IS NOT NULL THEN 'booked'
          ELSE 'available'
        END as availability_status,
        ab.start_date as booked_start,
        ab.end_date as booked_end,
        ab.campaign_name as booked_campaign
      FROM ad_placements ap
      JOIN ad_placement_types apt ON ap.placement_type_id = apt.id
      JOIN social_platforms sp ON ap.platform_id = sp.id
      LEFT JOIN ad_bookings ab ON ap.id = ab.placement_id 
        AND ab.status IN ('approved', 'active') 
        AND ab.start_date <= CURRENT_DATE 
        AND ab.end_date >= CURRENT_DATE
      WHERE sp.name = $1 AND ap.active = true
      ORDER BY ap.position_order
    `, [platform]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ad placements' });
  }
};

// Get all platforms with their ad placement counts
export const getAllPlatforms = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        sp.id,
        sp.name,
        sp.display_name,
        COUNT(ap.id) as total_placements,
        COUNT(CASE WHEN ab.id IS NULL THEN 1 END) as available_placements,
        COUNT(CASE WHEN ab.id IS NOT NULL THEN 1 END) as booked_placements
      FROM social_platforms sp
      LEFT JOIN ad_placements ap ON sp.id = ap.platform_id AND ap.active = true
      LEFT JOIN ad_bookings ab ON ap.id = ab.placement_id 
        AND ab.status IN ('approved', 'active') 
        AND ab.start_date <= CURRENT_DATE 
        AND ab.end_date >= CURRENT_DATE
      WHERE sp.active = true
      GROUP BY sp.id, sp.name, sp.display_name
      ORDER BY sp.display_name
    `);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
};

// Get regional pricing for a specific region
export const getRegionalPricing = async (req, res) => {
  try {
    const { region, country, state, all } = req.query;
    
    // If 'all' parameter is provided, return all regional pricing data
    if (all === 'true') {
      const { rows } = await pool.query(`
        SELECT 
          id,
          region_name,
          country,
          state_province,
          price_multiplier,
          population_density,
          created_at
        FROM regional_pricing
        ORDER BY country, state_province, region_name
      `);
      return res.json(rows);
    }
    
    let query = `
      SELECT 
        region_name,
        country,
        state_province,
        price_multiplier,
        population_density
      FROM regional_pricing
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (region) {
      paramCount++;
      query += ` AND LOWER(region_name) LIKE LOWER($${paramCount})`;
      params.push(`%${region}%`);
    }
    
    if (country) {
      paramCount++;
      query += ` AND LOWER(country) = LOWER($${paramCount})`;
      params.push(country);
    }
    
    if (state) {
      paramCount++;
      query += ` AND LOWER(state_province) LIKE LOWER($${paramCount})`;
      params.push(`%${state}%`);
    }
    
    query += ` ORDER BY price_multiplier DESC`;
    
    const { rows } = await pool.query(query, params);
    
    // If no specific region found, return default pricing
    if (rows.length === 0) {
      res.json([{
        region_name: 'Default Region',
        country: country || 'Unknown',
        state_province: state || null,
        price_multiplier: 1.00,
        population_density: 'medium'
      }]);
    } else {
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch regional pricing' });
  }
};

// Calculate pricing for an ad placement
export const calculatePricing = async (req, res) => {
  try {
    const { placement_id, region, start_date, end_date } = req.body;
    
    if (!placement_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get placement base price
    const placementResult = await pool.query(`
      SELECT 
        ap.base_price,
        apt.name as placement_type,
        sp.display_name as platform_name
      FROM ad_placements ap
      JOIN ad_placement_types apt ON ap.placement_type_id = apt.id
      JOIN social_platforms sp ON ap.platform_id = sp.id
      WHERE ap.id = $1
    `, [placement_id]);
    
    if (placementResult.rows.length === 0) {
      return res.status(404).json({ error: 'Placement not found' });
    }
    
    const placement = placementResult.rows[0];
    
    // Get regional pricing multiplier
    let priceMultiplier = 1.00;
    if (region) {
      const pricingResult = await pool.query(`
        SELECT price_multiplier
        FROM regional_pricing
        WHERE LOWER(region_name) LIKE LOWER($1)
        ORDER BY price_multiplier DESC
        LIMIT 1
      `, [`%${region}%`]);
      
      if (pricingResult.rows.length > 0) {
        priceMultiplier = parseFloat(pricingResult.rows[0].price_multiplier);
      }
    }
    
    // Calculate duration in months
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.max(1, Math.ceil(diffDays / 30)); // Minimum 1 month
    
    const basePrice = parseFloat(placement.base_price);
    const monthlyPrice = basePrice * priceMultiplier;
    const totalPrice = monthlyPrice * months;
    
    res.json({
      placement_type: placement.placement_type,
      platform_name: placement.platform_name,
      base_price: basePrice,
      price_multiplier: priceMultiplier,
      monthly_price: monthlyPrice,
      duration_months: months,
      duration_days: diffDays,
      total_price: totalPrice,
      region: region || 'Default Region'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate pricing' });
  }
};

// Create an ad booking
export const createAdBooking = async (req, res) => {
  const advertiserId = req.user.id;
  
  try {
    const {
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
    } = req.body;
    
    if (!placement_id || !campaign_name || !start_date || !end_date || !region) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if placement is available for the requested dates
    const conflictCheck = await pool.query(`
      SELECT id FROM ad_bookings
      WHERE placement_id = $1
      AND status IN ('approved', 'active')
      AND (
        (start_date <= $2 AND end_date >= $2) OR
        (start_date <= $3 AND end_date >= $3) OR
        (start_date >= $2 AND end_date <= $3)
      )
    `, [placement_id, start_date, end_date]);
    
    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Placement is not available for the selected dates' });
    }
    
    const result = await pool.query(`
      INSERT INTO ad_bookings (
        advertiser_id, placement_id, campaign_name, ad_image_url, ad_link_url,
        region, postal_code, start_date, end_date, monthly_price, total_price
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      advertiserId, placement_id, campaign_name, ad_image_url, ad_link_url,
      region, postal_code, start_date, end_date, monthly_price, total_price
    ]);
    
    res.json({
      message: 'Ad booking created successfully',
      booking: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create ad booking' });
  }
};

// Get advertiser's ad bookings
export const getAdvertiserBookings = async (req, res) => {
  const advertiserId = req.user.id;
  
  try {
    const { rows } = await pool.query(`
      SELECT 
        ab.*,
        ap.position_name,
        apt.name as placement_type,
        apt.width,
        apt.height,
        sp.display_name as platform_name
      FROM ad_bookings ab
      JOIN ad_placements ap ON ab.placement_id = ap.id
      JOIN ad_placement_types apt ON ap.placement_type_id = apt.id
      JOIN social_platforms sp ON ap.platform_id = sp.id
      WHERE ab.advertiser_id = $1
      ORDER BY ab.created_at DESC
    `, [advertiserId]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Get active ads for a specific platform (for displaying on social media pages)
export const getActiveAds = async (req, res) => {
  try {
    const { platform } = req.params;
    
    const { rows } = await pool.query(`
      SELECT 
        ap.id,
        ap.position_name,
        ap.position_order,
        apt.name as placement_type,
        apt.width,
        apt.height,
        ab.campaign_name,
        ab.ad_image_url,
        ab.ad_link_url,
        ab.start_date,
        ab.end_date,
        ab.impressions,
        ab.clicks
      FROM ad_placements ap
      JOIN ad_placement_types apt ON ap.placement_type_id = apt.id
      JOIN social_platforms sp ON ap.platform_id = sp.id
      JOIN ad_bookings ab ON ap.id = ab.placement_id
      WHERE sp.name = $1 
        AND ap.active = true
        AND ab.status = 'active'
        AND ab.start_date <= CURRENT_DATE 
        AND ab.end_date >= CURRENT_DATE
      ORDER BY ap.position_order
    `, [platform]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch active ads' });
  }
};

// Update ad booking status (for admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'approved', 'active', 'paused', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    await pool.query(`
      UPDATE ad_bookings 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `, [status, id]);
    
    res.json({ message: 'Booking status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};