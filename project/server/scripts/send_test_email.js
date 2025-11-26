// Simple test script to send an email using the project's EmailService
// Usage: from the `server` folder run: `node .\scripts\send_test_email.js` (PowerShell)

require('dotenv').config({ path: __dirname + '/../.env' });
const emailService = require('../emailService/EmailService');

(async () => {
  try {
    const recipient = process.argv[2] || '';
    if (!recipient) {
      console.error('No recipient provided. Run with: node .\\scripts\\send_test_email.js you@example.com');
      process.exit(1);
    }

    console.log(`Sending test email from ${process.env.GMAIL_USER} to ${recipient} ...`);

    const result = await emailService.sendWelcomeEmailToSubscriber({ email: recipient, name: 'Test Recipient' });
    console.log('Send result:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(2);
  }
})();
