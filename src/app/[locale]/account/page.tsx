import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Key, Users, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getDictionary } from "@/lib/i18n/server";
import { Locale } from "@/lib/i18n";
import { db } from "@/lib/db";
import { sql } from "kysely";

interface AccountDashboardProps {
  params: Promise<{ locale: Locale }>;
}

export default async function AccountDashboard({ params }: AccountDashboardProps) {
  const { locale } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const user = session.user;
  const dict = await getDictionary(locale);
  const t = dict.pages.account;
  const tCommon = dict.common;

  // Fetch user stats from database
  // Disable eslint no unused variables
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [
    totalLogins,
    lastSession,
    connectedApps,
    apiKeys,
    organizations,
    passkeys
  ] = await Promise.all([
    // Total logins - count all sessions for this user
    db.selectFrom('session')
      .select(sql`count(*)::int`.as('count'))
      .where('userId', '=', user.id)
      .$narrowType<{ count: number }>()
      .executeTakeFirst()
      .then(result => result?.count ?? 0),

    // Last login date - most recent session
    db.selectFrom('session')
      .select(['updatedAt'])
      .where('userId', '=', user.id)
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .executeTakeFirst()
      .then(result => result?.updatedAt ?? null),

    // Connected apps - count OAuth consents
    db.selectFrom('oauthConsent')
      .select(sql`count(*)::int`.as('count'))
      .where('userId', '=', user.id)
      .$narrowType<{ count: number }>()
      .executeTakeFirst()
      .then(result => result?.count ?? 0),

    // API keys count
    db.selectFrom('apikey')
      .select(sql`count(*)::int`.as('count'))
      .where('userId', '=', user.id)
      .where('enabled', '=', true)
      .$narrowType<{ count: number }>()
      .executeTakeFirst()
      .then(result => result?.count ?? 0),

    // Organizations - count memberships
    db.selectFrom('member')
      .select(sql`count(*)::int`.as('count'))
      .where('userId', '=', user.id)
      .$narrowType<{ count: number }>()
      .executeTakeFirst()
      .then(result => result?.count ?? 0),

    // Passkeys count
    db.selectFrom('passkey')
      .select(sql`count(*)::int`.as('count'))
      .where('userId', '=', user.id)
      .$narrowType<{ count: number }>()
      .executeTakeFirst()
      .then(result => result?.count ?? 0),
  ]);

  const memberSince = new Date(user.createdAt).toLocaleDateString(locale);
  const lastLogin = lastSession ? new Date(lastSession).toLocaleDateString(locale) : "Never";

  return (
    <main className="container mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t.welcome}, {user.name || user.email}!</h1>
        <p className="text-muted-foreground mt-2">{t.overview}</p>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.accountInfo}</CardTitle>
            <CardDescription>{t.yourAccountDetails}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.name}</span>
              <span className="text-sm">{user.name || "Not set"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{tCommon.email}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{user.email}</span>
                <Badge variant={user.emailVerified ? "default" : "secondary"}>
                  {user.emailVerified ? t.verified : t.unverified}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{tCommon.username}</span>
              <span className="text-sm">{user.username || "Not set"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.memberSince}</span>
              <span className="text-sm">{memberSince}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.lastLogin}</span>
              <span className="text-sm">{lastLogin}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.securitySettings}</CardTitle>
            <CardDescription>{t.yourSecuritySettings}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">{t.emailVerified}</span>
              </div>
              <Badge variant={user.emailVerified ? "default" : "destructive"}>
                {user.emailVerified ? t.verified : t.unverified}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">{t.phoneVerified}</span>
              </div>
              <Badge variant={user.phoneNumberVerified ? "default" : "secondary"}>
                {user.phoneNumberVerified ? t.verified : t.unverified}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">{t.twoFactor}</span>
              </div>
              <Badge variant={user.twoFactorEnabled ? "default" : "secondary"}>
                {user.twoFactorEnabled ? t.enabled : t.disabled}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span className="text-sm font-medium">{t.passkeys}</span>
              </div>
              <Badge variant="secondary">{passkeys}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t.quickActions}</CardTitle>
          <CardDescription>{t.manageYourAccount}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href={`/${locale}/account/info`}>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                {t.updateProfile}
              </Button>
            </Link>
            <Link href={`/${locale}/account/password`}>
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                {t.changePassword}
              </Button>
            </Link>
            <Link href={`/${locale}/account/api-keys`}>
              <Button variant="outline">
                <Key className="h-4 w-4 mr-2" />
                {t.apiKeys}
              </Button>
            </Link>
            <Button variant="outline" disabled>
              <Key className="h-4 w-4 mr-2" />
              {t.twoFactor}
            </Button>
            <Button variant="outline" disabled>
              <Key className="h-4 w-4 mr-2" />
              {t.passkeys}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
