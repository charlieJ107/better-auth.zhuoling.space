import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Mail, ArrowLeft } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";
import { Locale } from "@/lib/i18n";
import Link from "next/link";
import { ResendEmail } from "./resend-email";
import Logo from "@/components/logo";

interface EmailConfirmationProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ email: string }>;
}

export default async function EmailConfirmation({ params, searchParams }: EmailConfirmationProps) {
  const { locale } = await params;
  const { email } = await searchParams;
  const dict = await getDictionary(locale);
  return (

    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex items-center justify-center">
        <Link href={`/${locale}`} >
          <Logo className="flex items-center gap-2" />
        </Link>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="size-8 text-primary" />
            </div>
            <CardTitle className="text-xl">{dict.pages.emailConfirmation.title}</CardTitle>
            <CardDescription>
              {dict.pages.emailConfirmation.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {dict.pages.emailConfirmation.checkEmail}
                  </p>
                </div>
              </Field>
              <Field>
                <ResendEmail locale={locale} email={email} />
              </Field>
              <Field>
                <FieldDescription className="text-center">
                  <Link href={`/${locale}/login`} className="flex items-center justify-center gap-2 text-sm underline-offset-4 hover:underline">
                    <ArrowLeft className="size-4" />
                    {dict.pages.emailConfirmation.backToLogin}
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          {dict.common.needHelp} <a href="#">{dict.common.gettingStartedGuide}</a> {dict.common.and} {dict.common.supportTeam}.
        </FieldDescription>
      </div>
    </div>
  );
}
