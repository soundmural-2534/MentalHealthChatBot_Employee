const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  // For development, use Gmail with app password or ethereal email
  // For production, use your company's SMTP server
  
  if (process.env.NODE_ENV === 'production') {
    // Production SMTP configuration
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development configuration - using Gmail
    // You can also use Ethereal Email for testing: https://ethereal.email/
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail app password
      },
    });
  }
};

// Email templates
const getPasswordResetEmailTemplate = (userName, resetLink, expiryTime) => {
  return {
    subject: 'Reset Your Password - Mental Health Chatbot',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            display: inline-block;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .button:hover {
            opacity: 0.9;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
          }
          .security-note {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🧠 Mental Health Chatbot</div>
            <h1>Password Reset Request</h1>
          </div>
          
          <div class="content">
            <p>Hello ${userName},</p>
            
            <p>We received a request to reset the password for your Mental Health Chatbot account. If you made this request, please click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset My Password</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour (${expiryTime}).
            </div>
            
            <div class="security-note">
              <strong>🔒 Security Note:</strong>
              <ul>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
                <li>The link can only be used once</li>
              </ul>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
              ${resetLink}
            </p>
            
            <p>If you're having trouble resetting your password, please contact our support team.</p>
            
            <p>Best regards,<br>
            The Mental Health Support Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 Mental Health Chatbot - Employee Wellness Platform</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${userName},

We received a request to reset the password for your Mental Health Chatbot account.

Reset your password by clicking this link: ${resetLink}

This link will expire in 1 hour (${expiryTime}).

If you didn't request this password reset, please ignore this email.

For security reasons:
- Never share this link with anyone
- The link can only be used once
- If you're having trouble, contact our support team

Best regards,
The Mental Health Support Team

This is an automated message. Please do not reply to this email.
    `
  };
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetLink, expiryTime) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = getPasswordResetEmailTemplate(userName, resetLink, expiryTime);
    
    const mailOptions = {
      from: {
        name: 'Mental Health Chatbot',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Password reset email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    console.log('💡 Please check your email settings in the .env file');
    console.log('📖 See EMAIL_SETUP.md for configuration instructions');
    return false;
  }
};

// Initialize email service
const initializeEmailService = async () => {
  console.log('🔧 Initializing email service...');
  
  // Check if email configuration exists
  const hasEmailConfig = process.env.EMAIL_USER || process.env.SMTP_HOST;
  
  if (!hasEmailConfig) {
    console.log('⚠️  No email configuration found');
    console.log('📧 Password reset emails will not be sent');
    console.log('🔗 Reset links will be logged to console in development');
    console.log('📖 See EMAIL_SETUP.md for configuration instructions');
    return false;
  }
  
  const isValid = await testEmailConfiguration();
  
  if (isValid) {
    console.log('📧 Email service ready for password reset functionality');
  } else {
    console.log('⚠️  Email service not available - reset links will be logged to console');
  }
  
  return isValid;
};

module.exports = {
  sendPasswordResetEmail,
  testEmailConfiguration,
  initializeEmailService
}; 