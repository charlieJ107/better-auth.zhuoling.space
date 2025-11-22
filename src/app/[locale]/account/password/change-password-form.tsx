"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, EyeOff, Eye, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useTranslation } from "@/lib/i18n/client";
import { Locale } from "@/lib/i18n";

export function ChangePasswordForm({ locale }: { locale: Locale }) {

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const { t } = useTranslation(locale);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear message when user starts typing
        if (message) {
            setMessage(null);
        }
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };




    const validateForm = () => {
        if (!formData.currentPassword) {
            setMessage({ type: "error", text: "Current password is required" });
            return false;
        }
        if (!formData.newPassword) {
            setMessage({ type: "error", text: "New password is required" });
            return false;
        }
        if (formData.newPassword.length < 8) {
            setMessage({ type: "error", text: t("pages.account.passwordTooShort") });
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: "error", text: t("pages.account.passwordsDoNotMatch") });
            return false;
        }
        if (formData.currentPassword === formData.newPassword) {
            setMessage({ type: "error", text: "New password must be different from current password" });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await authClient.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            if (response.error) {
                if (response.error.message?.includes("Invalid password")) {
                    setMessage({ type: "error", text: t("pages.account.invalidCurrentPassword") });
                } else {
                    setMessage({ type: "error", text: response.error.message || t("pages.account.errorChangingPassword") });
                }
            } else {
                setMessage({ type: "success", text: t("pages.account.passwordChanged") });
                // Clear form on success
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            }
        } catch (error) {
            setMessage({ type: "error", text: t("pages.account.errorChangingPassword") });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                    <AlertDescription>{message.text}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("pages.account.currentPassword")}</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                        placeholder="Enter your current password"
                        className="pl-10 pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("current")}
                    >
                        {showPasswords.current ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="newPassword">{t("pages.account.newPassword")}</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        placeholder="Enter your new password"
                        className="pl-10 pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("new")}
                    >
                        {showPasswords.new ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Password must be at least 8 characters long
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("pages.account.confirmNewPassword")}</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="Confirm your new password"
                        className="pl-10 pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("confirm")}
                    >
                        {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
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
    )
}