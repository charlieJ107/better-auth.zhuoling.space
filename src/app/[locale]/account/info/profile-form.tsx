"use client";

import { authClient } from "@/lib/auth-client";
import { useTranslation } from "@/lib/i18n/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Save, User, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { Locale } from "@/lib/i18n";

interface ProfileFormProps {
  locale: Locale;
  initialData: {
    name: string;
    username: string;
    email: string;
    phoneNumber: string;
  };
}

export function ProfileForm({ locale, initialData }: ProfileFormProps) {
  const { t } = useTranslation(locale);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await authClient.updateUser({
        name: formData.name,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
      });

      if (response.error) {
        setMessage({ type: "error", text: response.error.message || t("pages.account.errorUpdatingProfile") });
      } else {
        setMessage({ type: "success", text: t("pages.account.profileUpdated") });
      }
    } catch (error) {
      setMessage({ type: "error", text: t("pages.account.errorUpdatingProfile") });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t("pages.account.updateProfile")}
        </CardTitle>
        <CardDescription>
          {t("pages.account.updatePersonalInfo")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("pages.account.name")}</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={t("pages.account.enterFullName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">{t("common.username")}</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder={t("pages.account.enterUsername")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("common.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("pages.account.emailCannotChange")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">{t("pages.account.phoneNumber")}</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder={t("pages.account.enterPhoneNumber")}
                className="pl-10"
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("pages.account.saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("pages.account.saveChanges")}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

