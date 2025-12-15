# Backend-Frontend Integration Guide

## Overview
This guide will help you integrate the Node.js/Express backend with the React frontend for the Twigga web shop.

## Prerequisites
- Node.js 18+ installed
- MySQL/MariaDB database server
- Git (for version control)

## Step 1: Database Setup

### 1.1 Create Database
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create the database
CREATE DATABASE webshop;
USE webshop;
```

### 1.2 Import Schema
```bash
# From the project root directory
mysql -u root -p webshop < database/schema.sql
```

### 1.3 Verify Database Setup
```sql
-- Check tables were created
SHOW TABLES;

-- Verify sample products were inserted
SELECT COUNT(*) FROM products;
```

## Step 2: Backend Configuration

### 2.1 Install Dependencies
```bash
# Navigate to project root
cd /path/to/Web-Shop

# Install backend dependencies
npm install
```

### 2.2 Environment Configuration
The backend `.env` file is already configured at `backend/.env`:
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
DB_HOST=localhost
DB_USER=root
DB_PASS=mysql+12
DB_NAME=webshop
```

**Important**: Update the database password (`DB_PASS`) to match your MySQL setup.

### 2.3 Start Backend Server
```bash
# From project root
cd backend
node index.js
```

You should see: "Server running on port 5000"

## Step 3: Frontend Configuration

### 3.1 Install Dependencies
```bash
# Navigate to frontend directory
cd frontend
npm install
```

### 3.2 Environment Configuration (Optional)
Create `frontend/.env` to customize API URL:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3.3 Start Frontend Development Server
```bash
# From frontend directory
npm start
```

The React app will start on http://localhost:3000

## Step 4: Integration Features

### 4.1 What's Integrated
✅ **API Service Layer**: Complete API client in `frontend/src/services/api.js`
✅ **Authentication System**: JWT-based auth with React hooks
✅ **Product Management**: API-driven product catalog with fallback
✅ **Database Schema**: Compatible with frontend data structure
✅ **Error Handling**: Graceful fallbacks when API is unavailable

### 4.2 What Works Now
- **Product Display**: Products load from API (falls back to hardcoded data)
- **Authentication UI**: Login/register forms are connected to auth hooks
- **Shopping Cart**: Local state management (can be extended to API)
- **Database Integration**: Products stored in MySQL with JSON color arrays

### 4.3 Testing the Integration

1. **Test Backend API**:
   ```bash
   # Test products endpoint
   curl http://localhost:5000/api/products
   
   # Test server status
   curl http://localhost:5000/
   ```

2. **Test Frontend**:
   - Open http://localhost:3000
   - Browse products (should load from API if backend is running)
   - Try authentication (currently demo mode)

## Step 5: Current Limitations & Next Steps

### 5.1 Still Needs Implementation
- [ ] **Real Authentication**: Backend auth endpoints need proper validation
- [ ] **Order Processing**: Connect checkout to backend order creation
- [ ] **User Management**: Profile management and address handling
- [ ] **Admin Features**: Product management through API
- [ ] **Cart Persistence**: Store cart in backend instead of local state

### 5.2 Recommended Next Steps

1. **Implement Real Authentication**:
   ```javascript
   // Update login function to use real form data
   const handleLogin = async (formData) => {
     try {
       await login(formData);
       setTab('home');
     } catch (error) {
       // Handle login error
     }
   };
   ```

2. **Connect Checkout to Orders API**:
   ```javascript
   // In checkout process
   const handleOrderSubmission = async (orderData) => {
     try {
       const order = await ordersAPI.create(orderData);
       setTab('confirmation');
     } catch (error) {
       // Handle order error
     }
   };
   ```

3. **Add Loading States**:
   ```javascript
   // Show loading indicators
   {productsLoading && <div>Loading products...</div>}
   {authLoading && <div>Authenticating...</div>}
   ```

## Step 6: Development Workflow

### 6.1 Running Both Servers
```bash
# Terminal 1 - Backend
cd backend && node index.js

# Terminal 2 - Frontend  
cd frontend && npm start
```

### 6.2 API Development
- Backend API endpoints are in `backend/routes/`
- Frontend API calls are in `frontend/src/services/api.js`
- Database queries use `mysql2/promise` in backend

### 6.3 Database Changes
- Update `database/schema.sql` for schema changes
- Restart backend server after database changes
- Use MySQL Workbench or command line for database management

## Step 7: Production Considerations

### 7.1 Environment Variables
```bash
# Production .env
NODE_ENV=production
JWT_SECRET=very-long-random-secret-key-for-production
DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASS=your-secure-password
```

### 7.2 Build Process
```bash
# Build frontend for production
cd frontend && npm run build

# Serve built files through Express
# Add static file serving to backend/index.js
app.use(express.static('frontend/build'));
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check MySQL is running: `sudo systemctl status mysql`
   - Verify credentials in `backend/.env`
   - Ensure database `webshop` exists

2. **CORS Issues**:
   - Backend already has CORS enabled
   - Check API_BASE_URL in frontend

3. **Products Not Loading**:
   - Check browser console for errors
   - Verify backend is running on port 5000
   - App falls back to hardcoded products if API fails

4. **Authentication Not Working**:
   - Currently in demo mode
   - Check JWT_SECRET is set in backend/.env
   - Implement proper form handling for real auth

### Debug Commands
```bash
# Check backend logs
cd backend && node index.js

# Check database content
mysql -u root -p webshop -e "SELECT * FROM products LIMIT 5;"

# Test API endpoints
curl -X GET http://localhost:5000/api/products
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

## Success Indicators

✅ Backend server starts without errors
✅ Frontend loads and shows products
✅ Database contains sample products
✅ API endpoints respond correctly
✅ Authentication hooks are connected
✅ Error handling works gracefully

Your integration is complete when you can see products loading from the database and the authentication system is properly wired up!
