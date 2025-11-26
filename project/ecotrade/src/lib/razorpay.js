export const loadRazorpay = () => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async (amount, userDetails, onSuccess, onFailure) => {
  try {
    console.log('Initiating Razorpay payment for amount:', amount);
    
    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    // Check minimum amount (₹1.00)
    if (amount < 1) {
      throw new Error('Minimum order amount is ₹1.00');
    }

    // Check maximum amount (₹5,00,000 / 5 Lakhs)
    if (amount > 500000) {
      throw new Error('Maximum order amount is ₹5,00,000.00');
    }

    // Validate Razorpay key
    if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
      throw new Error('Payment gateway not configured. Please contact support.');
    }

    // Load Razorpay script
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      throw new Error('Razorpay SDK failed to load');
    }

    // Get token from the user object stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      throw new Error('User not authenticated');
    }

    const userData = JSON.parse(storedUser);
    const token = userData.token;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log('Creating Razorpay order...');

    // Create order on backend first
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/create-razorpay-order`, {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: Math.round(amount * 100) }) // Convert to paise
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    // Check if response is ok
    if (!response.ok) {
      let errorMessage = 'Failed to create Razorpay order';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Error response:', errorData);
        
        // Handle specific error types
        if (errorData.type === 'RAZORPAY_NOT_CONFIGURED') {
          throw new Error('Payment gateway not configured. Please contact administrator.');
        }
        if (errorData.type === 'CONFIGURATION_ERROR') {
          throw new Error('Payment gateway configuration error. Please contact support.');
        }
        if (errorData.type === 'AMOUNT_ERROR') {
          throw new Error(errorData.message || 'Invalid payment amount');
        }
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = `${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Check if response has content
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!responseText) {
      throw new Error('Empty response from server');
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error('Invalid JSON response from server');
    }

    console.log('Parsed response:', responseData);

    const { razorpayOrder } = responseData;

    if (!razorpayOrder || !razorpayOrder.id) {
      throw new Error('Invalid response: missing razorpayOrder or order ID');
    }

    console.log('Razorpay order created:', razorpayOrder.id);

    // Validate user details
    if (!userDetails.name || !userDetails.email || !userDetails.contact) {
      throw new Error('Incomplete user details for payment');
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanContact = userDetails.contact.replace(/\D/g, '');
    if (cleanContact.length !== 10) {
      throw new Error('Invalid phone number. Please provide a valid 10-digit number.');
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'EcoTrade',
      description: 'Certified Refurbished Electronics',
      order_id: razorpayOrder.id,
      timeout: 300, // 5 minutes timeout
      retry: {
        enabled: true,
        max_count: 3
      },
      handler: function(response) {
        console.log('Payment success:', response);
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        });
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: cleanContact
      },
      theme: {
        color: '#16A34A',
        backdrop_color: 'rgba(0, 0, 0, 0.6)'
      },
      config: {
        display: {
          blocks: {
            // EMI Block - for Card EMI options
            emi: {
              name: 'EMI Options',
              instruments: [
                {
                  method: 'emi',
                  issuers: ['HDFC', 'ICIC', 'UTIB', 'SBIN', 'KKBK', 'SCBL', 'CITI', 'AMEX'] // Major banks supporting EMI
                },
                {
                  method: 'cardless_emi',
                  providers: ['earlysalary', 'zestmoney', 'hdfc', 'epaylater'] // Cardless EMI providers
                }
              ]
            },
            // Card Payment Block
            card: {
              name: 'Pay with Card',
              instruments: [
                {
                  method: 'card'
                }
              ]
            },
            // UPI & Netbanking Block
            banks: {
              name: 'UPI & Netbanking',
              instruments: [
                {
                  method: 'upi'
                },
                {
                  method: 'netbanking'
                }
              ]
            },
            // Wallets Block
            wallets: {
              name: 'Wallets',
              instruments: [
                {
                  method: 'wallet',
                  wallets: ['phonepe', 'paytm', 'mobikwik', 'amazonpay', 'freecharge', 'jiomoney', 'olamoney']
                }
              ]
            }
          },
          sequence: ['block.emi', 'block.card', 'block.banks', 'block.wallets'],
          preferences: {
            show_default_blocks: true
          }
        }
      },
      modal: {
        confirm_close: true,
        ondismiss: function() {
          console.log('Payment cancelled by user');
          onFailure('Payment cancelled by user');
        },
        // Enable customer fee bearer for EMI
        // This shows the EMI charges to customer
        handleback: true,
        escape: true,
        animation: true
      },
      // Notes for EMI configuration
      notes: {
        payment_for: 'EcoTrade Purchase',
        customer_email: userDetails.email
      }
    };

    console.log('Opening Razorpay with options:', options);

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function(response) {
      console.error('Payment failed:', response);
      const errorMsg = response.error?.description || response.error?.reason || 'Payment failed. Please try again.';
      onFailure(errorMsg);
    });
    
    rzp.open();
  } catch (error) {
    console.error('Payment initiation error:', error);
    onFailure(error.message);
  }
};