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


export const pool = new Pool({
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

export const db = new Kysely<z.infer<typeof zDatabase>>({
    dialect: new PostgresDialect({
        pool,
    }),
});