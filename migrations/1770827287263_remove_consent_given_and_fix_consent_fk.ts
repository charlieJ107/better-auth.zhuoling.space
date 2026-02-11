import type { Kysely } from "kysely";

// `any` is required here since migrations should be frozen in time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
	// 1. Drop consentGiven column from oauthConsent
	await db.schema.alterTable("oauthConsent").dropColumn("consentGiven").execute();

	// 2. Delete orphan consent rows (clientId not in oauthClient)
	await db
		.deleteFrom("oauthConsent")
		.where("clientId", "not in", db.selectFrom("oauthClient").select("clientId"))
		.execute();

	// 3. Drop old FK (oauthApplication.clientId)
	await db
		.schema
		.alterTable("oauthConsent")
		.dropConstraint("oauthConsent_clientId_fkey")
		.execute();

	// 4. Add new FK → oauthClient.clientId
	await db
		.schema
		.alterTable("oauthConsent")
		.addForeignKeyConstraint(
			"oauthConsent_clientId_fkey",
			["clientId"],
			"oauthClient",
			["clientId"],
			(c) => c.onDelete("cascade"),
		)
		.execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
	// 1. Drop current FK (oauthClient.clientId)
	await db
		.schema
		.alterTable("oauthConsent")
		.dropConstraint("oauthConsent_clientId_fkey")
		.execute();

	// 2. Restore old FK → oauthApplication.clientId
	await db
		.schema
		.alterTable("oauthConsent")
		.addForeignKeyConstraint(
			"oauthConsent_clientId_fkey",
			["clientId"],
			"oauthApplication",
			["clientId"],
			(c) => c.onDelete("cascade"),
		)
		.execute();

	// 3. Delete orphan consent rows (clientId not in oauthApplication)
	await db
		.deleteFrom("oauthConsent")
		.where(
			"clientId",
			"not in",
			db.selectFrom("oauthApplication").select("clientId"),
		)
		.execute();

	// 4. Restore consentGiven column
	await db.schema.alterTable("oauthConsent").addColumn("consentGiven", "boolean").execute();
	await db.updateTable("oauthConsent").set({ consentGiven: true }).execute();
	await db.schema.alterTable("oauthConsent").alterColumn("consentGiven", (col) => col.setNotNull()).execute();
}
