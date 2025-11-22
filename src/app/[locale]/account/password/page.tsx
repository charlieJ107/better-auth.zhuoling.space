import { getDictionary } from "@/lib/i18n/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Shield } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ChangePasswordForm } from "./change-password-form";

export default async function AccountPassword({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect(`/${locale}/login?callbackURL=/${locale}/account/password`);
  }

  const dict = await getDictionary(locale);

  return (
    <main className="container mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{dict.pages.account.changePassword}</h1>
        <p className="text-muted-foreground mt-2">Update your account password</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Password Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {dict.pages.account.changePassword}
              </CardTitle>
              <CardDescription>
                Change your account password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm locale={locale} />
            </CardContent>
          </Card>
        </div>

        {/* Security Tips */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Password Security Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm">Use a combination of uppercase and lowercase letters</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm">Include numbers and special characters</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm">Make it at least 8 characters long</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm">Avoid using personal information</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm">Don&apos;t reuse passwords from other accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/${locale}/account/info`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Lock className="h-4 w-4 mr-2" />
                Enable Two-Factor Auth
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Lock className="h-4 w-4 mr-2" />
                Manage Passkeys
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}