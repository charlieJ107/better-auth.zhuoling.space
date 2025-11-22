export interface EmailTemplateData {
  userName?: string;
  appName: string;
  url: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export type EmailTemplateType = 'verification' | 'password-reset' | 'magic-link' | 'otp';

export interface OTPTemplateData extends EmailTemplateData {
  otp: string;
  type: 'sign-in' | 'email-verification' | 'password-reset';
}

export type EmailLocale = 'en' | 'zh';
