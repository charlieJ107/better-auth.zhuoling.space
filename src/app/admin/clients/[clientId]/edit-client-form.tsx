'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, CheckCircle, Loader2, RefreshCw, Eye, EyeOff, Plus, X, ChevronDown } from "lucide-react";
import { ConfirmationDialog, SecretDisplayDialog } from "@/components/confirmation-dialog";
import {
    formatRedirectUris,
    OAuthClientApiDTO,
    validateRedirectUris,
} from "@/lib/oauth-clients";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    oauthClientUpdateFormSchema,
    type OAuthClientUpdateFormInput,
    oauthClientUpdateFormDefaults,
    buildUpdateOAuthClientRequest,
    ensureAtLeastOneRedirectUri,
} from "@/lib/oauth-client-dto";
import { Route } from "next";

interface EditOAuthClientFormProps {
    clientId: string;
}

function getRedirectFieldValues(client?: OAuthClientApiDTO): string[] {
    if (!client) {
        return [""];
    }

    const redirectArray = Array.isArray(client.redirectURLs)
        ? client.redirectURLs
        : formatRedirectUris(client.redirectURLsRaw ?? "");

    if (!redirectArray.length) {
        return [""];
    }

    return redirectArray;
}

export function EditOAuthClientForm({ clientId }: EditOAuthClientFormProps) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [regeneratingSecret, setRegeneratingSecret] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [secretDialogOpen, setSecretDialogOpen] = useState(false);
    const [newSecret, setNewSecret] = useState<string | null>(null);
    const [rotateConfirmOpen, setRotateConfirmOpen] = useState(false);
    const [redirectUriError, setRedirectUriError] = useState<string | null>(null);

    const {
        data: client,
        error: fetchError,
        isLoading,
        mutate,
    } = useSWR<OAuthClientApiDTO>(`/api/admin/oauth-clients/${clientId}`, fetcher);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<OAuthClientUpdateFormInput>({
        resolver: zodResolver(oauthClientUpdateFormSchema),
        defaultValues: oauthClientUpdateFormDefaults,
    });

    const watchedRedirectUris = watch("redirectUris") ?? [];
    const redirectUriValues = ensureAtLeastOneRedirectUri(watchedRedirectUris);

    const addRedirectUri = () => {
        setValue("redirectUris", [...redirectUriValues, ""], {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    const removeRedirectUri = (index: number) => {
        const nextValues = redirectUriValues.filter((_, currentIndex) => currentIndex !== index);
        setValue("redirectUris", ensureAtLeastOneRedirectUri(nextValues), {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    useEffect(() => {
        if (fetchError) {
            const message = fetchError instanceof Error ? fetchError.message : "Failed to load client";
            setServerError(message);
        }
    }, [fetchError]);

    useEffect(() => {
        if (client) {
            reset({
                name: client.name ?? "",
                redirectUris: ensureAtLeastOneRedirectUri(getRedirectFieldValues(client)),
                icon: client.icon ?? "",
                disabled: client.disabled ?? false,
                type: (client.type === "web" || client.type === "public" || client.type === "mobile") 
                    ? client.type 
                    : "web",
            });
            setServerError(null);
        }
    }, [client, reset]);

    const onSubmit: SubmitHandler<OAuthClientUpdateFormInput> = async (values) => {
        setServerError(null);
        setRedirectUriError(null);

        const parsedValues = oauthClientUpdateFormSchema.parse(values);
        const payload = buildUpdateOAuthClientRequest(parsedValues);
        const redirectUris = payload.redirectURLs;

        const redirectValidation = validateRedirectUris(redirectUris);
        if (!redirectValidation.valid) {
            setRedirectUriError(redirectValidation.errors.join("\n"));
            return;
        }

        try {
            const response = await fetch(`/api/admin/oauth-clients/${clientId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to update OAuth client" }));
                throw new Error(errorData.error || "Failed to update OAuth client");
            }

            const updatedClient: OAuthClientApiDTO = await response.json();
            mutate(updatedClient, false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error updating OAuth client:", error);
            const message = error instanceof Error ? error.message : "Failed to update OAuth client";
            setServerError(message);
        }
    };

    const handleRegenerateSecret = () => {
        setRotateConfirmOpen(true);
    };

    const confirmRegenerateSecret = async () => {
        try {
            setRegeneratingSecret(true);
            setRotateConfirmOpen(false);

            const response = await fetch(`/api/admin/oauth-clients/${clientId}/regenerate-secret`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to regenerate client secret");
            }

            const data = await response.json();
            setNewSecret(data.clientSecret);
            setSecretDialogOpen(true);

            const clientResponse = await fetch(`/api/admin/oauth-clients/${clientId}`);
            if (clientResponse.ok) {
                const updatedClient: OAuthClientApiDTO = await clientResponse.json();
                mutate(updatedClient, false);
            }
        } catch (error) {
            console.error("Error regenerating client secret:", error);
            const message = error instanceof Error ? error.message : "Failed to regenerate client secret";
            setServerError(message);
        } finally {
            setRegeneratingSecret(false);
        }
    };

    const redirectUriHelperText = useMemo(() => {
        if (redirectUriError) return redirectUriError;
        if (errors.redirectUris && !Array.isArray(errors.redirectUris) && "message" in errors.redirectUris && errors.redirectUris.message) {
            return errors.redirectUris.message;
        }
        return null;
    }, [errors.redirectUris, redirectUriError]);

    if (isLoading || (!client && !fetchError)) {
        return (
            <Card className="max-w-2xl">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading client data...</span>
                </CardContent>
            </Card>
        );
    }

    if (!client) {
        return (
            <Card className="max-w-2xl">
                <CardContent>
                    <Alert variant="destructive">
                        <CircleAlert className="h-4 w-4" />
                        <AlertTitle>Client Not Found</AlertTitle>
                        <AlertDescription>The requested OAuth client could not be found.</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>OAuth Client Information</CardTitle>
                    <CardDescription>
                        Update OAuth client details and settings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {serverError && (
                            <Alert variant="destructive">
                                <CircleAlert className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>OAuth client updated successfully!</AlertDescription>
                            </Alert>
                        )}

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">Client Name *</FieldLabel>
                                <Controller
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id="name"
                                            placeholder="My OAuth Client"
                                            aria-invalid={Boolean(errors.name)}
                                        />
                                    )}
                                />
                                <FieldDescription className={errors.name ? "text-destructive" : undefined}>
                                    {errors.name?.message ?? "Provide a descriptive name to identify this client."}
                                </FieldDescription>
                            </Field>

                            <Field>
                                <FieldLabel>Redirect URIs *</FieldLabel>
                                <div className="space-y-2">
                                    {redirectUriValues.map((_, index) => (
                                        <div key={`redirect-uri-${index}`} className="grid grid-cols-[1fr_auto] gap-2">
                                            <Controller
                                                control={control}
                                                name={`redirectUris.${index}`}
                                                render={({ field: redirectField }) => (
                                                    <Input
                                                        {...redirectField}
                                                        placeholder="https://client.example.com/callback"
                                                        aria-invalid={Boolean(Array.isArray(errors.redirectUris) && errors.redirectUris[index]?.message)}
                                                    />
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeRedirectUri(index)}
                                                disabled={redirectUriValues.length === 1}
                                                aria-label="Remove redirect URI"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-1"
                                        onClick={addRedirectUri}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Redirect URI
                                    </Button>
                                </div>
                                <FieldDescription className={redirectUriHelperText ? "text-destructive" : undefined}>
                                    {redirectUriHelperText || "Each redirect URI must be unique and use HTTPS (localhost allowed)."}
                                </FieldDescription>
                                {Array.isArray(errors.redirectUris) && errors.redirectUris.map((errorItem, index) => (
                                    errorItem?.message ? (
                                        <FieldDescription key={`redirect-uri-error-${index}`} className="text-destructive">
                                            {`Redirect URI #${index + 1}: ${errorItem.message}`}
                                        </FieldDescription>
                                    ) : null
                                ))}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="icon">Icon URL</FieldLabel>
                                <Controller
                                    control={control}
                                    name="icon"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id="icon"
                                            placeholder="https://client.example.com/logo.png"
                                            aria-invalid={Boolean(errors.icon)}
                                        />
                                    )}
                                />
                                <FieldDescription className={errors.icon ? "text-destructive" : undefined}>
                                    {errors.icon?.message ?? "Optional logo displayed on consent screens."}
                                </FieldDescription>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="type">Client Type *</FieldLabel>
                                <Controller
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-between h-9"
                                                    aria-invalid={Boolean(errors.type)}
                                                >
                                                    <span className="capitalize">{field.value || "Select type"}</span>
                                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                <DropdownMenuRadioGroup
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <DropdownMenuRadioItem value="web">
                                                        Web
                                                    </DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="public">
                                                        Public
                                                    </DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="mobile">
                                                        Mobile
                                                    </DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                />
                                <FieldDescription className={errors.type ? "text-destructive" : undefined}>
                                    {errors.type?.message ?? "The type of OAuth client (web, public, or mobile)."}
                                </FieldDescription>
                            </Field>

                            <Field>
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        control={control}
                                        name="disabled"
                                        render={({ field }) => (
                                            <Checkbox
                                                id="disabled"
                                                checked={field.value ?? false}
                                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                            />
                                        )}
                                    />
                                    <FieldLabel htmlFor="disabled">Disabled</FieldLabel>
                                </div>
                                <FieldDescription>
                                    Disable this OAuth client from being used
                                </FieldDescription>
                            </Field>
                        </FieldGroup>

                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRegenerateSecret}
                                disabled={regeneratingSecret || !client.clientSecret}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${regeneratingSecret ? "animate-spin" : ""}`} />
                                Regenerate Secret
                            </Button>

                            <div className="flex items-center space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/admin/clients" as Route)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Client Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span>Client ID:</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{client.clientId}</code>
                    </div>
                    {client.clientSecret && (
                        <div className="flex justify-between items-center">
                            <span>Client Secret:</span>
                            <div className="flex items-center gap-2">
                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {client.clientSecret}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={() => setShowSecret(!showSecret)}
                                >
                                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Type:</span>
                        <span>{client.type}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={client.disabled ? "text-red-600" : "text-green-600"}>
                            {client.disabled ? "Disabled" : "Enabled"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(client.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>{new Date(client.updatedAt).toLocaleDateString()}</span>
                    </div>
                </CardContent>
            </Card>

            <ConfirmationDialog
                open={rotateConfirmOpen}
                onOpenChange={setRotateConfirmOpen}
                title="Regenerate Client Secret"
                description="Are you sure you want to regenerate the client secret? The old secret will no longer work and any applications using this client will need to be updated with the new secret."
                confirmText="Regenerate"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={confirmRegenerateSecret}
                loading={regeneratingSecret}
            />

            {newSecret && (
                <SecretDisplayDialog
                    open={secretDialogOpen}
                    onOpenChange={setSecretDialogOpen}
                    clientName={client.name}
                    clientId={client.clientId}
                    clientSecret={newSecret}
                />
            )}
        </div>
    );
}
