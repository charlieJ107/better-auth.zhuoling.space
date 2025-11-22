import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";
import { ApiKeysManager, ApiKeysPageTexts, AccountDictionary } from "./api-keys-manager";

interface ApiKeysPageParams {
    params: Promise<{ locale: Locale }>;
}

export default async function ApiKeysPage({ params }: ApiKeysPageParams) {
    const { locale } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect(`/${locale}/login?callbackURL=/${locale}/account/api-keys`);
    }

    const dict = await getDictionary(locale);
    const accountDict = dict.pages.account as AccountDictionary;
    const apiKeysDict = accountDict.apiKeysPage as ApiKeysPageTexts;

    return (
        <main className="container mx-auto flex flex-col gap-6 px-4 py-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">{apiKeysDict.title}</h1>
                <p className="text-muted-foreground">{apiKeysDict.description}</p>
            </div>
            <ApiKeysManager
                locale={locale}
                dictionary={accountDict}
            />
        </main>
    );
}

