'use client';

import { useMemo, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, CheckCircle, Copy, Key, Plus, X } from "lucide-react";
import { validateRedirectUris } from "@/lib/oauth-clients";
import { authClient } from "@/lib/auth-client";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SecretDisplayDialog } from "@/components/confirmation-dialog";
import {
    oauthClientCreateFormSchema,
    type OAuthClientCreateFormInput,
    oauthClientCreateFormDefaults,
    buildRegisterOAuthClientPayload,
    type OAuthClientCreatedResponse,
    oauthClientCreatedResponseSchema,
    ensureAtLeastOneRedirectUri,
} from "@/lib/oauth-client-dto";

export function CreateOAuthClientForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [createdClient, setCreatedClient] = useState<OAuthClientCreatedResponse | null>(null);
    const [success, setSuccess] = useState(false);
    const [secretDialogOpen, setSecretDialogOpen] = useState(false);
    const [redirectUriError, setRedirectUriError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<OAuthClientCreateFormInput>({
        resolver: zodResolver(oauthClientCreateFormSchema),
        defaultValues: oauthClientCreateFormDefaults,
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

    const onSubmit: SubmitHandler<OAuthClientCreateFormInput> = async (values) => {
        setServerError(null);
        setRedirectUriError(null);

        const parsedValues = oauthClientCreateFormSchema.parse(values);
        const payload = buildRegisterOAuthClientPayload(parsedValues);
        const redirectUris = payload.redirect_uris;

        const redirectValidation = validateRedirectUris(redirectUris);
        if (!redirectValidation.valid) {
            setRedirectUriError(redirectValidation.errors.join("\n"));
            return;
        }

        try {
            const session = await authClient.getSession();
            if (!session) {
                redirect("/login?callbackURL=/admin/clients/create");
            }

            const token = session?.data?.session.token;

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch("/api/admin/oauth-clients", {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to create OAuth client" }));
                throw new Error(errorData.error || "Failed to create OAuth client");
            }

            const data = oauthClientCreatedResponseSchema.parse(await response.json());
            setCreatedClient(data);
            setSuccess(true);
            setSecretDialogOpen(true);
            reset(oauthClientCreateFormDefaults);
        } catch (error) {
            console.error("Error creating OAuth client:", error);
            const message = error instanceof Error ? error.message : "Failed to create OAuth client";
            setServerError(message);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error("Failed to copy to clipboard:", error);
        }
    };

    const redirectUriHelperText = useMemo(() => {
        if (redirectUriError) return redirectUriError;
        if (errors.redirectUris && !Array.isArray(errors.redirectUris) && "message" in errors.redirectUris && errors.redirectUris.message) {
            return errors.redirectUris.message;
        }
        return null;
    }, [errors.redirectUris, redirectUriError]);

    if (success && createdClient) {
        return (
            <div className="space-y-6">
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>OAuth Client Created Successfully!</AlertTitle>
                    <AlertDescription>
                        The OAuth client has been registered. Please save the credentials securely.
                    </AlertDescription>
                </Alert>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Client Credentials
                        </CardTitle>
                        <CardDescription>
                            These credentials will only be shown once. Save them securely.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <FieldLabel>Client Name</FieldLabel>
                            <div className="flex items-center gap-2">
                                <Input value={createdClient.client_name} readOnly />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => copyToClipboard(createdClient.client_name)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <FieldLabel>Client ID</FieldLabel>
                            <div className="flex items-center gap-2">
                                <Input value={createdClient.client_id} readOnly className="font-mono" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => copyToClipboard(createdClient.client_id)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <FieldLabel>Client Secret</FieldLabel>
                            <div className="flex items-center gap-2">
                                <Input value={createdClient.client_secret} readOnly className="font-mono" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => copyToClipboard(createdClient.client_secret)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <FieldDescription className="text-amber-600">
                                ⚠️ This secret will only be shown once. Save it securely.
                            </FieldDescription>
                        </div>

                        <div>
                            <FieldLabel>Redirect URIs</FieldLabel>
                            <div className="p-3 bg-muted rounded-md">
                                <pre className="text-sm">{createdClient.redirect_uris.join("\n")}</pre>
                            </div>
                        </div>

                        <div>
                            <FieldLabel>Scopes</FieldLabel>
                            <div className="p-3 bg-muted rounded-md">
                                <code className="text-sm">{createdClient.scope}</code>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end space-x-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => router.push("/admin/clients")}
                    >
                        Back to Clients
                    </Button>
                    <Button type="button" onClick={() => router.push("/admin/clients")}>
                        Continue
                    </Button>
                </div>

                <SecretDisplayDialog
                    open={secretDialogOpen}
                    onOpenChange={setSecretDialogOpen}
                    clientName={createdClient.client_name}
                    clientId={createdClient.client_id}
                    clientSecret={createdClient.client_secret}
                />
            </div>
        );
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>OAuth Client Information</CardTitle>
                <CardDescription>
                    Enter the details for the new OAuth client application
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
                            <FieldDescription>
                                {errors.client_name?.message ?? "Provide a human-friendly name for this client."}
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
                            <FieldLabel htmlFor="client_uri">Client URI</FieldLabel>
                            <Controller
                                control={control}
                                name="client_uri"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="client_uri"
                                        placeholder="https://client.example.com"
                                        aria-invalid={Boolean(errors.client_uri)}
                                    />
                                )}
                            />
                            <FieldDescription>
                                {errors.client_uri?.message ?? "Public homepage for this client (optional)."}
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="logo_uri">Logo URI</FieldLabel>
                            <Controller
                                control={control}
                                name="logo_uri"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="logo_uri"
                                        placeholder="https://client.example.com/logo.png"
                                        aria-invalid={Boolean(errors.logo_uri)}
                                    />
                                )}
                            />
                            <FieldDescription>
                                {errors.logo_uri?.message ?? "Logo displayed in consent screens (optional)."}
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="scope">Scopes</FieldLabel>
                            <Controller
                                control={control}
                                name="scope"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="scope"
                                        placeholder="openid profile email"
                                        aria-invalid={Boolean(errors.scope)}
                                    />
                                )}
                            />
                            <FieldDescription>
                                {errors.scope?.message ?? "Space-separated list of scopes the client can request."}
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="contacts">Contacts</FieldLabel>
                            <Controller
                                control={control}
                                name="contacts"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="contacts"
                                        placeholder="admin@client.example.com, support@client.example.com"
                                        aria-invalid={Boolean(errors.contacts)}
                                    />
                                )}
                            />
                            <FieldDescription>
                                {errors.contacts?.message ?? "Comma-separated email addresses (optional)."}
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="tos_uri">Terms of Service URI</FieldLabel>
                            <Controller
                                control={control}
                                name="tos_uri"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="tos_uri"
                                        placeholder="https://client.example.com/tos"
                                        aria-invalid={Boolean(errors.tos_uri)}
                                    />
                                )}
                            />
                            <FieldDescription>
                                {errors.tos_uri?.message ?? "Link to the client's terms of service (optional)."}
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="policy_uri">Privacy Policy URI</FieldLabel>
                            <Controller
                                control={control}
                                name="policy_uri"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="policy_uri"
                                        placeholder="https://client.example.com/privacy"
                                        aria-invalid={Boolean(errors.policy_uri)}
                                    />
                                )}
                            />
                            <FieldDescription>
                                {errors.policy_uri?.message ?? "Link to the client's privacy policy (optional)."}
                            </FieldDescription>
                        </Field>
                    </FieldGroup>

                    <div className="flex items-center justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/admin/clients")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Client"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
