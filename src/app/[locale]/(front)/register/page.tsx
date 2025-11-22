
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";
import Link from "next/link";
import { EmailRegisterForm } from "./email-register-form";
import Logo from "@/components/logo";

interface RegisterProps {
  params: Promise<{ locale: Locale }>;
}

export default async function Register({ params }: RegisterProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex items-center justify-center">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-medium">
          <Logo className="size-10" />
          {dict.common.appName}
        </Link>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {dict.pages.register.title}
            </CardTitle>
            <CardDescription>
              {dict.pages.register.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailRegisterForm locale={locale} />
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          {dict.common.agreeTermsRegister} <Link href={`/${locale}/legal/terms`}>{dict.common.termsOfService}</Link>{" "}
          {dict.common.and} <Link href={`/${locale}/legal/privacy`}>{dict.common.privacyPolicy}</Link>.
        </FieldDescription>
      </div>
    </div>
  );
}
