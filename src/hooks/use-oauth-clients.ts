"use client";

import useSWR from "swr";
import { authClient } from "@/lib/auth-client";

const OAUTH_CLIENTS_KEY = "oauth-clients";

async function fetchOAuthClients(): Promise<OAuthClientRow[]> {
  const result = await authClient.oauth2.getClients();
  if (result.error) {
    throw new Error(result.error.message ?? "Failed to fetch OAuth clients");
  }
  const list = result.data ?? [];
  return Array.isArray(list) ? list : [];
}

/** OAuth client row as returned by the provider (snake_case) plus optional DB fields */
export interface OAuthClientRow {
  client_id: string;
  client_secret?: string;
  client_name?: string;
  client_uri?: string;
  logo_uri?: string;
  redirect_uris: string[];
  scope?: string;
  type?: "web" | "native" | "user-agent-based";
  public?: boolean;
  disabled?: boolean;
  [key: string]: unknown;
}

export function useOAuthClients() {
  const { data, error, isLoading, mutate } = useSWR(
    OAUTH_CLIENTS_KEY,
    fetchOAuthClients,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    clients: data ?? [],
    isLoading,
    error: error?.message ?? null,
    mutate,
  };
}
