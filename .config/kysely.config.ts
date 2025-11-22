import { PostgresDialect } from 'kysely'
import { defineConfig } from 'kysely-ctl'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL;
let pool: Pool;
if (databaseUrl) {
	pool = new Pool({
		connectionString: databaseUrl,
	});
} else {
	pool = new Pool({
		user: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
		host: process.env.DATABASE_HOST,
		port: parseInt(process.env.DATABASE_PORT || '5432'),
		database: process.env.DATABASE_NAME,
		ssl: process.env.DATABASE_USE_SSL === 'true' ? {
			rejectUnauthorized: false,
			ca: process.env.DATABASE_CA_CERT,
		} : false,
	});
}

export default defineConfig({
	// replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
	dialect: new PostgresDialect({
		pool: pool,
	}),
	migrations: {
		migrationFolder: "../migrations",
	},
	//   plugins: [],
	seeds: {
		seedFolder: "../seeds",
	}
})
