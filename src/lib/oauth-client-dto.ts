import { z } from "zod";

export const OAUTH_CLIENT_NAME_MAX_LENGTH = 256;

export const tokenEndpointAuthMethodEnum = z.enum([
    "client_secret_basic",
    "client_secret_post",
    "none",
]);

export const grantTypeEnum = z.enum([
    "authorization_code",
    "password",
    "refresh_token",
    "implicit",
    "client_credentials",
    "urn:ietf:params:oauth:grant-type:jwt-bearer",
    "urn:ietf:params:oauth:grant-type:saml2-bearer",
]);

export const responseTypeEnum = z.enum(["code", "token"]);

const optionalUrlSchema = z
    .string()
    .trim()
    .optional()
    .refine((value) => {
        if (!value) return true;
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }, { message: "Invalid URL" })
    .transform((value) => (value ? value : undefined));

export const redirectUriSchema = z.url("Invalid URL");

export const redirectUriListSchema = z
    .array(redirectUriSchema)
    .min(1, "At least one redirect URI is required");

const contactsStringSchema = z
    .string()
    .trim()
    .optional()
    .refine((value) => {
        if (!value) return true;
        const emails = value
            .split(',')
            .map((email) => email.trim())
            .filter(Boolean);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emails.every((email) => emailRegex.test(email));
    }, { message: "Contacts must be comma-separated email addresses" })
    .transform((value) => value ?? "");

export const oauthClientCreateFormSchema = z.object({
    client_name: z
        .string()
        .trim()
        .min(1, "Client name is required")
        .max(
            OAUTH_CLIENT_NAME_MAX_LENGTH,
            `Client name must be less than ${OAUTH_CLIENT_NAME_MAX_LENGTH} characters`
        ),
    redirectUris: redirectUriListSchema,
    client_uri: optionalUrlSchema,
    logo_uri: optionalUrlSchema,
    scope: z.string().trim().min(1, "Scope is required"),
    contacts: contactsStringSchema,
    tos_uri: optionalUrlSchema,
    policy_uri: optionalUrlSchema,
});

export type OAuthClientCreateFormValues = z.infer<typeof oauthClientCreateFormSchema>;
export type OAuthClientCreateFormInput = z.input<typeof oauthClientCreateFormSchema>;

export const oauthClientCreateFormDefaults: OAuthClientCreateFormInput = {
    client_name: "",
    redirectUris: [""],
    client_uri: "",
    logo_uri: "",
    scope: "openid profile email offline_access openid",
    contacts: "",
    tos_uri: "",
    policy_uri: "",
};

export const registerOAuthClientPayloadSchema = z.object({
    client_name: z
        .string()
        .trim()
        .min(1, "Client name is required")
        .max(OAUTH_CLIENT_NAME_MAX_LENGTH, `Client name must be less than ${OAUTH_CLIENT_NAME_MAX_LENGTH} characters`),
    redirect_uris: redirectUriListSchema,
    token_endpoint_auth_method: tokenEndpointAuthMethodEnum.default("client_secret_basic"),
    grant_types: z.array(grantTypeEnum).min(1, "At least one grant type is required").default(["authorization_code"]),
    response_types: z.array(responseTypeEnum).min(1, "At least one response type is required").default(["code"]),
    client_uri: optionalUrlSchema,
    logo_uri: optionalUrlSchema,
    scope: z.string().trim().min(1).default("openid profile email"),
    contacts: z.array(z.email("Invalid contact email address")).default([]),
    tos_uri: optionalUrlSchema,
    policy_uri: optionalUrlSchema,
    jwks_uri: optionalUrlSchema,
    jwks: z.record(z.string(), z.string()).optional(),
});

export type RegisterOAuthClientPayload = z.infer<typeof registerOAuthClientPayloadSchema>;

export const oauthClientCreatedResponseSchema = z
    .object({
        client_id: z.string(),
        client_secret: z.string(),
        client_name: z.string(),
        redirect_uris: redirectUriListSchema,
        grant_types: z.array(grantTypeEnum),
        response_types: z.array(responseTypeEnum),
        token_endpoint_auth_method: tokenEndpointAuthMethodEnum,
        scope: z.string(),
    })
    .loose();

export type OAuthClientCreatedResponse = z.infer<typeof oauthClientCreatedResponseSchema>;

export const oauthClientTypeEnum = z.enum(["web", "public", "mobile"]);

export const oauthClientUpdateFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Client name is required")
        .max(
            OAUTH_CLIENT_NAME_MAX_LENGTH,
            `Client name must be less than ${OAUTH_CLIENT_NAME_MAX_LENGTH} characters`
        ),
    redirectUris: redirectUriListSchema,
    icon: optionalUrlSchema,
    disabled: z.boolean().default(false),
    type: oauthClientTypeEnum,
});

export type OAuthClientUpdateFormValues = z.infer<typeof oauthClientUpdateFormSchema>;
export type OAuthClientUpdateFormInput = z.input<typeof oauthClientUpdateFormSchema>;

export const oauthClientUpdateFormDefaults: OAuthClientUpdateFormInput = {
    name: "",
    redirectUris: [""],
    icon: "",
    disabled: false,
    type: "web" as const,
};

export const updateOAuthClientRequestSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Client name is required")
        .max(OAUTH_CLIENT_NAME_MAX_LENGTH, `Client name must be less than ${OAUTH_CLIENT_NAME_MAX_LENGTH} characters`),
    redirectURLs: redirectUriListSchema,
    icon: optionalUrlSchema,
    metadata: z.string().trim().optional(),
    disabled: z.boolean().optional(),
    type: oauthClientTypeEnum.optional(),
});

export type UpdateOAuthClientRequest = z.infer<typeof updateOAuthClientRequestSchema>;

export const oauthClientAdminResponseSchema = z
    .object({
        id: z.string(),
        name: z.string().nullable(),
        clientId: z.string(),
        clientSecret: z.string().nullable().optional(),
        redirectURLs: redirectUriListSchema.default([]),
        redirectURLsRaw: z.string().nullable().optional(),
        type: z.string(),
        disabled: z.boolean().nullable().optional(),
        icon: optionalUrlSchema,
        metadata: z.string().nullable().optional(),
        createdAt: z.union([z.string(), z.date()]),
        updatedAt: z.union([z.string(), z.date()]),
    })
    .loose();

export type OAuthClientAdminResponse = z.infer<typeof oauthClientAdminResponseSchema>;

export function normalizeOptionalInput(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

export function parseContactsString(contacts?: string | null): string[] {
    if (!contacts) return [];
    return contacts
        .split(',')
        .map((contact) => contact.trim())
        .filter(Boolean);
}

export function normalizeRedirectUris(uris: string[]): string[] {
    return Array.from(new Set(uris.map((uri) => uri.trim()))).filter(Boolean);
}

export function buildRegisterOAuthClientPayload(
    form: OAuthClientCreateFormValues,
    overrides?: Partial<RegisterOAuthClientPayload>
): RegisterOAuthClientPayload {
    const payload = {
        client_name: form.client_name.trim(),
        redirect_uris: normalizeRedirectUris(form.redirectUris),
        token_endpoint_auth_method: overrides?.token_endpoint_auth_method ?? "client_secret_basic",
        grant_types: overrides?.grant_types ?? ["authorization_code"],
        response_types: overrides?.response_types ?? ["code"],
        client_uri: normalizeOptionalInput(form.client_uri),
        logo_uri: normalizeOptionalInput(form.logo_uri),
        scope: (overrides?.scope ?? form.scope ?? "openid profile email").trim(),
        contacts: overrides?.contacts ?? parseContactsString(form.contacts),
        tos_uri: normalizeOptionalInput(form.tos_uri),
        policy_uri: normalizeOptionalInput(form.policy_uri),
        jwks_uri: overrides?.jwks_uri ?? undefined,
        jwks: overrides?.jwks,
    } satisfies Partial<RegisterOAuthClientPayload>;

    return registerOAuthClientPayloadSchema.parse({
        ...payload,
        ...overrides,
    });
}

export function buildUpdateOAuthClientRequest(
    form: OAuthClientUpdateFormValues,
    overrides?: Partial<UpdateOAuthClientRequest>
): UpdateOAuthClientRequest {
    const payload = {
        name: form.name.trim(),
        redirectURLs: normalizeRedirectUris(form.redirectUris),
        icon: normalizeOptionalInput(form.icon),
        disabled: form.disabled,
        type: form.type,
        metadata: overrides?.metadata,
    } satisfies Partial<UpdateOAuthClientRequest>;

    return updateOAuthClientRequestSchema.parse({
        ...payload,
        ...overrides,
    });
}

export function ensureAtLeastOneRedirectUri(values: string[]): string[] {
    if (!values.length) {
        return [""];
    }
    return values;
}


