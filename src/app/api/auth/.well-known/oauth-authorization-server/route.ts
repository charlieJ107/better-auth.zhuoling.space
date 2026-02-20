import { auth } from "@/lib/auth";
import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";

export const GET = oauthProviderAuthServerMetadata(auth);