'use client';

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, CheckCircle, Loader2, RefreshCw, Eye, EyeOff, Plus, X, ChevronDown } from "lucide-react";
import { ConfirmationDialog, SecretDisplayDialog } from "@/components/confirmation-dialog";
import { authClient } from "@/lib/auth-client";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { z } from "zod";
import { Route } from "next";
import { OAuthClient } from "@better-auth/oauth-provider";

type OAuthClientData = OAuthClient;

interface EditOAuthClientFormProps {
    clientId: string;
}

// Form schema
const oauthClientUpdateFormSchema = z.object({
    client_name: z.string().min(1, "Client name is required").max(256, "Client name must be less than 256 characters"),
    redirectUrls: z.array(z.url("Invalid URL")).min(1, "At least one redirect URI is required"),
    icon: z.url("Invalid URL").optional().or(z.literal("")),
    type: z.enum(["web", "native", "user-agent-based"]),
});

type OAuthClientUpdateFormInput = z.infer<typeof oauthClientUpdateFormSchema>;

const oauthClientUpdateFormDefaults: OAuthClientUpdateFormInput = {
    client_name: "",
    redirectUrls: [""],
    icon: undefined,
    type: "web",
};

function ensureAtLeastOneRedirectUri(values: string[]): string[] {
    if (!values.length) {
        return [""];
    }
    return values;
}



function getRedirectFieldValues(client: OAuthClient | null): string[] {
    if (!client) return [""];
    const redirectArray = Array.isArray((client as OAuthClientData).redirect_uris)
        ? (client as OAuthClientData).redirect_uris
        : [];
    if (!redirectArray.length) return [""];
    return redirectArray;
}

function formatClientDate(value: unknown): string {
    if (value == null) return "—";
    if (typeof value === "string" || typeof value === "number") return new Date(value).toLocaleDateString();
    if (value instanceof Date) return value.toLocaleDateString();
    return "—";
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

    const fetcher = async (id: string) => {
        const result = await authClient.oauth2.getClient({ query: { client_id: id } });
        if (result.error) throw new Error(result.error.message ?? "Failed to load client");
        return result.data as OAuthClientData;
    };
    const { data: client, error: fetchError, isLoading, mutate: mutateClient } = useSWR(clientId ? ["oauth-client", clientId] : null, () => fetcher(clientId!), {
        revalidateOnFocus: false,
    });

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

    const watchedRedirectUris = watch("redirectUrls") ?? [];
    const redirectUriValues = ensureAtLeastOneRedirectUri(watchedRedirectUris);

    const addRedirectUri = () => {
        setValue("redirectUrls", [...redirectUriValues, ""], {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    const removeRedirectUri = (index: number) => {
        const nextValues = redirectUriValues.filter((_, currentIndex) => currentIndex !== index);
        setValue("redirectUrls", ensureAtLeastOneRedirectUri(nextValues), {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    useEffect(() => {
        if (client) {
            reset({
                client_name: client.client_name ?? "",
                redirectUrls: ensureAtLeastOneRedirectUri(getRedirectFieldValues(client)),
                icon: client.logo_uri ?? "",
                type: (client.type === "web" || client.type === "native" || client.type === "user-agent-based")
                    ? client.type
                    : "web",
            });
            setServerError(null);
        }
    }, [client, reset]);

    const onSubmit: SubmitHandler<OAuthClientUpdateFormInput> = async (values) => {
        setServerError(null);
        setRedirectUriError(null);

        // Normalize redirect URIs
        const redirectUris = values.redirectUrls
            .map(uri => uri.trim())
            .filter(Boolean);

        // Basic validation
        if (redirectUris.length === 0) {
            setRedirectUriError("At least one redirect URI is required");
            return;
        }

        // Validate redirect URIs
        const invalidUris: string[] = [];
        for (const uri of redirectUris) {
            try {
                const url = new URL(uri);
                if (url.protocol !== 'https:' && url.protocol !== 'http:' && !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
                    invalidUris.push(`${uri} must use HTTPS (or HTTP for localhost)`);
                }
            } catch {
                invalidUris.push(`${uri} is not a valid URL`);
            }
        }

        if (invalidUris.length > 0) {
            setRedirectUriError(invalidUris.join("\n"));
            return;
        }

        try {
            const result = await authClient.oauth2.updateClient({
                client_id: clientId,
                update: {
                    client_name: values.client_name.trim(),
                    redirect_uris: redirectUris,
                    logo_uri: values.icon?.trim() || undefined,
                },
            });

            if (result.error) {
                setServerError(result.error.message ?? "Failed to update OAuth client");
                return;
            }

            if (result.data) {
                await mutateClient(result.data as OAuthClientData);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Error updating OAuth client:", error);
            setServerError(error instanceof Error ? error.message : "Failed to update OAuth client");
        }
    };

    const handleRegenerateSecret = () => {
        setRotateConfirmOpen(true);
    };

    const confirmRegenerateSecret = async () => {
        try {
            setRegeneratingSecret(true);
            setRotateConfirmOpen(false);

            const result = await authClient.oauth2.client.rotateSecret({
                client_id: clientId,
            });

            if (result.error) {
                setServerError(result.error.message ?? "Failed to regenerate client secret");
                return;
            }

            if (result.data) {
                const data = result.data as OAuthClientData;
                const secret = data.client_secret;
                if (secret) {
                    setNewSecret(secret);
                    setSecretDialogOpen(true);
                }
                await mutateClient(result.data as OAuthClientData);
            }
        } catch (err) {
            setServerError(err instanceof Error ? err.message : "Failed to regenerate client secret");
        } finally {
            setRegeneratingSecret(false);
        }
    };

    const redirectUriHelperText = useMemo(() => {
        if (redirectUriError) return redirectUriError;
        if (errors.redirectUrls && !Array.isArray(errors.redirectUrls) && "message" in errors.redirectUrls && errors.redirectUrls.message) {
            return errors.redirectUrls.message;
        }
        return null;
    }, [errors.redirectUrls, redirectUriError]);

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

    if (fetchError || !client) {
        return (
            <Card className="max-w-2xl">
                <CardContent>
                    <Alert variant="destructive">
                        <CircleAlert className="h-4 w-4" />
                        <AlertTitle>Client Not Found</AlertTitle>
                        <AlertDescription>
                            {fetchError?.message ?? "The requested OAuth client could not be found."}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const clientIdValue = client.client_id ?? "";
    const clientSecretValue = client.client_secret ?? "";
    const clientNameValue = client.client_name ?? "";

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
                                <FieldLabel htmlFor="client_name">Client Name *</FieldLabel>
                                <Controller
                                    control={control}
                                    name="client_name"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id="client_name"
                                            placeholder="My OAuth Client"
                                            aria-invalid={Boolean(errors.client_name)}
                                        />
                                    )}
                                />
                                <FieldDescription className={errors.client_name ? "text-destructive" : undefined}>
                                    {errors.client_name?.message ?? "Provide a descriptive name to identify this client."}
                                </FieldDescription>
                            </Field>

                            <Field>
                                <FieldLabel>Redirect URIs *</FieldLabel>
                                <div className="space-y-2">
                                    {redirectUriValues.map((_, index) => (
                                        <div key={`redirect-uri-${index}`} className="grid grid-cols-[1fr_auto] gap-2">
                                            <Controller
                                                control={control}
                                                name={`redirectUrls.${index}`}
                                                render={({ field: redirectField }) => (
                                                    <Input
                                                        {...redirectField}
                                                        placeholder="https://client.example.com/callback"
                                                        aria-invalid={Boolean(Array.isArray(errors.redirectUrls) && errors.redirectUrls[index]?.message)}
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
                                {Array.isArray(errors.redirectUrls) && errors.redirectUrls.map((errorItem, index) => (
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
                                            <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                                                <DropdownMenuRadioGroup
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <DropdownMenuRadioItem value="web">
                                                        Web
                                                    </DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="native">
                                                        Native
                                                    </DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="user-agent-based">
                                                        User-agent based
                                                    </DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                />
                                <FieldDescription className={errors.type ? "text-destructive" : undefined}>
                                    {errors.type?.message ?? "The type of OAuth client (web, native, or user-agent-based)."}
                                </FieldDescription>
                            </Field>

                        </FieldGroup>

                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRegenerateSecret}
                                disabled={regeneratingSecret || !clientSecretValue}
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
                        <code className="text-sm bg-muted px-2 py-1 rounded">{clientIdValue}</code>
                    </div>
                    {clientSecretValue && (
                        <div className="flex justify-between items-center">
                            <span>Client Secret:</span>
                            <div className="flex items-center gap-2">
                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {showSecret ? clientSecretValue : '••••••••'}
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
                        <span>{formatClientDate((client as Record<string, unknown>).createdAt ?? (client as Record<string, unknown>).created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>{formatClientDate((client as Record<string, unknown>).updatedAt ?? (client as Record<string, unknown>).updated_at)}</span>
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
                    clientName={clientNameValue}
                    clientId={clientIdValue}
                    clientSecret={newSecret}
                />
            )}
        </div>
    );
}
