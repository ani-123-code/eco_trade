# Quick Start Guide - Sarvin Electronics

This is a condensed quick-start guide. For detailed instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## ⚡ Fastest Setup (5 Minutes)

### 1. Prerequisites Check
```bash
# Check Node.js version (should be 18+)
node --version

# Check MongoDB is installed and running
mongosh --version
```

### 2. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd sarvin-electronics

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../sarvin
npm install
```

### 3. Environment Setup

**Backend (.env):**
```bash
cd server
cp .env.example .env
```

**Minimum required variables to start:**
```env
MONGODB_URI=mongodb://localhost:27017/sarvin-electronics
JWT_SECRET=change-this-to-a-random-secure-string-123456
ADMIN_EMAIL=admin@sarvinelectronics.com
ADMIN_PASSWORD=Admin@123456
APP_NAME=Sarvin Electronics
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```bash
cd ../sarvin
cp .env.example .env
```

**Required variables:**
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
```

### 4. Start MongoDB

**Windows:**
```bash
# Open Services and start MongoDB Server
# OR
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongodb
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
✅ Backend should start on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd sarvin
npm run dev
```
✅ Frontend should start on http://localhost:5173

### 6. Access Admin Panel

1. Open browser: http://localhost:5173/admin
2. Login with:
   - Email: `admin@sarvinelectronics.com`
   - Password: `Admin@123456`

## 🎯 What Works Out of the Box

✅ **Full Authentication System**
- User registration (email verification disabled by default)
- User login
- Password reset
- JWT authentication
- Admin panel access

✅ **Product Management**
- Browse products
- Search products
- Filter products
- View product details
- Admin can add/edit/delete products (without images until AWS configured)

✅ **Shopping Cart**
- Add to cart
- Update quantities
- Remove items
- Clear cart

✅ **Order Management**
- Place orders
- View order history
- Admin can view all orders
- Admin can update order status

✅ **User Management**
- User profiles
- Admin can view customers
- Newsletter subscriptions
- Contact form

## ⚠️ What Requires Additional Setup

❌ **Image Uploads** - Requires AWS S3 configuration
❌ **Payment Processing** - Requires Razorpay configuration
❌ **Email Notifications** - Requires Gmail OAuth2 configuration

For these features, see [SETUP_GUIDE.md](./SETUP_GUIDE.md) sections:
- Email Configuration (page 8)
- Payment Gateway Setup (page 11)
- AWS S3 Setup (page 12)

## 🐛 Common Issues

### MongoDB Connection Error
```bash
# Error: MongooseServerSelectionError
# Fix: Ensure MongoDB is running
mongosh  # Test connection
```

### Port Already in Use
```bash
# Backend port 5000 in use
# Fix: Kill the process or change PORT in .env

# Frontend port 5173 in use
# Fix: Vite will automatically suggest alternative port
```

### Cannot Find Module
```bash
# Fix: Install dependencies
cd server && npm install
cd sarvin && npm install
```

## 📝 Next Steps

After basic setup:

1. **Add Products** (in Admin Panel):
   - Go to Products → Add Product
   - Note: Image upload needs AWS S3

2. **Test User Flow**:
   - Register new user
   - Browse products
   - Add to cart
   - View checkout (payment needs Razorpay)

3. **Configure External Services** (optional):
   - Set up AWS S3 for image uploads
   - Set up Razorpay for payments
   - Set up Gmail OAuth2 for emails

## 🆘 Need Help?

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
2. Check Troubleshooting section in SETUP_GUIDE.md
3. Verify all environment variables are set correctly
4. Check browser console and terminal for error messages

## 📚 Documentation

- **Detailed Setup:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Project Overview:** [README.md](./README.md)

---

**You're ready to go! 🚀**
