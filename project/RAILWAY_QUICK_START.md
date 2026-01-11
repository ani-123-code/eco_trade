# Railway Deployment - Quick Start Guide

## 🚀 Quick Deployment Steps

### Prerequisites Checklist
- [ ] Railway account created
- [ ] MongoDB Atlas account (or Railway MongoDB)
- [ ] GitHub repository with your code
- [ ] All API keys ready (Gmail, AWS, Razorpay, etc.)

---

## Option 1: Separate Backend + Frontend (Recommended) ⭐

### Backend Deployment (5 minutes)

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Add Backend Service**
   - Click "+ New" → "GitHub Repo" → Select repo
   - **Settings** → Set:
     - Root Directory: `project/server`
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Add MongoDB**
   - Click "+ New" → "Database" → "MongoDB"
   - Copy connection string

4. **Add Environment Variables** (in Variables tab):
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<generate-random-32-char-string>
   JWT_EXPIRE=7d
   FRONTEND_URL=<update-after-frontend-deploy>
   ADMIN_EMAIL=admin@ecotrade.com
   ADMIN_PASSWORD=<your-secure-password>
   APP_NAME=EcoTrade
   GMAIL_USER=<your-email>
   GMAIL_CLIENT_ID=<your-gmail-client-id>
   GMAIL_CLIENT_SECRET=<your-gmail-secret>
   GMAIL_REFRESH_TOKEN=<your-gmail-token>
   AWS_ACCESS_KEY_ID=<your-aws-key>
   AWS_SECRET_ACCESS_KEY=<your-aws-secret>
   AWS_REGION=ap-south-1
   AWS_S3_BUCKET_NAME=ecotrade-images
   RAZORPAY_KEY_ID=<your-razorpay-key>
   RAZORPAY_KEY_SECRET=<your-razorpay-secret>
   ```

5. **Generate Domain**
   - Settings → Generate Domain
   - Copy backend URL: `https://xxx.railway.app`

---

### Frontend Deployment (5 minutes)

1. **Add Frontend Service**
   - In same project, click "+ New" → "GitHub Repo"
   - **Settings** → Set:
     - Root Directory: `project/ecotrade`
     - Build Command: `npm install && npm run build`
     - Start Command: `npx serve -s dist -l $PORT`

2. **Add Environment Variables**:
   ```env
   VITE_BACKEND_URL=<your-backend-railway-url>
   VITE_API_URL=<your-backend-railway-url>
   VITE_FRONTEND_URL=<update-after-generating-domain>
   VITE_RAZORPAY_KEY_ID=<your-razorpay-key>
   ```

3. **Generate Domain**
   - Settings → Generate Domain
   - Copy frontend URL

4. **Update URLs**
   - Update `VITE_FRONTEND_URL` in frontend
   - Update `FRONTEND_URL` in backend

---

## ✅ Verification Steps

1. **Test Backend**
   - Visit: `https://your-backend.railway.app/api/health`
   - Should return JSON response

2. **Test Frontend**
   - Visit your frontend URL
   - Should load the homepage

3. **Test API Connection**
   - Try login/register
   - Check browser console for errors
   - Check Railway logs for backend errors

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Build fails | Check package.json, verify all dependencies |
| API 404 errors | Verify VITE_BACKEND_URL matches backend URL |
| CORS errors | Update FRONTEND_URL in backend env vars |
| MongoDB connection fails | Check MONGODB_URI format and network access |
| Socket.io not working | Verify VITE_API_URL matches backend URL |

---

## 📋 Environment Variables Checklist

### Backend (Required)
- [ ] NODE_ENV=production
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] FRONTEND_URL
- [ ] ADMIN_EMAIL
- [ ] ADMIN_PASSWORD

### Backend (Optional but Recommended)
- [ ] GMAIL_* (for emails)
- [ ] AWS_* (for image uploads)
- [ ] RAZORPAY_* (for payments)

### Frontend (Required)
- [ ] VITE_BACKEND_URL
- [ ] VITE_API_URL
- [ ] VITE_FRONTEND_URL

### Frontend (Optional)
- [ ] VITE_RAZORPAY_KEY_ID

---

## 🎯 Next Steps After Deployment

1. ✅ Test all features
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring
4. ✅ Set up backups
5. ✅ Review security settings

---

## 📞 Need Help?

- Check full guide: `RAILWAY_DEPLOYMENT_GUIDE.md`
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

---

**Estimated Total Time: 15-20 minutes** ⏱️

Good luck! 🚀
