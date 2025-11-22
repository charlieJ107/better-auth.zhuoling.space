import type { 
  EmailTemplate, 
  EmailTemplateData, 
  OTPTemplateData, 
  EmailTemplateType, 
  EmailLocale 
} from './types';
import { 
  emailVerificationTemplates, 
  passwordResetTemplates, 
  magicLinkTemplates, 
  otpTemplates 
} from './index';

/**
 * Load email template for a specific type and locale
 */
export function loadEmailTemplate(
  type: EmailTemplateType,
  locale: EmailLocale,
  data: EmailTemplateData | OTPTemplateData
): EmailTemplate {
  const templates = getTemplateMap(type);
  const templateGenerator = templates[locale] || templates['en']; // Fallback to English
  
  if (!templateGenerator) {
    throw new Error(`No template found for type: ${type}, locale: ${locale}`);
  }
  
  return templateGenerator(data as Parameters<typeof templateGenerator>[0]);
}

/**
 * Get the appropriate template map based on email type
 */
function getTemplateMap(type: EmailTemplateType) {
  switch (type) {
    case 'verification':
      return emailVerificationTemplates;
    case 'password-reset':
      return passwordResetTemplates;
    case 'magic-link':
      return magicLinkTemplates;
    case 'otp':
      return otpTemplates;
    default:
      throw new Error(`Unknown email template type: ${type}`);
  }
}

/**
 * Get available locales for a specific template type
 */
export function getAvailableLocales(type: EmailTemplateType): EmailLocale[] {
  const templates = getTemplateMap(type);
  return Object.keys(templates) as EmailLocale[];
}

/**
 * Check if a locale is supported for a specific template type
 */
export function isLocaleSupported(type: EmailTemplateType, locale: EmailLocale): boolean {
  const templates = getTemplateMap(type);
  return locale in templates;
}

/**
 * Get default locale (fallback when requested locale is not available)
 */
export function getDefaultLocale(): EmailLocale {
  return 'en';
}

/**
 * Validate template data based on type
 */
export function validateTemplateData(type: EmailTemplateType, data: EmailTemplateData | OTPTemplateData): boolean {
  const requiredFields = ['appName', 'url'];
  
  if (type === 'otp') {
    requiredFields.push('otp', 'type');
  }
  
  return requiredFields.every(field => data && field in data);
}
  