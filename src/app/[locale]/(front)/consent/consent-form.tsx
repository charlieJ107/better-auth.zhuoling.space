"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, AlertCircle, Check } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

interface ConsentFormProps {
  clientName: string;
  scopes: string[];
  scopeDescriptions: Record<string, { displayName: string; description: string }>;
  dict: {
    title: string;
    description: string;
    applicationRequesting: string;
    thisWillAllow: string;
    scopeDescriptions: {
      openid?: string;
      profile?: string;
      email?: string;
      offline_access?: string;
    };
    authorize: string;
    deny: string;
    authorizing: string;
    denying: string;
    authorizationFailed: string;
  };
}

export function ConsentForm({ clientName, scopes, scopeDescriptions, dict }: ConsentFormProps) {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsent = async (accept: boolean) => {
    if (accept) {
      setIsAuthorizing(true);
    } else {
      setIsDenying(true);
    }
    setError(null);

    try {
      const res = await authClient.oauth2.consent({
        accept,
        scope: scopes.join(' '),
      });

      if (res.data?.redirect) {
        console.log('Redirecting to:', res.data.uri);
        window.location.href = res.data.uri;
      } else if (res.error) {
        console.error('Error authorizing consent:', res.error);
        setError(res.error.message ?? dict.authorizationFailed);
        setIsAuthorizing(false);
        setIsDenying(false);
      } else {
        console.error('No redirect or error found');
        setError(dict.authorizationFailed);
        setIsAuthorizing(false);
        setIsDenying(false);
      }
    } catch (err) {
      console.error('Error authorizing consent:', JSON.stringify(err, null, 2));
      setError(err instanceof Error ? err.message : dict.authorizationFailed);
      console.error('Error authorizing consent:', err);
      setIsAuthorizing(false);
      setIsDenying(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <ShieldCheck className="size-6" />
          </div>
        </div>
        <CardTitle className="text-xl">{dict.title}</CardTitle>
        <CardDescription>{dict.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Application Info */}
        {clientName && (
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm font-medium mb-1">{clientName}</p>
            <p className="text-xs text-muted-foreground">
              {dict.applicationRequesting}
            </p>
          </div>
        )}

        {/* Permissions List */}
        {scopes.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">{dict.thisWillAllow}</p>
            <ul className="space-y-2">
              {scopes.map((scopeItem) => {
                const scopeInfo = scopeDescriptions[scopeItem];
                return scopeInfo ? (
                  <li key={scopeItem} className="flex flex-col gap-1 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="size-4 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{scopeInfo.displayName}</div>
                        <div className="text-muted-foreground text-xs">{scopeInfo.description}</div>
                      </div>
                    </div>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm flex items-start gap-2">
            <AlertCircle className="size-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => handleConsent(true)}
            disabled={isAuthorizing || isDenying}
            className="w-full"
          >
            {isAuthorizing ? dict.authorizing : dict.authorize}
          </Button>
          <Button
            onClick={() => handleConsent(false)}
            disabled={isAuthorizing || isDenying}
            variant="outline"
            className="w-full"
          >
            {isDenying ? dict.denying : dict.deny}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

