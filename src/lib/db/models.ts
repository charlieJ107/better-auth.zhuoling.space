import { z } from "zod";

// User table schema
export const zUser = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  twoFactorEnabled: z.boolean().optional(),
  username: z.string().optional(),
  displayUsername: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  phoneNumber: z.string().optional(),
  phoneNumberVerified: z.boolean().optional(),
  role: z.string().optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.date().optional(),
  lastLoginMethod: z.string().optional(),
});

// Session table schema
export const zSession = z.object({
  id: z.string(),
  expiresAt: z.date(),
  token: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  userId: z.string(),
  impersonatedBy: z.string().optional(),
  activeOrganizationId: z.string().optional(),
});

// Account table schema
export const zAccount = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  accessTokenExpiresAt: z.date().optional(),
  refreshTokenExpiresAt: z.date().optional(),
  scope: z.string().optional(),
  password: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Verification table schema
export const zVerification = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// JWKS table schema
export const zJwks = z.object({
  id: z.string(),
  publicKey: z.string(),
  privateKey: z.string(),
  createdAt: z.date(),
});

// OAuth Application table schema
export const zOAuthApplication = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  metadata: z.string().optional(),
  clientId: z.string(),
  clientSecret: z.string().optional(),
  redirectUrls: z.string(), // Note: database column is redirectUrls (lowercase s) after migration
  type: z.string(),
  disabled: z.boolean().optional(),
  userId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// OAuth Access Token table schema
export const zOAuthAccessToken = z.object({
  id: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  accessTokenExpiresAt: z.date(),
  refreshTokenExpiresAt: z.date(),
  clientId: z.string(),
  userId: z.string().optional(),
  scopes: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// OAuth Consent table schema
export const zOAuthConsent = z.object({
  id: z.string(),
  clientId: z.string(),
  userId: z.string(),
  scopes: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  consentGiven: z.boolean(),
});

// Two Factor table schema
export const zTwoFactor = z.object({
  id: z.string(),
  secret: z.string(),
  backupCodes: z.string(),
  userId: z.string(),
});

// Passkey table schema
export const zPasskey = z.object({
  id: z.string(),
  name: z.string().optional(),
  publicKey: z.string(),
  userId: z.string(),
  credentialID: z.string(),
  counter: z.number(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().optional(),
  createdAt: z.date().optional(),
  aaguid: z.string().optional(),
});

// API Key table schema
export const zApiKey = z.object({
  id: z.string(),
  name: z.string().optional(),
  start: z.string().optional(),
  prefix: z.string().optional(),
  key: z.string(),
  userId: z.string(),
  refillInterval: z.number().optional(),
  refillAmount: z.number().optional(),
  lastRefillAt: z.date().optional(),
  enabled: z.boolean().optional(),
  rateLimitEnabled: z.boolean().optional(),
  rateLimitTimeWindow: z.number().optional(),
  rateLimitMax: z.number().optional(),
  requestCount: z.number().optional(),
  remaining: z.number().optional(),
  lastRequest: z.date().optional(),
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  permissions: z.string().optional(),
  metadata: z.string().optional(),
});

// Organization table schema
export const zOrganization = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().optional(),
  createdAt: z.date(),
  metadata: z.string().optional(),
});

// Member table schema
export const zMember = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.date(),
});

// Invitation table schema
export const zInvitation = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string().optional(),
  status: z.string(),
  expiresAt: z.date(),
  inviterId: z.string(),
});

export const zScopeDescription = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  locale: z.string(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports for TypeScript inference
export type User = z.infer<typeof zUser>;
export type Session = z.infer<typeof zSession>;
export type Account = z.infer<typeof zAccount>;
export type Verification = z.infer<typeof zVerification>;
export type Jwks = z.infer<typeof zJwks>;
export type OAuthApplication = z.infer<typeof zOAuthApplication>;
export type OAuthAccessToken = z.infer<typeof zOAuthAccessToken>;
export type OAuthConsent = z.infer<typeof zOAuthConsent>;
export type TwoFactor = z.infer<typeof zTwoFactor>;
export type Passkey = z.infer<typeof zPasskey>;
export type ApiKey = z.infer<typeof zApiKey>;
export type Organization = z.infer<typeof zOrganization>;
export type Member = z.infer<typeof zMember>;
export type Invitation = z.infer<typeof zInvitation>;
export type ScopeDescription = z.infer<typeof zScopeDescription>;