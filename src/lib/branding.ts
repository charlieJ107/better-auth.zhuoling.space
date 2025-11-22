/**
 * Branding configuration system
 * Loads branding information from environment variables, branding.json, or default values
 */

export interface BrandingConfig {
  appName: string;              // Application name, e.g., "Zhuoling.Space"
  platformName: string;          // Platform name, e.g., "Zhuoling.Space"
  serviceName: string;            // Service name, e.g., "Zhuoling.Space services"
  companyName: string;            // Company name for legal documents
  contactEmail: {
    legal: string;                // Legal contact email, e.g., "legal@zhuoling.space"
    privacy: string;              // Privacy contact email, e.g., "privacy@zhuoling.space"
    dpo: string;                  // Data Protection Officer email, e.g., "dpo@zhuoling.space"
  };
  serviceDescription: {
    en: string;                   // English service description
    zh: string;                   // Chinese service description
  };
}

// Default branding configuration (Zhuoling.Space)
const defaultBranding: BrandingConfig = {
  appName: "Zhuoling.Space",
  platformName: "Zhuoling.Space",
  serviceName: "Zhuoling.Space",
  companyName: "Zhuoling.Space",
  contactEmail: {
    legal: "legal@zhuoling.space",
    privacy: "privacy@zhuoling.space",
    dpo: "dpo@zhuoling.space",
  },
  serviceDescription: {
    en: "authentication and authorization services",
    zh: "身份验证和授权服务",
  },
};

/**
 * Load branding configuration from file
 */
function loadBrandingFromFile(): BrandingConfig | null {
  try {
    // Try to load from branding.json in the project root
    // Using dynamic import for Node.js modules in Next.js
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const brandingPath = path.join(process.cwd(), 'branding.json');
      
      if (fs.existsSync(brandingPath)) {
        const content = fs.readFileSync(brandingPath, 'utf-8');
        const config = JSON.parse(content);
        return config as BrandingConfig;
      }
    }
  } catch (error) {
    console.warn('Failed to load branding.json:', error);
  }
  
  return null;
}

/**
 * Load branding configuration from environment variables
 */
function loadBrandingFromEnv(): BrandingConfig | null {
  try {
    const brandingJson = process.env.BRANDING_CONFIG;
    if (brandingJson) {
      const config = JSON.parse(brandingJson);
      return config as BrandingConfig;
    }
    
    // Also support individual environment variables
    const appName = process.env.BRANDING_APP_NAME;
    const platformName = process.env.BRANDING_PLATFORM_NAME;
    const serviceName = process.env.BRANDING_SERVICE_NAME;
    const companyName = process.env.BRANDING_COMPANY_NAME;
    
    if (appName || platformName || serviceName || companyName) {
      return {
        appName: appName || defaultBranding.appName,
        platformName: platformName || defaultBranding.platformName,
        serviceName: serviceName || defaultBranding.serviceName,
        companyName: companyName || defaultBranding.companyName,
        contactEmail: {
          legal: process.env.BRANDING_EMAIL_LEGAL || defaultBranding.contactEmail.legal,
          privacy: process.env.BRANDING_EMAIL_PRIVACY || defaultBranding.contactEmail.privacy,
          dpo: process.env.BRANDING_EMAIL_DPO || defaultBranding.contactEmail.dpo,
        },
        serviceDescription: {
          en: process.env.BRANDING_SERVICE_DESC_EN || defaultBranding.serviceDescription.en,
          zh: process.env.BRANDING_SERVICE_DESC_ZH || defaultBranding.serviceDescription.zh,
        },
      };
    }
  } catch (error) {
    console.warn('Failed to load branding from environment variables:', error);
  }
  
  return null;
}

/**
 * Get branding configuration
 * Priority: Environment variables > branding.json > default
 */
let cachedBranding: BrandingConfig | null = null;

export function getBrandingConfig(): BrandingConfig {
  if (cachedBranding) {
    return cachedBranding;
  }
  
  // Try environment variables first (highest priority)
  const envConfig = loadBrandingFromEnv();
  if (envConfig) {
    cachedBranding = envConfig;
    return cachedBranding;
  }
  
  // Try branding.json file
  const fileConfig = loadBrandingFromFile();
  if (fileConfig) {
    cachedBranding = fileConfig;
    return cachedBranding;
  }
  
  // Fallback to default
  cachedBranding = defaultBranding;
  return cachedBranding;
}

/**
 * Get a specific branding value
 */
export function getBrandingValue(key: keyof BrandingConfig | string): string {
  const config = getBrandingConfig();
  
  if (key === 'appName') return config.appName;
  if (key === 'platformName') return config.platformName;
  if (key === 'serviceName') return config.serviceName;
  if (key === 'companyName') return config.companyName;
  
  // Handle nested keys
  if (key.startsWith('contactEmail.')) {
    const emailKey = key.split('.')[1] as keyof BrandingConfig['contactEmail'];
    return config.contactEmail[emailKey] || '';
  }
  
  if (key.startsWith('serviceDescription.')) {
    const lang = key.split('.')[1] as 'en' | 'zh';
    return config.serviceDescription[lang] || '';
  }
  
  return '';
}

/**
 * Clear cached branding (useful for testing or hot reloading)
 */
export function clearBrandingCache(): void {
  cachedBranding = null;
}

