# EcoTrade - Complete Setup Instructions

## Quick Start (5 Minutes)

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB installed and running

### 2. Install Dependencies (Already Done)

Dependencies are already installed. If you need to reinstall:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies  
cd ../sarvin
npm install
```

### 3. Environment Setup (Already Configured)

Environment files are already configured:

**Backend Environment (server/.env):**
- MongoDB: `mongodb://localhost:27017/ecotrade-electronics`
- Admin: `admin@ecotrade.com` / `Admin@123456`
- JWT Secret: Configured
- App Name: EcoTrade

**Frontend Environment (sarvin/.env):**
- Backend URL: `http://localhost:5000`
- Frontend URL: `http://localhost:5173`

### 4. Start MongoDB

**Windows:**
```bash
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

The backend server is already starting. For the frontend:

**Terminal 2 - Frontend:**
```bash
cd sarvin
npm run dev
```

### 6. Access the Application

- **Website**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin
- **Admin Login**: 
  - Email: `admin@ecotrade.com`
  - Password: `Admin@123456`

## What Works Out of the Box

✅ **Complete Authentication System**
- User registration and login
- Email verification (when email configured)
- Password reset
- Admin panel access

✅ **Product Management**
- Browse certified refurbished electronics
- Search and filter products
- View product details with specifications
- Admin can add/edit/delete products

✅ **Shopping Cart & Checkout**
- Add products to cart
- Update quantities
- Secure checkout process
- Order placement

✅ **Order Management**
- View order history
- Track order status
- Admin can manage all orders
- Email notifications (when configured)

✅ **Dynamic Collections & Brands**
- Admin can create product collections
- Admin can manage brands with logos
- Real-time updates across the website

## Optional External Services

For full functionality, configure these services:

### Email Notifications (Optional)
- Requires Gmail OAuth2 setup
- See SETUP_GUIDE.md for detailed instructions

### Payment Processing (Optional)
- Requires Razorpay account and API keys
- See SETUP_GUIDE.md for setup instructions

### Image Uploads (Optional)
- Requires AWS S3 bucket configuration
- See SETUP_GUIDE.md for AWS setup

## Troubleshooting

### MongoDB Connection Error
```bash
# Ensure MongoDB is running
mongosh  # Test connection
```

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 5173  
npx kill-port 5173
```

### Module Not Found
```bash
# Reinstall dependencies
cd server && npm install
cd ../sarvin && npm install
```

## Testing Steps

1. **Test Basic Functionality:**
   - Register a new user
   - Browse products
   - Add items to cart
   - Test admin panel

2. **Test Admin Features:**
   - Login to admin panel
   - Create product collections
   - Add brands with logos
   - Add sample products

3. **Test UI/UX:**
   - Check responsive design
   - Verify professional appearance
   - Test all navigation links
   - Verify EcoTrade branding

## Key Features

### For Customers
- Browse certified refurbished electronics
- Advanced search and filtering
- Secure shopping cart and checkout
- User account management
- Order tracking
- Product reviews

### For Admins
- Complete product management
- Dynamic collections and brands
- Order management
- Customer management
- Dashboard analytics
- Newsletter and contact management

Your EcoTrade platform is now ready to use! 🚀

## Next Steps

1. **Configure External Services (Optional):**
   - Set up email notifications
   - Configure payment gateway
   - Set up image uploads

2. **Add Sample Data:**
   - Create collections via admin panel
   - Add brands with logos
   - Add sample products

3. **Customize:**
   - Update contact information
   - Add your own product images
   - Customize FAQ content