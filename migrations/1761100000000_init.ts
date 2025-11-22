import type { Kysely } from 'kysely'
import { sql } from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
	// Create user table
	await db.schema
		.createTable('user')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('email', 'text', (col) => col.notNull().unique())
		.addColumn('emailVerified', 'boolean', (col) => col.notNull())
		.addColumn('image', 'text')
		.addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn('twoFactorEnabled', 'boolean')
		.addColumn('username', 'text', (col) => col.unique())
		.addColumn('displayUsername', 'text')
		.addColumn('isAnonymous', 'boolean')
		.addColumn('phoneNumber', 'text', (col) => col.unique())
		.addColumn('phoneNumberVerified', 'boolean')
		.addColumn('role', 'text')
		.addColumn('banned', 'boolean')
		.addColumn('banReason', 'text')
		.addColumn('banExpires', 'timestamptz')
		.addColumn('lastLoginMethod', 'text')
		.execute()

	// Create session table
	await db.schema
		.createTable('session')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('expiresAt', 'timestamptz', (col) => col.notNull())
		.addColumn('token', 'text', (col) => col.notNull().unique())
		.addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn('updatedAt', 'timestamptz', (col) => col.notNull())
		.addColumn('ipAddress', 'text')
		.addColumn('userAgent', 'text')
		.addColumn('userId', 'text', (col) => col.notNull().references('user.id').onDelete('cascade'))
		.addColumn('impersonatedBy', 'text')
		.addColumn('activeOrganizationId', 'text')
		.execute()

	// Create account table
	await db.schema
		.createTable('account')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('accountId', 'text', (col) => col.notNull())
		.addColumn('providerId', 'text', (col) => col.notNull())
		.addColumn('userId', 'text', (col) => col.notNull().references('user.id').onDelete('cascade'))
		.addColumn('accessToken', 'text')
		.addColumn('refreshToken', 'text')
		.addColumn('idToken', 'text')
		.addColumn('accessTokenExpiresAt', 'timestamptz')
		.addColumn('refreshTokenExpiresAt', 'timestamptz')
		.addColumn('scope', 'text')
		.addColumn('password', 'text')
		.addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn('updatedAt', 'timestamptz', (col) => col.notNull())
		.execute()

	// Create verification table
	await db.schema
		.createTable('verification')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('identifier', 'text', (col) => col.notNull())
		.addColumn('value', 'text', (col) => col.notNull())
		.addColumn('expiresAt', 'timestamptz', (col) => col.notNull())
		.addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute()

	// Create twoFactor table
	await db.schema
		.createTable('twoFactor')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('secret', 'text', (col) => col.notNull())
		.addColumn('backupCodes', 'text', (col) => col.notNull())
		.addColumn('userId', 'text', (col) => col.notNull().references('user.id').onDelete('cascade'))
		.execute()

	// Create jwks table
	await db.schema
		.createTable('jwks')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('publicKey', 'text', (col) => col.notNull())
		.addColumn('privateKey', 'text', (col) => col.notNull())
		.addColumn('createdAt', 'timestamptz', (col) => col.notNull())
		.execute()

	// Create passkey table
	await db.schema
		.createTable('passkey')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('name', 'text')
		.addColumn('publicKey', 'text', (col) => col.notNull())
		.addColumn('userId', 'text', (col) => col.notNull().references('user.id').onDelete('cascade'))
		.addColumn('credentialID', 'text', (col) => col.notNull())
		.addColumn('counter', 'integer', (col) => col.notNull())
		.addColumn('deviceType', 'text', (col) => col.notNull())
		.addColumn('backedUp', 'boolean', (col) => col.notNull())
		.addColumn('transports', 'text')
		.addColumn('createdAt', 'timestamptz')
		.addColumn('aaguid', 'text')
		.execute()

	// Create apikey table
	await db.schema
		.createTable('apikey')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('name', 'text')
		.addColumn('start', 'text')
		.addColumn('prefix', 'text')
		.addColumn('key', 'text', (col) => col.notNull())
		.addColumn('userId', 'text', (col) => col.notNull().references('user.id').onDelete('cascade'))
		.addColumn('refillInterval', 'integer')
		.addColumn('refillAmount', 'integer')
		.addColumn('lastRefillAt', 'timestamptz')
		.addColumn('enabled', 'boolean')
		.addColumn('rateLimitEnabled', 'boolean')
		.addColumn('rateLimitTimeWindow', 'integer')
		.addColumn('rateLimitMax', 'integer')
		.addColumn('requestCount', 'integer')
		.addColumn('remaining', 'integer')
		.addColumn('lastRequest', 'timestamptz')
		.addColumn('expiresAt', 'timestamptz')
		.addColumn('createdAt', 'timestamptz', (col) => col.notNull())
		.addColumn('updatedAt', 'timestamptz', (col) => col.notNull())
		.addColumn('permissions', 'text')
		.addColumn('metadata', 'text')
		.execute()

	// Create organization table
	await db.schema
		.createTable('organization')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('slug', 'text', (col) => col.notNull().unique())
		.addColumn('logo', 'text')
		.addColumn('createdAt', 'timestamptz', (col) => col.notNull())
		.addColumn('metadata', 'text')
		.execute()

	// Create member table
	await db.schema
		.createTable('member')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('organizationId', 'text', (col) => col.notNull().references('organization.id').onDelete('cascade'))
		.addColumn('userId', 'text', (col) => col.notNull().references('user.id').onDelete('cascade'))
		.addColumn('role', 'text', (col) => col.notNull())
		.addColumn('createdAt', 'timestamptz', (col) => col.notNull())
		.execute()

	// Create invitation table
	await db.schema
		.createTable('invitation')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('organizationId', 'text', (col) => col.notNull().references('organization.id').onDelete('cascade'))
		.addColumn('email', 'text', (col) => col.notNull())
		.addColumn('role', 'text')
		.addColumn('status', 'text', (col) => col.notNull())
		.addColumn('expiresAt', 'timestamptz', (col) => col.notNull())
		.addColumn('inviterId', 'text', (col) => col.notNull().references('user.id').onDelete('cascade'))
		.execute()

	// Create oauthApplication table
	await db.schema
		.createTable('oauthApplication')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('icon', 'text')
		.addColumn('metadata', 'text')
		.addColumn('clientId', 'text', (col) => col.notNull().unique())
		.addColumn('clientSecret', 'text')
		.addColumn('redirectURLs', 'text', (col) => col.notNull())
		.addColumn('type', 'text', (col) => col.notNull())
		.addColumn('disabled', 'boolean')
		.addColumn('userId', 'text', (col) => col.references('user.id').onDelete('cascade'))
		.addColumn('createdAt', 'timestamptz', (col) => col.notNull())
		.addColumn('updatedAt', 'timestamptz', (col) => col.notNull())
		.execute()

	// Create oauthAccessToken table
	await db.schema
		.createTable('oauthAccessToken')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('accessToken', 'text', (col) => col.notNull().unique())
		.addColumn('refreshToken', 'text', (col) => col.notNull().unique())
		.addColumn('accessTokenExpiresAt', 'timestamptz', (col) => col.notNull())
		.addColumn('refreshTokenExpiresAt', 'timestamptz', (col) => col.notNull())
		.addColumn('clientId', 'text', (col) => col.notNull().references('oauthApplication.clientId').onDelete('cascade'))
		.addColumn('userId', 'text', (col) => col.references('user.id').onDelete('cascade'))
		.addColumn('scopes', 'text', (col) => col.notNull())
		.addColumn('createdAt', 'timestamptz', (col) => col.notNull())
		.addColumn('updatedAt', 'timestamptz', (col) => col.notNull())
		.execute()

	// Create oauthConsent table
	await db.schema
		.createTable('oauthConsent')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('clientId', 'text', (col) => col.notNull().references('oauthApplication.clientId').onDelete('cascade'))
		.addColumn('userId', 'text', (col) => col.notNull().references('user.id').onDelete('cascade'))
		.addColumn('scopes', 'text', (col) => col.notNull())
		.addColumn('createdAt', 'timestamptz', (col) => col.notNull())
		.addColumn('updatedAt', 'timestamptz', (col) => col.notNull())
		.addColumn('consentGiven', 'boolean', (col) => col.notNull())
		.execute()

	// Create scopeDescription table
	await db.schema
		.createTable('scopeDescription')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('displayName', 'text', (col) => col.notNull())
		.addColumn('locale', 'text', (col) => col.notNull())
		.addColumn('description', 'text', (col) => col.notNull())
		.addColumn('createdAt', 'timestamptz', (col) => col.notNull())
		.addColumn('updatedAt', 'timestamptz', (col) => col.notNull())
		.execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
	// Drop tables in reverse order to handle foreign key constraints
	await db.schema.dropTable('oauthConsent').execute()
	await db.schema.dropTable('oauthAccessToken').execute()
	await db.schema.dropTable('oauthApplication').execute()
	await db.schema.dropTable('invitation').execute()
	await db.schema.dropTable('member').execute()
	await db.schema.dropTable('organization').execute()
	await db.schema.dropTable('apikey').execute()
	await db.schema.dropTable('passkey').execute()
	await db.schema.dropTable('jwks').execute()
	await db.schema.dropTable('twoFactor').execute()
	await db.schema.dropTable('verification').execute()
	await db.schema.dropTable('account').execute()
	await db.schema.dropTable('session').execute()
	await db.schema.dropTable('user').execute()
	await db.schema.dropTable('scopeDescription').execute()
}
