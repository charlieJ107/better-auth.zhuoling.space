// Email utility types
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  from: string;
  auth: {
    user: string;
    pass: string;
  };
}

export interface BaseEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export type EmailType = 'verification' | 'password-reset' | 'magic-link' | 'otp';

export type EmailLocale = 'en' | 'zh';

export interface EmailOptions {
  userName?: string;
  locale?: EmailLocale;
  appName?: string;
}

// Environment variables for email configuration
export interface EmailEnvConfig {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_SECURE?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
}
