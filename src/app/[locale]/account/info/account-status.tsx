"use client";

import { useTranslation } from "@/lib/i18n/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { Locale } from "@/lib/i18n";

interface User {
  name?: string | null;
  username?: string | null;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean | null;
  role?: string | null;
  banned?: boolean | null;
  createdAt: Date;
}

interface AccountStatusProps {
  locale: Locale;
  user: User;
}

export function AccountStatus({ locale, user }: AccountStatusProps) {
  const { t } = useTranslation(locale);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("pages.account.accountStatus")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("pages.account.status")}</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {user.banned ? t("pages.account.banned") : t("pages.account.active")}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("pages.account.emailVerified")}</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user.emailVerified ? t("pages.account.verified") : t("pages.account.unverified")}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("pages.account.phoneVerified")}</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              user.phoneNumberVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {user.phoneNumberVerified ? t("pages.account.verified") : t("pages.account.unverified")}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("pages.account.role")}</span>
            <span className="text-sm">{user.role || "User"}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("pages.account.memberSince")}</span>
            <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("pages.account.accountActions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href={`/${locale}/account/password`} className="block">
            <Button variant="outline" className="w-full justify-start">
              <User className="h-4 w-4 mr-2" />
              {t("pages.account.changePassword")}
            </Button>
          </Link>
          <Button variant="outline" className="w-full justify-start" disabled>
            <Mail className="h-4 w-4 mr-2" />
            {t("pages.account.resendEmailVerification")}
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            <Phone className="h-4 w-4 mr-2" />
            {t("pages.account.verifyPhoneNumber")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

