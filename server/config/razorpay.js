const Razorpay = require('razorpay');

// Validate environment variables
if (!process.env.RAZORPAY_KEY_ID) {
  console.warn('RAZORPAY_KEY_ID is not set in environment variables - Payment will not work');
  module.exports = null;
  return;
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  console.warn('RAZORPAY_KEY_SECRET is not set in environment variables - Payment will not work');
  module.exports = null;
  return;
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log('Razorpay initialized with Key ID:', process.env.RAZORPAY_KEY_ID);

module.exports = razorpay;