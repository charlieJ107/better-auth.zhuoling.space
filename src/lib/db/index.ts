import { z } from "zod";
import {
    zUser,
    zSession,
    zAccount,
    zVerification,
    zJwks,
    zOAuthApplication,
    zOAuthAccessToken,
    zOAuthConsent,
    zTwoFactor,
    zPasskey,
    zApiKey,
    zOrganization,
    zMember,
    zInvitation,
    zScopeDescription
} from "./models";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { type PoolConfig } from "pg";


export const zDatabase = z.object({
    user: zUser,
    session: zSession,
    account: zAccount,
    verification: zVerification,
    jwks: zJwks,
    oauthApplication: zOAuthApplication,
    oauthAccessToken: zOAuthAccessToken,
    oauthConsent: zOAuthConsent,
    twoFactor: zTwoFactor,
    passkey: zPasskey,
    apikey: zApiKey,
    organization: zOrganization,
    member: zMember,
    invitation: zInvitation,
    scopeDescription: zScopeDescription,
});

const databaseUrl = process.env.DATABASE_URL;
let poolConfig: PoolConfig | undefined = undefined;
if (databaseUrl) {
    poolConfig = {
        connectionString: databaseUrl,
    };
} else {
    if (!process.env.DATABASE_USER || !process.env.DATABASE_PASSWORD || !process.env.DATABASE_HOST || !process.env.DATABASE_PORT || !process.env.DATABASE_NAME) {
        console.error("DATABASE_USER, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME is not set. \n If this is in build time would be ok, but if this is in run time, it will cause an error.");
    }
    if (process.env.DATABASE_USE_SSL === 'true' && !process.env.DATABASE_CA_CERT) {
        console.error("DATABASE_CA_CERT is not set. \n If this is in build time would be ok, but if this is in run time, it will cause an error.");
    }
    poolConfig = {
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        database: process.env.DATABASE_NAME,
        ssl: process.env.DATABASE_USE_SSL === 'true' ? {
            rejectUnauthorized: false,
            ca: process.env.DATABASE_CA_CERT,
        } : false,
    };
}

if (!poolConfig) {
    throw new Error("Error initializing database pool");
}
export const pool = new Pool(poolConfig);

export const db = new Kysely<z.infer<typeof zDatabase>>({
    dialect: new PostgresDialect({
        pool,
    }),
});