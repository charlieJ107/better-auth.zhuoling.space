import { createAuthClient } from "better-auth/react"
import { adminClient, apiKeyClient,anonymousClient, usernameClient, phoneNumberClient, emailOTPClient, magicLinkClient, twoFactorClient, jwtClient, lastLoginMethodClient, organizationClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { ssoClient } from "@better-auth/sso/client"
import { oauthProviderClient } from "@better-auth/oauth-provider/client"
export const authClient = createAuthClient({
    plugins: [
        oauthProviderClient(),
        adminClient(),
        apiKeyClient(),
        anonymousClient(),
        usernameClient(),
        phoneNumberClient(),
        emailOTPClient(),
        magicLinkClient(),
        twoFactorClient(),
        passkeyClient(),
        jwtClient(),
        lastLoginMethodClient(),
        organizationClient(),
        ssoClient()
    ]
})