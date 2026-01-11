# Environment Variables Reference for Railway

Complete list of all environment variables needed for Railway deployment.

---

## 🔴 Backend Environment Variables (Required)

### Server Configuration
```env
NODE_ENV=production
PORT=5000
```

### Database
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Authentication
```env
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long_use_random_generator
JWT_EXPIRE=7d
```

### Application URLs
```env
FRONTEND_URL=https://your-frontend-url.railway.app
APP_NAME=EcoTrade
```

### Admin Account
```env
ADMIN_EMAIL=admin@ecotrade.com
ADMIN_PASSWORD=YourSecurePassword123!
```

---

## 🟡 Backend Environment Variables (Optional but Recommended)

### Email Configuration (Gmail OAuth2)
```env
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-gmail-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground
```

### AWS S3 Configuration (for image uploads)
```env
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=ecotrade-images
AWS_CLOUDFRONT_DOMAIN=https://your-cloudfront-domain.cloudfront.net
```

### Payment Gateway (Razorpay)
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

---

## 🔵 Frontend Environment Variables (Required)

### API Configuration
```env
VITE_BACKEND_URL=https://your-backend-url.railway.app
VITE_API_URL=https://your-backend-url.railway.app
VITE_FRONTEND_URL=https://your-frontend-url.railway.app
```

### Payment Gateway (Razorpay - if using)
```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

---

## 📝 How to Generate Values

### JWT_SECRET
Generate a secure random string (minimum 32 characters):
- Online: https://www.random.org/strings/
- Command line: `openssl rand -base64 32`
- Node.js: `require('crypto').randomBytes(32).toString('hex')`

### MongoDB URI
1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Go to "Connect" → "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database user password
5. Replace `<database>` with your database name (e.g., `ecotrade`)

### Gmail OAuth2 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Use [OAuth Playground](https://developers.google.com/oauthplayground) to generate refresh token

### AWS Credentials
1. Create AWS account
2. Go to IAM → Create user with S3 access
3. Create access keys
4. Create S3 bucket
5. Optionally set up CloudFront CDN

### Razorpay Credentials
1. Sign up at [Razorpay](https://razorpay.com)
2. Go to Settings → API Keys
3. Generate Test/Live keys

---

## ✅ Railway Setup Checklist

### Backend Service
- [ ] NODE_ENV=production
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] JWT_EXPIRE
- [ ] FRONTEND_URL (update after frontend deploy)
- [ ] ADMIN_EMAIL
- [ ] ADMIN_PASSWORD
- [ ] APP_NAME
- [ ] GMAIL_* (if using email)
- [ ] AWS_* (if using S3)
- [ ] RAZORPAY_* (if using payments)

### Frontend Service
- [ ] VITE_BACKEND_URL
- [ ] VITE_API_URL
- [ ] VITE_FRONTEND_URL (update after generating domain)
- [ ] VITE_RAZORPAY_KEY_ID (if using payments)

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to Git
2. **Use strong passwords** for JWT_SECRET (32+ characters)
3. **Rotate secrets regularly** in production
4. **Use Railway's Secrets** instead of plain text
5. **Limit database access** to Railway IPs only
6. **Use environment-specific values** (different for dev/prod)

---

## 🐛 Troubleshooting

### Missing Environment Variables
- Check Railway Variables tab
- Verify variable names match exactly (case-sensitive)
- Check spelling (VITE_ prefix for frontend)
- Restart service after adding variables

### Variable Not Loading
- Railway requires service restart
- Check variable name spelling
- Verify no extra spaces
- Check if variable is in correct service (backend vs frontend)

---

## 📚 Additional Resources

- [Railway Environment Variables Docs](https://docs.railway.app/develop/variables)
- [MongoDB Atlas Connection Guide](https://docs.atlas.mongodb.com/getting-started/)
- [Gmail API Setup](https://developers.google.com/gmail/api/quickstart/nodejs)

---

**Last Updated:** [Current Date]
**Version:** 1.0
