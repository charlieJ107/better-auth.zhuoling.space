import { betterAuth, User, GenericEndpointContext } from "better-auth";
import { admin, anonymous, apiKey, Client, emailOTP, jwt, lastLoginMethod, magicLink, oidcProvider, organization, phoneNumber, twoFactor, username } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey"
import { sendEmailVerification, sendPasswordReset, sendMagicLink, sendOTP } from "./email";
import { Locale, locales } from "./i18n";
import { defaultLocale } from "./i18n/common";
import { db, pool } from "./db";
import { generateClientId, generateClientSecret } from "./oauth-clients";
import { getBrandingValue } from "./branding";



const appUrl = process.env.BETTER_AUTH_URL;
const appName = getBrandingValue('appName');
if (!appName || !appUrl) {
    throw new Error("APP_NAME or BETTER_AUTH_URL is not set");
}

export const trustedClients: (Client & { skipConsent?: boolean })[] = []

export const auth = betterAuth({
    appName: appName,
    baseURL: appUrl,
    database: pool,
    advanced: {
        database: {
            generateId: () => {
                return crypto.randomUUID();
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,

    },
    emailVerification: {
        enabled: true,
        sendOnSignUp: true,
        // Disable eslint no unused variables
        /* eslint-disable @typescript-eslint/no-unused-vars */
        sendVerificationEmail: async ({ user, url, token }: { user: User, url: string, token: string }, request?: Request) => {
            // Extract locale from request pathnames
            let locale: Locale = request?.url.split('/')[1] as Locale;
            if (locale && locales.includes(locale as Locale)) {
                locale = locale as Locale;
            } else {
                locale = defaultLocale;
            }
            await sendEmailVerification(user.email, url, {
                userName: user.name || undefined,
                locale: locale, // You can extract locale from request headers or user preferences
                appName: appName
            });
        },
        // Disable eslint no unused variables
        /* eslint-disable @typescript-eslint/no-unused-vars */
        sendResetPassword: async ({ user, url, token }: { user: User, url: string, token: string }, request: Request) => {
            let locale: Locale = request?.url.split('/')[1] as Locale;
            if (locale && locales.includes(locale as Locale)) {
                locale = locale as Locale;
            } else {
                locale = defaultLocale;
            }
            await sendPasswordReset(user.email, url, {
                userName: user.name || undefined,
                locale: locale, // You can extract locale from request headers or user preferences
                appName: appName
            });
        },
        // Disable eslint no unused variables
        /* eslint-disable @typescript-eslint/no-unused-vars */
        onPasswordReset: async ({ user }: { user: User }, request: Request) => {
            // your logic here
            console.log(`Password for user ${user.email} has been reset.`);
        },
    },
    disabledPaths: [
        "/token",
    ],
    plugins: [
        twoFactor(),
        username(),
        anonymous(),
        jwt(), // Make sure to add the JWT plugin
        phoneNumber({
            // Disable eslint no unused variables
            /* eslint-disable @typescript-eslint/no-unused-vars */
            sendOTP: ({ phoneNumber, code }, request) => {
                // TODO: Implement sending OTP code via SMS
            }
        }),
        magicLink({
            // Disable eslint no unused variables
            /* eslint-disable @typescript-eslint/no-unused-vars */
            sendMagicLink: async ({ email, token, url }, context?: GenericEndpointContext) => {
                let locale: Locale = context?.request?.url.split('/')[1] as Locale;
                if (locale && locales.includes(locale as Locale)) {
                    locale = locale as Locale;
                } else {
                    locale = defaultLocale;
                }
                await sendMagicLink(email, url, {
                    locale: locale, // You can extract locale from request headers or user preferences
                    appName: appName
                });
            }
        }),
        emailOTP({
            async sendVerificationOTP({ email, otp, type }, context?: GenericEndpointContext) {
                let locale: Locale = context?.request?.url.split('/')[1] as Locale;
                if (locale && locales.includes(locale as Locale)) {
                    locale = locale as Locale;
                } else {
                    locale = defaultLocale;
                }
                // Map better-auth OTP types to our email utility types
                const emailType = type === 'forget-password' ? 'password-reset' : type;
                await sendOTP(email, otp, emailType as 'sign-in' | 'email-verification' | 'password-reset', {
                    locale: locale, // You can extract locale from request headers or user preferences
                    appName: appName
                });
            },
        }),
        passkey(),
        admin({

        }),
        apiKey(),
        organization(),
        oidcProvider({
            metadata: {
                issuer: appUrl,
            },
            scopes: ["openid", "profile", "email", "offline_access"],
            useJWTPlugin: true, // Enable JWT plugin integration
            allowDynamicClientRegistration: false,
            loginPage: "/login",
            consentPage: "/consent",
            generateClientSecret,
            generateClientId,
            trustedClients,
        }),
        lastLoginMethod({
            storeInDatabase: true
        }),
    ]

})

export async function getScopeDescription(scope: string, locale: Locale) {
    const scopeDescription = await db.selectFrom('scopeDescription').where('name', '=', scope).where('locale', '=', locale).selectAll().execute();
    if (scopeDescription.length > 0) {
        return scopeDescription[0];
    } else {
        return null;
    }
}