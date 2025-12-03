import { sql, type Kysely } from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
	// up migration code goes here...
	// note: up migrations are mandatory. you must implement this function.
	// For more info, see: https://kysely.dev/docs/migrations

	// Better-Auth original sql: 
	// alter table "jwks" add column "expiresAt" timestamptz;
	// alter table "invitation" add column "createdAt" timestamptz default CURRENT_TIMESTAMP not null;
	// alter table "oauthApplication" add column "redirectUrls" text not null;
	await db.schema.alterTable('jwks').addColumn('expiresAt', 'timestamptz').execute();
	await db.schema.alterTable('invitation').addColumn('createdAt', 'timestamptz', (b) => b.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)).execute();
	await db.schema
		.alterTable('oauthApplication')
		.addColumn('redirectUrls', 'text')
		.execute();
	await db.updateTable('oauthApplication')
		.set({
			redirectUrls: sql`COALESCE("redirectUrls", "redirectURLs")`
		})
		.where('redirectUrls', 'is', null)
		.execute();
	await db.schema
		.alterTable('oauthApplication')
		.alterColumn('redirectUrls', (col) => col.setNotNull())
		.execute();
	await db.schema.alterTable('oauthApplication').dropColumn('redirectURLs').execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
	// down migration code goes here...
	// note: down migrations are optional. you can safely delete this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await db.schema.alterTable('jwks').dropColumn('expiresAt').execute();
	await db.schema.alterTable('invitation').dropColumn('createdAt').execute();
	await db.schema
		.alterTable('oauthApplication')
		.addColumn('redirectURLs', 'text')
		.execute();
	await db.updateTable('oauthApplication')
		.set({
			redirectURLs: sql`COALESCE("redirectURLs", "redirectUrls")`
		})
		.where('redirectURLs', 'is', null)
		.execute();
	await db.schema
		.alterTable('oauthApplication')
		.alterColumn('redirectURLs', (col) => col.setNotNull())
		.execute();
	await db.schema.alterTable('oauthApplication').dropColumn('redirectUrls').execute();

}
