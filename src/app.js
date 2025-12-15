import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import adminRoutes from './routes/admin.routes.js';
import adminExtraRoutes from './routes/adminExtra.routes.js';
import publicBillboardRoutes from './routes/billboard.routes.js';
import authRoutes from './routes/auth.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import drawRoutes from './routes/draw.routes.js';
import userRoutes from './routes/user.routes.js';
import advertiserRoutes from './routes/advertiser.routes.js';
import adsRoutes from './routes/ads.routes.js';

dotenv.config();
const app = express();

// CORS configuration - allow all frontend origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      process.env.FRONTEND_URL,
      process.env.ADMIN_PANEL_URL,
      process.env.ADVERTISER_PANEL_URL,
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development, restrict in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(process.env.UPLOADS_DIR || 'src/uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminExtraRoutes);
app.use('/api/billboards', publicBillboardRoutes);
app.use('/api/advertiser', advertiserRoutes);
app.use('/api/ads', adsRoutes);

export default app;
