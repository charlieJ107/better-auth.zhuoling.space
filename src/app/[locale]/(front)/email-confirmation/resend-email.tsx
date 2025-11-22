'use client';

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/client";
import { Locale } from "@/lib/i18n";
import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, CircleAlert } from "lucide-react";
import { useState } from "react";
import { ErrorContext } from "better-auth/react";

export function ResendEmail({ locale, email }: { locale: Locale, email: string }) {
    const { t } = useTranslation(locale);
    const [error, setError] = useState<string | null>(null);
    const [resendSuccess, setResendSuccess] = useState(false);

    const handleResendEmail = async () => {

        const callbackURL = "/email-confirmed"
        const { error } = await authClient.sendVerificationEmail({
            email,
            callbackURL
        }, {
            onError: (ctx: ErrorContext) => {
                console.error(ctx.error);
                setError(ctx.error.message || t('common.anErrorOccurred'));
            }
        });
        if (error) {
            console.error(error);
            setError(error.message || t('common.anErrorOccurred'));
        } else {
            setResendSuccess(true);
        }
    }

    return (
        <>
            <Button className="w-full" variant="outline" onClick={handleResendEmail}>
                {t('pages.emailConfirmation.resendEmail')}
            </Button>
            {error && (
                <Alert variant="destructive">
                    <CircleAlert />
                    <AlertTitle>{t('common.errorTitle')}</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            )}
            {resendSuccess && (
                <Alert variant="default">
                    <CheckCircle />
                    <AlertTitle>{t('common.successTitle')}</AlertTitle>
                    <AlertDescription>
                        {t('common.emailResent')}
                    </AlertDescription>
                </Alert>
            )}
        </>
    )
}