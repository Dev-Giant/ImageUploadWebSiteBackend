import { Platform, Placement, Booking, RegionalPricing } from '../models/ad-placements.model.js';

// Get all platforms with availability stats
export const getPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.getAll();
    res.json(platforms);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
};

// Get placements for a specific platform
export const getPlatformPlacements = async (req, res) => {
  try {
    const { platform } = req.params;
    
    // Get platform by name
    const platformData = await Platform.getByName(platform);
    if (!platformData) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    
    const placements = await Placement.getByPlatform(platformData.id);
    res.json(placements);
  } catch (error) {
    console.error('Error fetching placements:', error);
    res.status(500).json({ error: 'Failed to fetch placements' });
  }
};

// Get regional pricing
export const getRegionalPricing = async (req, res) => {
  try {
    const { region, country, state } = req.query;
    
    if (region || country || state) {
      const pricing = await RegionalPricing.getByRegion(region, country, state);
      res.json(pricing);
    } else {
      const allPricing = await RegionalPricing.getAll();
      res.json(allPricing);
    }
  } catch (error) {
    console.error('Error fetching regional pricing:', error);
    res.status(500).json({ error: 'Failed to fetch regional pricing' });
  }
};

// Calculate pricing for an ad placement
export const calculatePricing = async (req, res) => {
  try {
    const { placement_id, region, start_date, end_date } = req.body;
    
    // Validate inputs
    if (!placement_id || !region || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get placement details
    const placement = await Placement.getById(placement_id);
    if (!placement) {
      return res.status(404).json({ error: 'Placement not found' });
    }
    
    // Get regional pricing multiplier
    const regionalPricing = await RegionalPricing.getByRegion(region, null, null);
    const priceMultiplier = regionalPricing.price_multiplier || 1.0;
    
    // Calculate duration
    const start = new Date(start_date);
    const end = new Date(end_date);
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const durationMonths = Math.ceil(durationDays / 30);
    
    // Calculate prices
    const basePrice = parseFloat(placement.base_price);
    const monthlyPrice = Math.round(basePrice * priceMultiplier * 100) / 100;
    const totalPrice = Math.round(monthlyPrice * durationMonths * 100) / 100;
    
    res.json({
      placement_id,
      base_price: basePrice,
      price_multiplier: priceMultiplier,
      monthly_price: monthlyPrice,
      duration_days: durationDays,
      duration_months: durationMonths,
      total_price: totalPrice,
      region,
      start_date,
      end_date
    });
  } catch (error) {
    console.error('Error calculating pricing:', error);
    res.status(500).json({ error: 'Failed to calculate pricing' });
  }
};

// Create a booking
export const createBooking = async (req, res) => {
  try {
    const advertiserId = req.user.id; // From auth middleware
    const bookingData = {
      advertiser_id: advertiserId,
      ...req.body
    };
    
    // Validate required fields
    const requiredFields = ['placement_id', 'campaign_name', 'region', 'start_date', 'end_date', 'monthly_price', 'total_price'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    
    // Check if placement is available
    const placement = await Placement.getById(bookingData.placement_id);
    if (!placement) {
      return res.status(404).json({ error: 'Placement not found' });
    }
    
    // Check for conflicting bookings
    const existingBookings = await Booking.getAll();
    const hasConflict = existingBookings.some(booking => {
      if (booking.placement_id !== bookingData.placement_id) return false;
      if (booking.status === 'cancelled' || booking.status === 'completed') return false;
      
      const existingStart = new Date(booking.start_date);
      const existingEnd = new Date(booking.end_date);
      const newStart = new Date(bookingData.start_date);
      const newEnd = new Date(bookingData.end_date);
      
      return (newStart <= existingEnd && newEnd >= existingStart);
    });
    
    if (hasConflict) {
      return res.status(409).json({ error: 'This placement is already booked for the selected dates' });
    }
    
    // Create booking
    const booking = await Booking.create(bookingData);
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// Get bookings (for advertiser or admin)
export const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // If admin, get all bookings; if advertiser, get only their bookings
    const advertiserId = userRole === 'admin' ? null : userId;
    const bookings = await Booking.getAll(advertiserId);
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Update booking status (admin only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Check if booking exists
    const booking = await Booking.getById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Update status
    await Booking.updateStatus(id, status);
    
    res.json({ message: 'Booking status updated successfully', status });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

// Get active ads for a platform (public endpoint)
export const getActiveAds = async (req, res) => {
  try {
    const { platform } = req.params;
    
    // Get platform by name
    const platformData = await Platform.getByName(platform);
    if (!platformData) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    
    const activeAds = await Booking.getActiveAds(platformData.id);
    res.json(activeAds);
  } catch (error) {
    console.error('Error fetching active ads:', error);
    res.status(500).json({ error: 'Failed to fetch active ads' });
  }
};

// Track impression
export const trackImpression = async (req, res) => {
  try {
    const { booking_id } = req.body;
    
    if (!booking_id) {
      return res.status(400).json({ error: 'Missing booking_id' });
    }
    
    await Booking.trackImpression(booking_id);
    res.json({ message: 'Impression tracked' });
  } catch (error) {
    console.error('Error tracking impression:', error);
    res.status(500).json({ error: 'Failed to track impression' });
  }
};

// Track click
export const trackClick = async (req, res) => {
  try {
    const { booking_id } = req.body;
    
    if (!booking_id) {
      return res.status(400).json({ error: 'Missing booking_id' });
    }
    
    await Booking.trackClick(booking_id);
    res.json({ message: 'Click tracked' });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
};
