import nodemailer from 'nodemailer';
import type {
  EmailConfig,
  BaseEmailOptions,
  EmailLocale,
  EmailOptions
} from './types';
import { loadEmailTemplate } from './templates/loader';
import type { EmailTemplateData, OTPTemplateData, EmailTemplateType } from './templates/types';
import { getBrandingConfig } from '@/lib/branding';

// Get email configuration from environment variables
function getEmailConfig(): EmailConfig {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USERNAME;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;
  if (!host || !port || !user || !pass || !from) {

    throw new Error('SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, and SMTP_FROM environment variables.');
  }
  return {
    host,
    port: parseInt(port),
    secure,
    from,
    auth: {
      user,
      pass,
    },
  };
}

// Create nodemailer transporter
function createTransporter() {
  const config = getEmailConfig();

  if (!config.auth.user || !config.auth.pass) {
    throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
  }

  return nodemailer.createTransport(config);
}

// Base email sending function
export async function sendEmail(options: BaseEmailOptions): Promise<void> {
  try {
    const transporter = createTransporter();
    const config = getEmailConfig();
    const mailOptions = {
      from: config.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', JSON.stringify(info, null, 2));
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Template loading functions
function loadTemplate(type: EmailTemplateType, locale: EmailLocale, data: EmailTemplateData | OTPTemplateData) {
  return loadEmailTemplate(type, locale, data);
}

// Specific email sending functions
export async function sendEmailVerification(
  to: string,
  verificationUrl: string,
  options: EmailOptions = {}
): Promise<void> {
  const { userName, locale = 'en', appName } = options;
  const branding = getBrandingConfig();
  const template = loadTemplate('verification', locale, {
    userName,
    url: verificationUrl,
    appName: appName || branding.appName
  });

  await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendPasswordReset(
  to: string,
  resetUrl: string,
  options: EmailOptions = {}
): Promise<void> {
  const { userName, locale = 'en', appName } = options;
  const branding = getBrandingConfig();
  const template = loadTemplate('password-reset', locale, {
    userName,
    url: resetUrl,
    appName: appName || branding.appName
  });

  await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendMagicLink(
  to: string,
  magicLinkUrl: string,
  options: EmailOptions = {}
): Promise<void> {
  const { userName, locale = 'en', appName } = options;
  const branding = getBrandingConfig();
  const template = loadTemplate('magic-link', locale, {
    userName,
    url: magicLinkUrl,
    appName: appName || branding.appName
  });

  await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendOTP(
  to: string,
  otp: string,
  type: 'sign-in' | 'email-verification' | 'password-reset',
  options: EmailOptions = {}
): Promise<void> {
  const { userName, locale = 'en', appName } = options;
  const branding = getBrandingConfig();
  const template = loadTemplate('otp', locale, {
    userName,
    url: '', // OTP doesn't need URL
    appName: appName || branding.appName,
    otp,
    type
  });

  await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
