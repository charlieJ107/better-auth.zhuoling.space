import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { CheckCircle, ArrowRight, XCircle } from "lucide-react";
import { Locale } from "@/lib/i18n";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";
import Logo from "@/components/logo";

interface EmailConfirmedProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EmailConfirmed({ params, searchParams }: EmailConfirmedProps) {
  const { error } = await searchParams;
  const { locale } = await params;
  const dict = await getDictionary(locale);
  if (error) {
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
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="size-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl">
                {dict.pages.emailConfirmationFailed.title}
              </CardTitle>
              <CardDescription>
                {dict.pages.emailConfirmationFailed.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {error}
                    </p>
                  </div>
                </Field>
                <Field>
                  <Link href={`/${locale}/login`} className="block">
                    <Button className="w-full">
                      {dict.pages.emailConfirmed.loginNow}
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                </Field>
                <Field>
                  <FieldDescription className="text-center">
                    <Link href={`/${locale}`} className="text-sm underline-offset-4 hover:underline">
                      {dict.common.goToHomepage}
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  else {
    return (

      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center">
          <Link href={`/${locale}`} className="flex items-center gap-2 font-medium">
            <Logo className="size-6" />
            {dict.common.appName}
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">
                {dict.pages.emailConfirmed.title}
              </CardTitle>
              <CardDescription>
                {dict.pages.emailConfirmed.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {dict.pages.emailConfirmed.successMessage}
                    </p>
                  </div>
                </Field>
                <Field>
                  <Link href={`/${locale}/login`} className="block">
                    <Button className="w-full">
                      {dict.pages.emailConfirmed.loginNow}
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                </Field>
                <Field>
                  <FieldDescription className="text-center">
                    <Link href={`/${locale}`} className="text-sm underline-offset-4 hover:underline">
                      {dict.common.goToHomepage}
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
}
