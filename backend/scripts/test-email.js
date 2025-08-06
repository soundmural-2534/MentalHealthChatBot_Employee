#!/usr/bin/env node

/**
 * Email Configuration Test Script
 * 
 * This script tests your email configuration for the Mental Health Chatbot
 * password reset functionality.
 * 
 * Usage:
 *   node scripts/test-email.js
 *   node scripts/test-email.js your-test-email@example.com
 */

require('dotenv').config();
const { sendPasswordResetEmail, testEmailConfiguration } = require('../utils/emailService');

const testEmail = async (recipientEmail) => {
  console.log('🧪 Mental Health Chatbot - Email Configuration Test\n');
  
  // Test 1: Configuration validation
  console.log('Step 1: Testing email configuration...');
  const configValid = await testEmailConfiguration();
  
  if (!configValid) {
    console.log('\n❌ Email configuration test failed');
    console.log('Please check your environment variables:');
    
    if (process.env.NODE_ENV === 'production') {
      console.log('- SMTP_HOST');
      console.log('- SMTP_PORT');
      console.log('- SMTP_USER');
      console.log('- SMTP_PASS');
    } else {
      console.log('- EMAIL_USER (your Gmail address)');
      console.log('- EMAIL_PASS (your Gmail app password)');
    }
    
    console.log('\n📖 See EMAIL_SETUP.md for detailed instructions');
    process.exit(1);
  }
  
  console.log('✅ Email configuration is valid\n');
  
  // Test 2: Send test email (if recipient provided)
  if (recipientEmail) {
    console.log(`Step 2: Sending test email to ${recipientEmail}...`);
    
    const testResetLink = `http://localhost:3000/reset-password?token=test-token-123`;
    const testExpiryTime = new Date(Date.now() + 3600000).toLocaleString();
    
    const result = await sendPasswordResetEmail(
      recipientEmail,
      'Test User',
      testResetLink,
      testExpiryTime
    );
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📬 Check your inbox at ${recipientEmail}`);
      console.log('\n⚠️  Note: This was a test email with a fake reset link');
    } else {
      console.log('❌ Failed to send test email');
      console.log(`Error: ${result.error}`);
      
      // Common troubleshooting tips
      console.log('\n🔧 Troubleshooting tips:');
      console.log('- Verify your email credentials are correct');
      console.log('- Check if 2FA is enabled and you\'re using an app password');
      console.log('- Ensure your internet connection is working');
      console.log('- Try with a different email provider');
      
      process.exit(1);
    }
  } else {
    console.log('Step 2: Skipped (no recipient email provided)');
    console.log('To test sending emails, run:');
    console.log('node scripts/test-email.js your-email@example.com');
  }
  
  console.log('\n🎉 Email configuration test completed successfully!');
  console.log('Your password reset functionality should work correctly.');
};

// Get recipient email from command line argument
const recipientEmail = process.argv[2];

// Validate email format if provided
if (recipientEmail && !/\S+@\S+\.\S+/.test(recipientEmail)) {
  console.error('❌ Invalid email format provided');
  console.log('Usage: node scripts/test-email.js your-email@example.com');
  process.exit(1);
}

// Run the test
testEmail(recipientEmail).catch((error) => {
  console.error('❌ Test failed with error:', error.message);
  process.exit(1);
}); 