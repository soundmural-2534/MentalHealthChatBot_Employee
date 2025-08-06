# Email Setup Guide

This guide explains how to configure email functionality for password reset features in the Mental Health Chatbot application.

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Backend Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000

# Email Configuration
# For Development (Gmail)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=your-gmail@gmail.com

# For Production (SMTP)
SMTP_HOST=smtp.your-company.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@your-company.com
SMTP_PASS=your-smtp-password
```

## Gmail Setup for Development

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Navigate to Security > 2-Step Verification
   - Enable 2-Factor Authentication

2. **Generate App Password**
   - Go to Google Account settings > Security
   - Under "2-Step Verification", click on "App passwords"
   - Select "Mail" as the app
   - Generate a new app password
   - Copy the 16-character password

3. **Configure Environment Variables**
   ```bash
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_FROM=your-gmail@gmail.com
   ```

## Production SMTP Setup

For production environments, use your company's SMTP server:

```bash
NODE_ENV=production
SMTP_HOST=smtp.your-company.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@your-company.com
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@your-company.com
```

## Testing Email Configuration

The application will automatically test the email configuration when starting up. Check the console logs for:

```
Email configuration is valid
```

If you see an error, verify your credentials and network connectivity.

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, unique passwords** for email accounts
3. **Enable 2FA** on all email accounts
4. **Use app-specific passwords** instead of main account passwords
5. **Regularly rotate** email passwords
6. **Monitor email logs** for suspicious activity

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Verify EMAIL_USER and EMAIL_PASS are correct
   - Ensure 2FA is enabled and you're using an app password
   - Check if "Less secure app access" is disabled (it should be)

2. **"Connection timeout" error**
   - Check your internet connection
   - Verify SMTP_HOST and SMTP_PORT are correct
   - Check if your firewall is blocking the connection

3. **"Authentication failed" error**
   - Double-check your app password
   - Ensure you're using the correct Gmail address
   - Try regenerating the app password

### Development Fallback

If email configuration fails in development, the application will:
- Log the reset link to the console
- Still return the reset token in the API response
- Allow you to manually construct the reset URL

### Email Template Customization

The email template is defined in `backend/utils/emailService.js`. You can customize:
- Company branding
- Email styling
- Message content
- Security warnings

## Support

If you encounter issues with email setup:
1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a different email provider if needed
4. Contact your IT department for SMTP configuration details 