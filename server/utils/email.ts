import nodemailer from 'nodemailer';
import { logger } from './logger';

// Read email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.mailtrap.io';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '2525', 10);
const EMAIL_USER = process.env.EMAIL_USER || 'your_email_user';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your_email_password';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@example.com';

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Function to send verification email
export const sendVerificationEmail = async (to: string, token: string): Promise<boolean> => {
  try {
    // Get the app URL from environment or use default
    const appUrl = process.env.APP_URL || 'http://localhost:5000';
    const verificationUrl = `${appUrl}/verify-email/${token}`;
    
    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject: 'Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up! Please click the button below to verify your email address:</p>
          <div style="margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #3f51b5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
              Verify Email
            </a>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>The verification link will expire in 24 hours.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">
            This is an automated message, please do not reply.
          </p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${to}`);
    return true;
  } catch (error) {
    logger.error('Error sending verification email:', error);
    return false;
  }
};

// Function to send welcome email after verification
export const sendWelcomeEmail = async (to: string, name: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject: 'Welcome to Our Platform',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Welcome, ${name}!</h2>
          <p>Thank you for verifying your email address. Your account is now active.</p>
          <p>You can now log in and start using our platform's features.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">
            This is an automated message, please do not reply.
          </p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${to}`);
    return true;
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    return false;
  }
};
