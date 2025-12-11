# Database Setup Guide

This guide will help you set up PostgreSQL database for the Gotta Scan Them All application.

## Prerequisites

1. **PostgreSQL** - You need PostgreSQL installed on your system
   - Download from: https://www.postgresql.org/download/
   - Or use Docker (recommended for easy setup)

## Option 1: Using Docker (Recommended - Easiest)

### Step 1: Install Docker
If you don't have Docker, download it from: https://www.docker.com/products/docker-desktop

### Step 2: Run PostgreSQL Container
```bash
docker run --name gotta-scan-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=gotta_scan_db \
  -p 5432:5432 \
  -d postgres:15
```

This will:
- Create a PostgreSQL container named `gotta-scan-postgres`
- Set password to `postgres` (change in production!)
- Create database `gotta_scan_db`
- Expose port 5432

### Step 3: Initialize Database
```bash
# Copy the .env.example to .env
cp .env.example .env

# Edit .env and set these values:
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=gotta_scan_db

# Run the initialization script
npm run init-db
```

## Option 2: Local PostgreSQL Installation

### Step 1: Install PostgreSQL
1. Download PostgreSQL from https://www.postgresql.org/download/
2. Install it (remember the password you set for the `postgres` user)
3. Make sure PostgreSQL service is running

### Step 2: Create Database
Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
CREATE DATABASE gotta_scan_db;
```

Or using command line:
```bash
psql -U postgres
CREATE DATABASE gotta_scan_db;
\q
```

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your PostgreSQL credentials:
   ```
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=gotta_scan_db
   ```

### Step 4: Initialize Database Tables
Run the initialization script:
```bash
npm run init-db
```

Or manually run the SQL file:
```bash
psql -U postgres -d gotta_scan_db -f init_db.sql
```

## Option 3: Using pgAdmin (GUI Tool)

1. **Install pgAdmin**: Download from https://www.pgadmin.org/download/

2. **Connect to PostgreSQL Server**:
   - Open pgAdmin
   - Right-click "Servers" → "Create" → "Server"
   - General tab: Name it "Local PostgreSQL"
   - Connection tab:
     - Host: localhost
     - Port: 5432
     - Username: postgres
     - Password: your password

3. **Create Database**:
   - Right-click "Databases" → "Create" → "Database"
   - Name: `gotta_scan_db`
   - Click "Save"

4. **Run SQL Script**:
   - Right-click `gotta_scan_db` → "Query Tool"
   - Open `init_db.sql` file
   - Click "Execute" (F5)

5. **Configure .env file** (same as Option 2, Step 3)

## Initialize Database Script

I'll create a script to help you initialize the database. Run:

```bash
npm run init-db
```

## Verify Database Connection

After setup, start your backend server:
```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL
🚀 Server running on port 4000
```

If you see connection errors, check:
1. PostgreSQL is running
2. Database credentials in `.env` are correct
3. Database `gotta_scan_db` exists
4. Port 5432 is not blocked by firewall

## Troubleshooting

### Error: "password authentication failed"
- Check your DB_PASSWORD in `.env` matches your PostgreSQL password
- For Docker: password is `postgres` by default

### Error: "database does not exist"
- Make sure you created the database `gotta_scan_db`
- Check DB_NAME in `.env` matches

### Error: "connection refused"
- Check PostgreSQL service is running
- For Docker: `docker ps` to see if container is running
- Check DB_HOST and DB_PORT in `.env`

### Error: "relation does not exist"
- Run the `init_db.sql` script to create tables
- Or run `npm run init-db`

## Production Setup

For production, make sure to:
1. Use strong passwords
2. Change JWT_SECRET to a secure random string
3. Use environment-specific database
4. Enable SSL connections
5. Set up database backups
6. Use connection pooling (already configured)

## Quick Start Commands

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 2. Start PostgreSQL (Docker)
docker run --name gotta-scan-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=gotta_scan_db -p 5432:5432 -d postgres:15

# 3. Initialize database
npm run init-db

# 4. Start server
npm run dev
```

