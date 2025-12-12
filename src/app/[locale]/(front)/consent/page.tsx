import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Locale } from "@/lib/i18n";
import { ConsentForm } from "./consent-form";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";
import { getScopeDescription } from "@/lib/auth";
import Logo from "@/components/logo";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

interface ConsentPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    consent_code?: string;
    client_id?: string;
    scope?: string;
  }>;
}

function getClient(client_id: string) {
  return db.selectFrom('oauthApplication')
    .where('clientId', '=', client_id)
    .selectAll()
    .executeTakeFirst();
}

export default async function ConsentPage({ params, searchParams }: ConsentPageProps) {
  const { locale } = await params;
  const { consent_code, client_id, scope } = await searchParams;
  const dict = await getDictionary(locale);
  if (!client_id) {
    return notFound();
  }
  const client = await getClient(client_id);
  if (!client) {
    return notFound();
  }
  // Parse scopes from the scope parameter
  const scopes = scope ? scope.split(' ') : [];

  const scopeDescriptions = await Promise.all(scopes.map(async (scope) => {
    const scopeDescription = await getScopeDescription(scope, locale);
    if (scopeDescription) {
      return {
        name: scopeDescription.name,
        displayName: scopeDescription.displayName,
        description: scopeDescription.description,
      };
    } else {
      return {
        name: scope,
        displayName: scope,
        description: dict.pages.consent.scopeDescriptions[scope as keyof typeof dict.pages.consent.scopeDescriptions] || scope,
      };
    }
  }));

  const scopeDescriptionsObject: Record<string, { displayName: string; description: string }> = {};
  for (const scope of scopes) {
    const scopeDescription = scopeDescriptions.find((scopeDescription) => scopeDescription.name === scope);
    if (scopeDescription) {
      scopeDescriptionsObject[scope] = scopeDescription;
    } else {
      scopeDescriptionsObject[scope] = {
        displayName: scope,
        description: dict.pages.consent.scopeDescriptions[scope as keyof typeof dict.pages.consent.scopeDescriptions] || scope,
      };
    }
  }
  // Show error state if no consent_code is provided
  if (!consent_code) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex items-center justify-center">
            <Link href={`/${locale}`} >
              <Logo className="flex items-center gap-2" />
            </Link>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
                  <AlertCircle className="size-6" />
                </div>
              </div>
              <CardTitle className="text-xl">{dict.pages.consent.error}</CardTitle>
              <CardDescription>
                {dict.pages.consent.missingConsentCode}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/${locale}/login`}>
                  {dict.pages.consent.backToLogin}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 relative">

      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center justify-center">
          <Link href={`/${locale}`} className="flex items-center gap-2 font-medium">
            <Logo className="flex items-center gap-2 font-medium" />
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <ConsentForm
            clientName={client.name}
            consentCode={consent_code}
            clientId={client_id}
            scopes={scopes}
            scopeDescriptions={scopeDescriptionsObject}
            dict={dict.pages.consent}
          />
        </div>
      </div>
    </div>
  );
}
