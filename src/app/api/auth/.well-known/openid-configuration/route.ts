import { auth } from "@/lib/auth";
import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";

export const GET = oauthProviderOpenIdConfigMetadata(auth);