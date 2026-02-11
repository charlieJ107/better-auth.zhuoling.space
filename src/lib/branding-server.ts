/**
 * Server-only branding: loads from branding.json, then env, then default.
 * Import this only in server code (routes, server components, middleware). Do not import in client components.
 */

import fs from 'node:fs'
import path from 'node:path'
import { getBrandingConfig as getClientBranding, type BrandingConfig } from './branding'

function loadBrandingFromFile(): BrandingConfig | null {
  try {
    const brandingPath = path.join(process.cwd(), 'branding.json')
    if (fs.existsSync(brandingPath)) {
      const content = fs.readFileSync(brandingPath, 'utf-8')
      return JSON.parse(content) as BrandingConfig
    }
  } catch (error) {
    console.warn('Failed to load branding.json:', error)
  }
  return null
}

let serverCache: BrandingConfig | null = null

/**
 * Get branding config on server: file (branding.json) > env > default.
 * Use this in auth, email, server components, etc. Use getBrandingConfig from '@/lib/branding' in shared/client code.
 */
export function getBrandingConfig(): BrandingConfig {
  if (serverCache) return serverCache
  const fileConfig = loadBrandingFromFile()
  if (fileConfig) {
    serverCache = fileConfig
    return serverCache
  }
  return getClientBranding()
}

/** Get a single branding value (server-only; supports branding.json). */
export function getBrandingValue(key: keyof BrandingConfig | string): string {
  const config = getBrandingConfig()
  if (key === 'appName') return config.appName
  if (key === 'platformName') return config.platformName
  if (key === 'serviceName') return config.serviceName
  if (key === 'companyName') return config.companyName
  if (key.startsWith('contactEmail.')) {
    const emailKey = key.split('.')[1] as keyof BrandingConfig['contactEmail']
    return config.contactEmail[emailKey] ?? ''
  }
  if (key.startsWith('serviceDescription.')) {
    const lang = key.split('.')[1] as 'en' | 'zh'
    return config.serviceDescription[lang] ?? ''
  }
  return ''
}

export type { BrandingConfig }
