import { randomUUID } from "crypto";
/**
 * OAuth Client Management Utilities
 */

export interface OAuthClientApiDTO {
    id: string;
    name: string;
    clientId: string;
    clientSecret?: string;
    redirectURLs: string[];
    redirectURLsRaw?: string;
    type: string;
    disabled?: boolean;
    icon?: string;
    metadata?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Generate a unique client ID
 */
export function generateClientId(): string {
    // Generate a random string for client ID
    return randomUUID();
}

/**
 * Generate a secure client secret
 */
export function generateClientSecret(): string {
    // Generate a cryptographically secure random string
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate redirect URIs
 */
export function validateRedirectUris(uris: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(uris) || uris.length === 0) {
        errors.push('At least one redirect URI is required');
        return { valid: false, errors };
    }

    for (const uri of uris) {
        try {
            const url = new URL(uri);

            // Check if it's HTTPS (except for localhost)
            if (url.protocol === 'http:' && !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
                errors.push(`Redirect URI must use HTTP with localhost, but got ${url.protocol}`);
            }

            // Check for wildcards or patterns
            if (uri.includes('*') || uri.includes('?')) {
                errors.push(`Redirect URI cannot contain wildcards: ${uri}`);
            }

            // Check for fragment
            if (url.hash) {
                errors.push(`Redirect URI cannot contain fragments: ${uri}`);
            }

        } catch (error) {
            console.error(error);
            errors.push(`Invalid redirect URI format: ${uri}`);
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Parse redirect URIs from comma-separated string
 */
export function parseRedirectUris(redirectUris: string | string[]): string[] {
    if (Array.isArray(redirectUris)) {
        return redirectUris.map((uri) => uri.trim()).filter(Boolean);
    }

    return redirectUris
        .split(',')
        .map((uri) => uri.trim())
        .filter(Boolean);
}

/**
 * Format redirect URIs for display
 */
export function formatRedirectUris(redirectUris: string | string[]): string[] {
    return parseRedirectUris(redirectUris);
}
