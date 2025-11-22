import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/server";
import { Locale } from "@/lib/i18n";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ProfileForm } from "./profile-form";
import { AccountStatus } from "./account-status";

interface AccountInfoProps {
  params: Promise<{ locale: Locale }>;
}

export default async function AccountInfo({ params }: AccountInfoProps) {
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

  return (
    <main className="container mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t.profile}</h1>
        <p className="text-muted-foreground mt-2">{t.accountInfo}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <ProfileForm
            locale={locale}
            initialData={{
              name: user.name || "",
              username: user.username || "",
              email: user.email,
              phoneNumber: user.phoneNumber || "",
            }}
          />
        </div>

        {/* Account Status */}
        <AccountStatus locale={locale} user={user} />
      </div>
    </main>
  );
}
