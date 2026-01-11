# Railway Deployment Guide for EcoTrade

This guide will walk you through deploying both the backend and frontend of EcoTrade to Railway hosting.

## 📋 Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. MongoDB Atlas account (for database) or Railway MongoDB plugin
3. GitHub account (optional, for automatic deployments)
4. All your API keys and credentials ready

---

## 🚀 Deployment Options

You have two options:
1. **Deploy Backend and Frontend Separately** (Recommended for better scaling)
2. **Deploy as Monorepo** (Single service with both)

We'll cover both methods.

---

## 📦 Option 1: Separate Deployments (Recommended)

### Step 1: Prepare Your Repository

1. Ensure your code is in a Git repository (GitHub, GitLab, etc.)
2. Make sure both `project/server` and `project/ecotrade` folders are in the repository

### Step 2: Deploy Backend (Server)

#### 2.1 Create New Project on Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"** (if your code is on GitHub) or **"Empty Project"**
4. If using GitHub, select your repository
5. Name it: `ecotrade-backend`

#### 2.2 Add Service - Backend

1. In your Railway project, click **"+ New"** → **"GitHub Repo"** (or **"Empty Service"**)
2. Select your repository
3. Click **"Add Service"**
4. Railway will detect it as a Node.js project

#### 2.3 Configure Backend Service

1. Click on your service
2. Go to **"Settings"** tab
3. Set the following:

**Root Directory:**
```
project/server
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

#### 2.4 Add MongoDB Database

1. In your Railway project, click **"+ New"** → **"Database"** → **"MongoDB"**
2. Railway will create a MongoDB instance
3. Note the connection string (you'll need it)

**OR** use MongoDB Atlas (recommended for production):
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string

#### 2.5 Set Environment Variables (Backend)

1. Go to your backend service
2. Click **"Variables"** tab
3. Click **"New Variable"**
4. Add the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d

# Frontend URL (will be set after deploying frontend)
FRONTEND_URL=https://your-frontend-url.railway.app

# Admin Credentials
ADMIN_EMAIL=admin@ecotrade.com
ADMIN_PASSWORD=YourSecurePassword123!

# Application Configuration
APP_NAME=EcoTrade

# Email Configuration (Gmail OAuth2)
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground

# AWS S3 Configuration (for image uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=ecotrade-images
AWS_CLOUDFRONT_DOMAIN=https://your-cloudfront-domain.cloudfront.net

# Razorpay Configuration (if using)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- Generate a secure JWT_SECRET (use a random string generator)
- For MongoDB URI: Use the connection string from Railway MongoDB or MongoDB Atlas
- For FRONTEND_URL: We'll update this after deploying the frontend

#### 2.6 Deploy Backend

1. Railway will automatically deploy when you push to your repository
2. Go to **"Deployments"** tab to see the deployment status
3. Once deployed, click **"Settings"** → **"Generate Domain"** to get your backend URL
4. Copy the backend URL (e.g., `https://ecotrade-backend-production.up.railway.app`)

---

### Step 3: Deploy Frontend (Client)

#### 3.1 Create Frontend Service

1. In the same Railway project (or create a new one), click **"+ New"** → **"GitHub Repo"**
2. Select the same repository
3. Click **"Add Service"**

#### 3.2 Configure Frontend Service

1. Click on your frontend service
2. Go to **"Settings"** tab
3. Set the following:

**Root Directory:**
```
project/ecotrade
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npx serve -s dist -l 3000
```

**Install Nixpacks.toml (for better build support):**

Create a file at `project/ecotrade/nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npx serve -s dist -l $PORT"
```

**OR** use static site serving:

1. After build, change start command to: `npx serve -s dist -l $PORT`
2. Install `serve` package: Add to `package.json` devDependencies: `"serve": "^14.2.0"`

#### 3.3 Set Environment Variables (Frontend)

1. Go to your frontend service
2. Click **"Variables"** tab
3. Add the following variables:

```env
# Backend API URL (use your backend Railway URL)
VITE_BACKEND_URL=https://your-backend-url.railway.app
VITE_API_URL=https://your-backend-url.railway.app

# Frontend URL
VITE_FRONTEND_URL=https://your-frontend-url.railway.app

# Razorpay Public Key (same as RAZORPAY_KEY_ID in backend)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

**Important:**
- Replace `your-backend-url.railway.app` with your actual backend Railway URL
- Replace `your-frontend-url.railway.app` with your actual frontend Railway URL (after generating domain)

#### 3.4 Update Backend FRONTEND_URL

1. Go back to your backend service
2. Update the `FRONTEND_URL` variable with your frontend Railway URL

#### 3.5 Deploy Frontend

1. Railway will automatically deploy
2. Go to **"Settings"** → **"Generate Domain"** to get your frontend URL
3. Update the `VITE_FRONTEND_URL` variable with this URL
4. Redeploy if needed

---

## 📦 Option 2: Monorepo Deployment (Single Service)

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Name it: `ecotrade`

### Step 2: Create nixpacks.toml

Create a file at the root of your repository: `nixpacks.toml`

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x"]

[phases.install]
cmds = [
  "cd project/server && npm install",
  "cd project/ecotrade && npm install"
]

[phases.build]
cmds = [
  "cd project/ecotrade && npm run build"
]

[start]
cmd = "cd project/server && npm start"
```

### Step 3: Update Server to Serve Frontend

Modify `project/server/server.js` to serve the frontend build:

```javascript
// Add this after your API routes, before 404 handler
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../ecotrade/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../ecotrade/dist/index.html'));
  });
}
```

### Step 4: Set Environment Variables

Set all the same environment variables as in Option 1 (backend + frontend variables).

### Step 5: Configure Service

**Root Directory:** (leave empty or set to project root)
**Build Command:** (handled by nixpacks.toml)
**Start Command:** (handled by nixpacks.toml)

---

## 🔧 Additional Configuration

### CORS Configuration

Your backend should already handle CORS. Make sure in `server.js`:

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));
```

### Database Connection

Ensure MongoDB connection string format:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Socket.io Configuration

Your Socket.io should work automatically. Ensure it's configured to use the same port as the HTTP server.

---

## 🧪 Testing Your Deployment

### Backend Testing

1. Visit: `https://your-backend-url.railway.app/api/health` (if you have a health endpoint)
2. Test API endpoints using Postman or curl
3. Check Railway logs for any errors

### Frontend Testing

1. Visit your frontend Railway URL
2. Test login/registration
3. Test API connections
4. Check browser console for errors

---

## 📝 Important Notes

1. **Environment Variables**: Always use Railway's Variables tab, never commit `.env` files
2. **Build Logs**: Check Railway deployment logs if builds fail
3. **Port Configuration**: Railway automatically sets `PORT` environment variable
4. **Auto-deployments**: Railway auto-deploys on every git push (if connected to GitHub)
5. **Custom Domains**: You can add custom domains in Railway Settings → Domains

---

## 🔍 Troubleshooting

### Build Fails
- Check build logs in Railway
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### API Connection Errors
- Verify `VITE_BACKEND_URL` matches your backend Railway URL
- Check CORS configuration
- Ensure backend is running (check logs)

### Database Connection Issues
- Verify MongoDB URI is correct
- Check MongoDB network access (whitelist Railway IPs)
- Ensure database credentials are correct

### Socket.io Not Working
- Ensure `VITE_API_URL` is set correctly
- Check Socket.io transport configuration
- Verify WebSocket support in Railway

---

## 🎉 Success!

Once deployed, your application should be live at:
- Frontend: `https://your-frontend-url.railway.app`
- Backend: `https://your-backend-url.railway.app`

Remember to:
1. Test all functionality
2. Monitor logs for errors
3. Set up monitoring/alerts
4. Configure custom domains (optional)
5. Set up SSL (automatic with Railway)

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com)

Good luck with your deployment! 🚀
