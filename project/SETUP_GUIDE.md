# Sarvin Electronics - Complete Setup Guide

Welcome to Sarvin Electronics! This comprehensive guide will help you set up and run the complete e-commerce platform.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Email Configuration](#email-configuration)
- [Payment Gateway Setup](#payment-gateway-setup)
- [AWS S3 Setup](#aws-s3-setup)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Admin Access](#admin-access)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager
- **Git** for version control

## 📁 Project Structure

```
sarvin-electronics/
├── server/              # Backend API (Node.js + Express)
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middlewares/    # Auth & other middlewares
│   ├── emailService/   # Email templates & service
│   └── utils/          # Utility functions
├── sarvin/             # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React contexts
│   │   ├── api/        # API integration
│   │   └── store/      # Redux store
│   └── public/         # Static assets
└── README.md
```

## 🔐 Environment Configuration

### Backend Configuration (server/.env)

1. Copy the example file:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Edit `server/.env` with your actual credentials:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sarvin-electronics

# JWT Configuration (change this to a random secure string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# Admin Credentials
ADMIN_EMAIL=admin@sarvinelectronics.com
ADMIN_PASSWORD=Admin@123456

# Application Configuration
APP_NAME=Sarvin Electronics
FRONTEND_URL=http://localhost:5173

# Gmail OAuth2 Configuration (see Email Configuration section)
GMAIL_USER=your-gmail@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground

# Razorpay Configuration (see Payment Gateway section)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# AWS S3 Configuration (see AWS S3 section)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=sarvin-electronics-images
AWS_CLOUDFRONT_DOMAIN=https://your-cloudfront-domain.cloudfront.net
```

### Frontend Configuration (sarvin/.env)

1. Copy the example file:
   ```bash
   cd sarvin
   cp .env.example .env
   ```

2. Edit `sarvin/.env`:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:5000

# Frontend URL
VITE_FRONTEND_URL=http://localhost:5173

# Razorpay Public Key (same as RAZORPAY_KEY_ID in backend)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

## 💾 Database Setup

### 1. Install MongoDB

**Windows:**
- Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- Run the installer
- Start MongoDB service from Services

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. Verify MongoDB Installation

```bash
mongosh
# You should see MongoDB shell prompt
```

### 3. Create Database (Automatic)

The application will automatically create the database and collections on first run. The admin user will also be created automatically using the credentials in `.env`.

## 📧 Email Configuration

The application uses Gmail OAuth2 for sending emails. Follow these steps:

### 1. Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API for your project
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen if prompted
6. Select "Web application" as application type
7. Add authorized redirect URI: `https://developers.google.com/oauthplayground`
8. Copy the Client ID and Client Secret

### 2. Generate Refresh Token

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click settings (⚙️) → Check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In Step 1, select "Gmail API v1" → "https://mail.google.com/"
5. Click "Authorize APIs" and login with your Gmail account
6. In Step 2, click "Exchange authorization code for tokens"
7. Copy the Refresh Token

### 3. Update .env File

Add the credentials to `server/.env`:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

## 💳 Payment Gateway Setup

### 1. Create Razorpay Account

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Complete KYC verification (for live mode)
3. Navigate to Settings → API Keys
4. Generate Test/Live Keys

### 2. Configure Razorpay

Add keys to both `.env` files:

**Backend (server/.env):**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

**Frontend (sarvin/.env):**
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

⚠️ **Important:** Keep the Key Secret secure and never commit it to version control!

## ☁️ AWS S3 Setup

### 1. Create AWS Account

Sign up at [AWS Console](https://aws.amazon.com/)

### 2. Create S3 Bucket

1. Go to S3 service
2. Click "Create bucket"
3. Enter bucket name: `sarvin-electronics-images`
4. Select region: `ap-south-1` (or your preferred region)
5. **Block all public access:** Uncheck (we'll use CloudFront)
6. Enable versioning (optional but recommended)
7. Create bucket

### 3. Configure CORS

1. Go to your bucket → Permissions → CORS
2. Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

### 4. Create IAM User

1. Go to IAM → Users → Add User
2. Username: `sarvin-s3-uploader`
3. Access type: Programmatic access
4. Attach policies: `AmazonS3FullAccess` (or create custom policy)
5. Copy Access Key ID and Secret Access Key

### 5. Set Up CloudFront (Optional but Recommended)

1. Go to CloudFront service
2. Create distribution
3. Origin domain: Select your S3 bucket
4. Origin access: Origin access control (recommended)
5. Viewer protocol policy: Redirect HTTP to HTTPS
6. Create distribution
7. Copy the CloudFront domain name

### 6. Update .env File

```env
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=sarvin-electronics-images
AWS_CLOUDFRONT_DOMAIN=https://dxxxxxxxxxx.cloudfront.net
```

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sarvin-electronics
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../sarvin
npm install
```

## 🚀 Running the Application

### Development Mode

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd sarvin
npm run dev
# Frontend runs on http://localhost:5173
```

#### Option 2: Run Both Concurrently (from root)

```bash
# Install concurrently globally (one-time)
npm install -g concurrently

# Run both servers
npm run dev
```

### Production Build

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd sarvin
npm run build
npm run preview
```

## 👨‍💼 Admin Access

After starting the application:

1. The admin user is automatically created on first server start
2. Access admin panel:
   - URL: `http://localhost:5173/admin`
   - Email: Value from `ADMIN_EMAIL` in `.env`
   - Password: Value from `ADMIN_PASSWORD` in `.env`
   - Default: `admin@sarvinelectronics.com` / `Admin@123456`

### Admin Features:
- ✅ Product Management (Create, Edit, Delete)
- ✅ Order Management (View, Update Status)
- ✅ Customer Management
- ✅ Newsletter Subscribers
- ✅ Contact Form Submissions
- ✅ Dashboard Analytics

## 🔍 Troubleshooting

### MongoDB Connection Issues

**Problem:** `MongooseServerSelectionError`

**Solution:**
1. Ensure MongoDB is running:
   ```bash
   # Windows
   services.msc → MongoDB Server → Start

   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongodb
   ```

2. Check connection string in `server/.env`
3. Try: `mongodb://127.0.0.1:27017/sarvin-electronics`

### Email Not Sending

**Problem:** Emails not being sent

**Solution:**
1. Verify Gmail OAuth2 credentials
2. Regenerate refresh token (tokens expire)
3. Check Gmail API is enabled in Google Cloud Console
4. Ensure less secure app access is enabled (if not using OAuth2)

### Payment Gateway Errors

**Problem:** Razorpay payment fails

**Solution:**
1. Verify API keys in both frontend and backend
2. Ensure keys match (test keys with test keys, live with live)
3. Check network requests in browser DevTools
4. Enable test mode in Razorpay dashboard

### Image Upload Fails

**Problem:** Cannot upload product images

**Solution:**
1. Verify AWS credentials
2. Check S3 bucket permissions
3. Ensure bucket CORS is configured
4. Check IAM user has S3 write permissions
5. Verify bucket name and region match .env

### CORS Errors

**Problem:** `Access-Control-Allow-Origin` errors

**Solution:**
1. Check `FRONTEND_URL` in `server/.env` matches your frontend URL
2. Update CORS configuration in `server/server.js`
3. Add your production domain to allowed origins

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

## 📝 Environment Variables Reference

### Backend Required Variables:
- ✅ MONGODB_URI
- ✅ JWT_SECRET
- ✅ ADMIN_EMAIL
- ✅ ADMIN_PASSWORD
- ✅ FRONTEND_URL
- ⚠️ GMAIL_* (Optional - for email functionality)
- ⚠️ RAZORPAY_* (Optional - for payment processing)
- ⚠️ AWS_* (Optional - for image uploads)

### Frontend Required Variables:
- ✅ VITE_BACKEND_URL
- ⚠️ VITE_RAZORPAY_KEY_ID (Optional - for payments)

## 🆘 Getting Help

If you encounter issues:

1. Check this guide first
2. Verify all environment variables are set
3. Check browser console for frontend errors
4. Check terminal/server logs for backend errors
5. Ensure all services (MongoDB, Backend, Frontend) are running

## 🎉 Success Checklist

Before considering setup complete:

- [ ] MongoDB is running and connected
- [ ] Backend server starts without errors
- [ ] Frontend development server starts
- [ ] Can access http://localhost:5173
- [ ] Can login to admin panel
- [ ] Admin dashboard loads correctly
- [ ] Can create/view products (if AWS configured)
- [ ] Can place test order (if Razorpay configured)
- [ ] Emails are being sent (if Gmail configured)

## 🚀 Next Steps

Once setup is complete:

1. **Add Products:** Login to admin panel and add your first products
2. **Configure Email Templates:** Customize email templates in `server/emailService/templates/`
3. **Customize Branding:** Update logos and colors in frontend
4. **Set Up Production:** Deploy to hosting service (Vercel, Heroku, AWS, etc.)
5. **Enable SSL:** Configure HTTPS for production
6. **Set Up Domain:** Point your domain to the hosted application

---

**Congratulations!** 🎉 Your Sarvin Electronics platform is now set up and ready to use!
