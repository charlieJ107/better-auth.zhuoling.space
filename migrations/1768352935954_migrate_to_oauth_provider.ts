import { type Kysely } from "kysely";
import { sql } from "kysely";

/**
 * Migrate from OIDC Provider (better-auth/plugins) to OAuth Provider (@better-auth/oauth-provider).
 *
 * Drops old OIDC tables and creates new OAuth Provider tables. Old data is discarded;
 * you can restore from backup if needed.
 *
 * Old tables (dropped in up) match the OIDC Provider Schema section:
 * https://better-auth.com/docs/plugins/oidc-provider.mdx#schema
 * - oauthApplication (id, clientId, clientSecret, name, redirectUrls, metadata, type, disabled, userId, createdAt, updatedAt; this project also had icon)
 * - oauthAccessToken (id, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt, clientId, userId, scopes, createdAt, updatedAt)
 * - oauthConsent (id, userId, clientId, scopes, consentGiven, createdAt, updatedAt)
 *
 * New tables follow @better-auth/oauth-provider plugin schema (oauthClient, oauthRefreshToken, oauthAccessToken, oauthConsent).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
	// 1. Drop old OIDC provider tables per docs (order: dependents first for FK constraints)
	await db.schema.dropTable("oauthConsent").ifExists().execute();
	await db.schema.dropTable("oauthAccessToken").ifExists().execute();
	await db.schema.dropTable("oauthApplication").ifExists().execute();

	// 2. Create new OAuth Provider plugin tables

	// oauthClient (replaces oauthApplication)
	await db.schema
		.createTable("oauthClient")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("clientId", "text", (col) => col.notNull().unique())
		.addColumn("clientSecret", "text")
		.addColumn("disabled", "boolean", (col) => col.defaultTo(false))
		.addColumn("skipConsent", "boolean")
		.addColumn("enableEndSession", "boolean")
		.addColumn("scopes", "jsonb")
		.addColumn("userId", "text", (col) => col.references("user.id").onDelete("cascade"))
		.addColumn("createdAt", "timestamptz", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn("updatedAt", "timestamptz", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn("name", "text")
		.addColumn("uri", "text")
		.addColumn("icon", "text")
		.addColumn("contacts", "jsonb")
		.addColumn("tos", "text")
		.addColumn("policy", "text")
		.addColumn("softwareId", "text")
		.addColumn("softwareVersion", "text")
		.addColumn("softwareStatement", "text")
		.addColumn("redirectUris", "jsonb", (col) => col.notNull())
		.addColumn("postLogoutRedirectUris", "jsonb")
		.addColumn("tokenEndpointAuthMethod", "text")
		.addColumn("grantTypes", "jsonb")
		.addColumn("responseTypes", "jsonb")
		.addColumn("public", "boolean")
		.addColumn("type", "text")
		.addColumn("referenceId", "text")
		.addColumn("metadata", "jsonb")
		.execute();

	// oauthRefreshToken
	await db.schema
		.createTable("oauthRefreshToken")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("token", "text", (col) => col.notNull())
		.addColumn("clientId", "text", (col) => col.notNull().references("oauthClient.clientId").onDelete("cascade"))
		.addColumn("sessionId", "text", (col) => col.references("session.id").onDelete("set null"))
		.addColumn("userId", "text", (col) => col.notNull().references("user.id").onDelete("cascade"))
		.addColumn("referenceId", "text")
		.addColumn("expiresAt", "timestamptz", (col) => col.notNull())
		.addColumn("createdAt", "timestamptz", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn("revoked", "timestamptz")
		.addColumn("scopes", "jsonb", (col) => col.notNull())
		.execute();

	// oauthAccessToken (new structure)
	await db.schema
		.createTable("oauthAccessToken")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("token", "text", (col) => col.notNull().unique())
		.addColumn("clientId", "text", (col) => col.notNull().references("oauthClient.clientId").onDelete("cascade"))
		.addColumn("sessionId", "text", (col) => col.references("session.id").onDelete("set null"))
		.addColumn("userId", "text", (col) => col.references("user.id").onDelete("cascade"))
		.addColumn("referenceId", "text")
		.addColumn("refreshId", "text", (col) => col.references("oauthRefreshToken.id").onDelete("set null"))
		.addColumn("expiresAt", "timestamptz", (col) => col.notNull())
		.addColumn("createdAt", "timestamptz", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn("scopes", "jsonb", (col) => col.notNull())
		.execute();

	// oauthConsent (new structure)
	await db.schema
		.createTable("oauthConsent")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("clientId", "text", (col) => col.notNull().references("oauthClient.clientId").onDelete("cascade"))
		.addColumn("userId", "text", (col) => col.references("user.id").onDelete("cascade"))
		.addColumn("referenceId", "text")
		.addColumn("scopes", "jsonb", (col) => col.notNull())
		.addColumn("createdAt", "timestamptz", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn("updatedAt", "timestamptz", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
	// Drop new OAuth Provider tables (reverse order of creation)
	await db.schema.dropTable("oauthConsent").ifExists().execute();
	await db.schema.dropTable("oauthAccessToken").ifExists().execute();
	await db.schema.dropTable("oauthRefreshToken").ifExists().execute();
	await db.schema.dropTable("oauthClient").ifExists().execute();

	// Recreate old OIDC provider tables (empty; restore data from backup if needed)
	await db.schema
		.createTable("oauthApplication")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("name", "text", (col) => col.notNull())
		.addColumn("icon", "text")
		.addColumn("metadata", "text")
		.addColumn("clientId", "text", (col) => col.notNull().unique())
		.addColumn("clientSecret", "text")
		.addColumn("redirectUrls", "text", (col) => col.notNull())
		.addColumn("type", "text", (col) => col.notNull())
		.addColumn("disabled", "boolean")
		.addColumn("userId", "text", (col) => col.references("user.id").onDelete("cascade"))
		.addColumn("createdAt", "timestamptz", (col) => col.notNull())
		.addColumn("updatedAt", "timestamptz", (col) => col.notNull())
		.execute();

	await db.schema
		.createTable("oauthAccessToken")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("accessToken", "text", (col) => col.notNull().unique())
		.addColumn("refreshToken", "text", (col) => col.notNull().unique())
		.addColumn("accessTokenExpiresAt", "timestamptz", (col) => col.notNull())
		.addColumn("refreshTokenExpiresAt", "timestamptz", (col) => col.notNull())
		.addColumn("clientId", "text", (col) => col.notNull().references("oauthApplication.clientId").onDelete("cascade"))
		.addColumn("userId", "text", (col) => col.references("user.id").onDelete("cascade"))
		.addColumn("scopes", "text", (col) => col.notNull())
		.addColumn("createdAt", "timestamptz", (col) => col.notNull())
		.addColumn("updatedAt", "timestamptz", (col) => col.notNull())
		.execute();

	await db.schema
		.createTable("oauthConsent")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("clientId", "text", (col) => col.notNull().references("oauthApplication.clientId").onDelete("cascade"))
		.addColumn("userId", "text", (col) => col.notNull().references("user.id").onDelete("cascade"))
		.addColumn("scopes", "text", (col) => col.notNull())
		.addColumn("createdAt", "timestamptz", (col) => col.notNull())
		.addColumn("updatedAt", "timestamptz", (col) => col.notNull())
		.addColumn("consentGiven", "boolean", (col) => col.notNull())
		.execute();
}
