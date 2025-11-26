export const loadRazorpay = () => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('Razorpay SDK loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initiatePayment = (options) => {
  return new Promise((resolve, reject) => {
    // Validate required options
    if (!options.key) {
      reject(new Error('Razorpay key not provided'));
      return;
    }

    if (!options.amount || options.amount <= 0) {
      reject(new Error('Invalid payment amount'));
      return;
    }

    if (!options.order_id) {
      reject(new Error('Order ID not provided'));
      return;
    }

    console.log('Creating Razorpay instance with options:', {
      ...options,
      handler: '[Function]'
    });

    try {
      const rzp = new window.Razorpay({
        ...options,
        handler: function(response) {
          console.log('Payment successful:', response);
          resolve(response);
        },
        prefill: {
          name: options.name || options.prefill?.name,
          email: options.email || options.prefill?.email,
          contact: options.contact || options.prefill?.contact
        },
        theme: {
          color: '#16A34A',
          backdrop_color: 'rgba(0, 0, 0, 0.6)'
        },
        modal: {
          confirm_close: true,
          ondismiss: function() {
            console.log('Payment modal dismissed');
            reject(new Error('Payment cancelled by user'));
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300 // 5 minutes
      });
      
      rzp.on('payment.failed', function(response) {
        console.error('Payment failed event:', response);
        const errorMsg = response.error?.description || 
                        response.error?.reason || 
                        'Payment failed. Please try again.';
        reject(new Error(errorMsg));
      });

      rzp.on('payment.error', function(response) {
        console.error('Payment error event:', response);
        reject(new Error('Payment processing error. Please try again.'));
      });
      
      console.log('Opening Razorpay payment modal...');
      rzp.open();
    } catch (error) {
      console.error('Error creating Razorpay instance:', error);
      reject(new Error('Failed to initialize payment. Please try again.'));
    }
  });
};