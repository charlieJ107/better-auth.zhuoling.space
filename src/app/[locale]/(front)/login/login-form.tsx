'use client';
import { Locale } from "@/lib/i18n";
import { FieldGroup, FieldDescription } from "@/components/ui/field";
import { Field } from "@/components/ui/field";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";
import { Route } from "next";


export function LoginForm({ locale, callbackURL }: { locale: Locale, callbackURL?: string }) {
    const { t } = useTranslation(locale);
    const [error, setError] = useState<React.ReactNode | null>(null);

    return (
        <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;
            const rememberMe = formData.get('rememberMe') as string;
            const { data, error } = await authClient.signIn.email({
                email,
                password,
                rememberMe: rememberMe === 'on',
            });
            if (error) {
                switch (error.code) {
                    case "INVALID_EMAIL_OR_PASSWORD":
                        setError(
                            <Alert variant="destructive">
                                <CircleAlert />
                                <AlertTitle>{t('common.errorTitle')}</AlertTitle>
                                <AlertDescription>{t('common.invalidEmailOrPassword')}</AlertDescription>
                            </Alert>
                        );
                        break;
                    case "EMAIL_NOT_VERIFIED":
                        setError(
                            <Alert variant="default">
                                <CircleAlert />
                                <AlertTitle>{t('common.emailNotVerified')}</AlertTitle>
                                <AlertDescription>
                                    {t('common.emailNotVerifiedDescription')} <br />
                                    <Button variant="outline" onClick={() => {
                                        authClient.sendVerificationEmail({
                                            email,
                                            callbackURL,
                                        });
                                        redirect(`/${locale}/email-confirmation?email=${email}`);
                                    }}>
                                        {t('common.resendEmail')}
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        );
                        break;
                    default:
                        setError(
                            <Alert variant="destructive">
                                <CircleAlert />
                                <AlertTitle>{t('common.errorTitle')}</AlertTitle>
                                <AlertDescription>{error.message || t('common.anErrorOccurred')}</AlertDescription>
                            </Alert>
                        );
                }
            }
            if (data) {
                if (callbackURL) {
                    redirect(callbackURL as Route);
                } else {
                    redirect(`/${locale}/account`);
                }
            }
        }}>
            <FieldGroup>
                {error && (
                    <Field>
                        {error}
                    </Field>
                )}
                <Field>
                    <FieldLabel htmlFor="email">{t('common.email')}</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder={t('pages.login.emailPlaceholder')}
                        required
                    />
                </Field>
                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">{t('common.password')}</FieldLabel>
                        <Link
                            href={`/${locale}/forgot-password`}
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            {t('common.forgotPassword')}
                        </Link>
                    </div>
                    <Input id="password" type="password" name="password" required />
                </Field>
                <Field>
                    <div className="flex items-center gap-2">
                        <Checkbox id="rememberMe" name="rememberMe" />
                        <FieldLabel htmlFor="rememberMe">{t('common.rememberMe')}</FieldLabel>
                    </div>
                </Field>
                <Field>
                    <Button type="submit">{t('common.login')}</Button>
                    <FieldDescription className="text-center">
                        {t('common.dontHaveAccount')} <Link href={`/${locale}/register`}>{t('common.signUp')}</Link>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}