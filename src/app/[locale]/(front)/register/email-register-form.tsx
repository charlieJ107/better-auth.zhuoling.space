'use client';

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Locale } from "@/lib/i18n";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";
import { useState } from "react";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";

export function EmailRegisterForm({ locale }: { locale: Locale }) {
    const { t } = useTranslation(locale);
    const [error, setError] = useState<string | null>(null);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string | null;
        const email = formData.get('email') as string | null;
        const username = formData.get('username') as string | null;
        const password = formData.get('password') as string | null;
        const confirmPassword = formData.get('confirmPassword') as string | null;
        if (!name || !email || !username || !password || !confirmPassword) {
            setError(t('common.allFieldsRequired'));
            return;
        }
        if (password !== confirmPassword) {
            setError(t('common.passwordsDoNotMatch'));
            return;
        }
        const { data, error } = await authClient.signUp.email({
            name,
            email,
            username,
            password,
            displayUsername: name
        }, {
            onError: (ctx) => {
                console.error(ctx.error);
                setError(ctx.error.message || t('common.anErrorOccurred'));
            }
        });
        if (error) {
            console.error(error);
            switch (error.code) {
                //TODO
                case 'USERNAME_TOO_SHORT':
                    break;
                case 'USERNAME_TOO_LONG':
                    break;
                case "USERNAME_IS_ALREADY_TAKEN":
                    break;
                case "UNEXPECTED_ERROR":
                    break;

            }
            setError(error.message || t('common.anErrorOccurred'));
        }
        if (data) {
            // Email may include special characters, so we need to encode it
            redirect(`/${locale}/email-confirmation?email=${encodeURIComponent(data.user.email)}`);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                {error && (
                    <Alert variant="destructive">
                        <CircleAlert />
                        <AlertTitle>{t('common.errorTitle')}</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
                <Field>
                    <FieldLabel htmlFor="name">
                        {t('common.fullName')}
                    </FieldLabel>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder={t('pages.register.namePlaceholder')}
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="email">
                        {t('common.email')}
                    </FieldLabel>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t('pages.register.emailPlaceholder')}
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="username">
                        {t('common.username')}
                    </FieldLabel>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder={t('pages.register.usernamePlaceholder')}
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">
                        {t('common.password')}
                    </FieldLabel>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder={t('pages.register.passwordPlaceholder')}
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="confirmPassword">
                        {t('common.confirmPassword')}
                    </FieldLabel>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder={t('pages.register.confirmPasswordPlaceholder')}
                        required
                    />
                </Field>
                <Field>
                    <Button type="submit">
                        {t('common.createAccount')}
                    </Button>
                    <FieldDescription className="text-center">
                        {t('common.alreadyHaveAccount')} <Link href={`/${locale}/login`}>{t('common.signIn')}</Link>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}