import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Route } from "next";
import Logo from "@/components/logo";

interface LoginProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ callbackURL?: string }>;
}

export default async function Login({ params, searchParams }: LoginProps) {
  const { locale } = await params;
  const { callbackURL = `/${locale}/account` } = await searchParams;
  const dict = await getDictionary(locale);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    redirect(callbackURL as Route);
  }
  return (

    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex items-center justify-center">
        <Link href={`/${locale}`} >
          <Logo className="flex items-center flex-col gap-2 font-medium" />
        </Link>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{dict.pages.login.title}</CardTitle>
            <CardDescription>
              {dict.pages.login.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm locale={locale} callbackURL={callbackURL} />
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          {dict.common.agreeTerms} <Link href={`/${locale}/legal/terms`}>{dict.common.termsOfService}</Link>{" "}
          {dict.common.and} <Link href={`/${locale}/legal/privacy`}>{dict.common.privacyPolicy}</Link>.
        </FieldDescription>
      </div>
    </div>
  );
}
