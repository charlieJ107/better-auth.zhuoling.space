'use client';

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, CheckCircle, Copy, Loader2, RefreshCw, Plus, X, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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

interface EditOAuthClientFormProps {
    clientId: string;
}

// Form schema
const oauthClientUpdateFormSchema = z.object({
    client_name: z.string().min(1, "Client name is required").max(256, "Client name must be less than 256 characters"),
    redirectUrls: z.array(z.url("Invalid URL")).min(1, "At least one redirect URI is required"),
    icon: z.url("Invalid URL").optional().or(z.literal("")),
    public: z.boolean(),
    scope: z.string().optional(),
    client_uri: z.url("Invalid URL").optional().or(z.literal("")),
    logo_uri: z.url("Invalid URL").optional().or(z.literal("")),
    contacts: z.array(z.string()).optional(),
    tos_uri: z.url("Invalid URL").optional().or(z.literal("")),
    policy_uri: z.url("Invalid URL").optional().or(z.literal("")),
    software_id: z.string().optional().or(z.literal("")),
    software_version: z.string().optional().or(z.literal("")),
    software_statement: z.url("Invalid URL").optional().or(z.literal("")),
    post_logout_redirect_uris: z.array(z.union([z.url("Invalid URL"), z.literal("")])).optional(),
    grant_types: z.array(z.enum(["authorization_code", "client_credentials", "refresh_token"])).optional(),
    response_types: z.array(z.enum(["code"])).optional(),
    skip_consent: z.boolean().optional(),
});

type OAuthClientUpdateFormInput = z.infer<typeof oauthClientUpdateFormSchema>;

const oauthClientUpdateFormDefaults: OAuthClientUpdateFormInput = {
    client_name: "",
    redirectUrls: [""],
    icon: "",
    public: false,
    scope: "openid profile email offline_access",
    client_uri: "",
    logo_uri: "",
    contacts: [],
    tos_uri: "",
    policy_uri: "",
    software_id: "",
    software_version: "",
    software_statement: "",
    post_logout_redirect_uris: [],
    grant_types: [],
    response_types: ["code"],
    skip_consent: false,
};

function ensureAtLeastOneRedirectUri(values: string[]): string[] {
    if (!values.length) {
        return [""];
    }
    return values;
}



function getRedirectFieldValues(client: OAuthClient | null): string[] {
    if (!client) return [""];
    const redirectArray = Array.isArray(client.redirect_uris)
        ? client.redirect_uris
        : [];
    if (!redirectArray.length) return [""];
    return redirectArray;
}

export function EditOAuthClientForm({ clientId }: EditOAuthClientFormProps) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [regeneratingSecret, setRegeneratingSecret] = useState(false);
    const [secretDialogOpen, setSecretDialogOpen] = useState(false);
    const [newSecret, setNewSecret] = useState<string | null>(null);
    const [rotateConfirmOpen, setRotateConfirmOpen] = useState(false);
    const [redirectUriError, setRedirectUriError] = useState<string | null>(null);

    const fetcher = async (id: string) => {
        const result = await authClient.oauth2.getClient({ query: { client_id: id } });
        if (result.error) throw new Error(result.error.message ?? "Failed to load client");
        return result.data;
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

    const watchedPostLogoutUris = watch("post_logout_redirect_uris") ?? [];
    const postLogoutUriValues = Array.isArray(watchedPostLogoutUris) ? watchedPostLogoutUris : [];

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

    const addPostLogoutUri = () => {
        setValue("post_logout_redirect_uris", [...postLogoutUriValues, ""], {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    const removePostLogoutUri = (index: number) => {
        const nextValues = postLogoutUriValues.filter((_, i) => i !== index);
        setValue("post_logout_redirect_uris", nextValues, {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    useEffect(() => {
        if (client && !fetchError) {
            reset({
                client_name: client.client_name ?? "",
                redirectUrls: ensureAtLeastOneRedirectUri(getRedirectFieldValues(client)),
                icon: String((client as Record<string, unknown>).icon ?? client.logo_uri ?? ""),
                public: Boolean(
                    (client as { public?: boolean }).public ??
                    (client.type === "native" || client.type === "user-agent-based")
                ),
                scope: client.scope ?? "openid profile email offline_access",
                client_uri: client.client_uri,
                logo_uri: client.logo_uri,
                contacts: Array.isArray(client.contacts) ? client.contacts : [],
                tos_uri: client.tos_uri,
                policy_uri: client.policy_uri,
                software_id: client.software_id,
                software_version: client.software_version,
                software_statement: client.software_statement,
                post_logout_redirect_uris: Array.isArray(client.post_logout_redirect_uris) ? client.post_logout_redirect_uris : [],
                grant_types: Array.isArray(client.grant_types) ? client.grant_types : [],
                response_types: Array.isArray(client.response_types) && client.response_types.length > 0 ? client.response_types : ["code"],
                skip_consent: client.skip_consent ?? false,
            });
            setServerError(null);
        }
    }, [client, reset, fetchError]);

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
                if (url.protocol === 'http:' && !(url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
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

        const postLogoutUris = (values.post_logout_redirect_uris ?? [])
            .map((uri: string) => uri.trim())
            .filter(Boolean);

        try {
            const updatePayload = {
                client_name: values.client_name.trim(),
                redirect_uris: redirectUris,
                scope: values.scope?.trim() || undefined,
                public: values.public,
                type: (values.public ? "native" : "web") as "web" | "native" | "user-agent-based",
                token_endpoint_auth_method: (values.public ? "none" : "client_secret_basic") as "none" | "client_secret_basic" | "client_secret_post",
                client_uri: values.client_uri?.trim() || undefined,
                logo_uri: values.logo_uri?.trim() || values.icon?.trim() || undefined,
                contacts: Array.isArray(values.contacts) && values.contacts.length > 0 ? values.contacts : undefined,
                tos_uri: values.tos_uri?.trim() || undefined,
                policy_uri: values.policy_uri?.trim() || undefined,
                software_id: values.software_id?.trim() || undefined,
                software_version: values.software_version?.trim() || undefined,
                software_statement: values.software_statement?.trim() || undefined,
                post_logout_redirect_uris: postLogoutUris.length > 0 ? postLogoutUris : undefined,
                grant_types: (values.grant_types ?? []).length > 0 ? values.grant_types : undefined,
                response_types: (values.response_types ?? []).length > 0 ? values.response_types : undefined,
                skip_consent: values.skip_consent ?? false,
            };
            const result = await authClient.oauth2.updateClient({
                client_id: clientId,
                update: updatePayload,
            });

            if (result.error) {
                setServerError(result.error.message ?? "Failed to update OAuth client");
                return;
            }

            if (result.data) {
                await mutateClient(result.data);
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
                const data = result.data;
                const secret = data.client_secret;
                if (secret) {
                    setNewSecret(secret);
                    setSecretDialogOpen(true);
                }
                await mutateClient(result.data);
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


    return (
        <div className="space-y-6">
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
                        <FieldLabel>Client ID</FieldLabel>
                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={client.client_id}
                                className="font-mono bg-muted"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(client.client_id);
                                    } catch (e) {
                                        console.error("Copy failed", e);
                                    }
                                }}
                                aria-label="Copy Client ID"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRegenerateSecret}
                                disabled={regeneratingSecret}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${regeneratingSecret ? "animate-spin" : ""}`} />
                                Regenerate Secret
                            </Button>
                        </div>
                        <FieldDescription>Use this ID in your OAuth client configuration. Copy or regenerate the secret as needed.</FieldDescription>
                    </Field>

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
                        <Controller
                            control={control}
                            name="public"
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="public"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        aria-invalid={Boolean(errors.public)}
                                    />
                                    <FieldLabel htmlFor="public" className="font-normal cursor-pointer">
                                        Public client
                                    </FieldLabel>
                                </div>
                            )}
                        />
                        <FieldDescription className={errors.public ? "text-destructive" : undefined}>
                            {errors.public?.message ?? "Public clients cannot store a client secret (e.g. native mobile, user-agent/AI). Confidential clients can store a secret (e.g. web apps)."}
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="scope">Scope</FieldLabel>
                        <Controller
                            control={control}
                            name="scope"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="scope"
                                    placeholder="openid profile email offline_access"
                                    aria-invalid={Boolean(errors.scope)}
                                />
                            )}
                        />
                        <FieldDescription className={errors.scope ? "text-destructive" : undefined}>
                            {errors.scope?.message ?? "Space-separated list of scopes the client may request."}
                        </FieldDescription>
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
                        <FieldDescription className={errors.client_uri ? "text-destructive" : undefined}>
                            {errors.client_uri?.message ?? "URL of the client's home page."}
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
                        <FieldDescription className={errors.logo_uri ? "text-destructive" : undefined}>
                            {errors.logo_uri?.message ?? "URL of the client logo for consent screens."}
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="contacts">Contacts</FieldLabel>
                        <Controller
                            control={control}
                            name="contacts"
                            render={({ field }) => (
                                <Input
                                    id="contacts"
                                    value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        const arr = v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
                                        field.onChange(arr);
                                    }}
                                    placeholder="admin@example.com, support@example.com"
                                    aria-invalid={Boolean(errors.contacts)}
                                />
                            )}
                        />
                        <FieldDescription className={errors.contacts ? "text-destructive" : undefined}>
                            {errors.contacts?.message ?? "Comma-separated contact emails."}
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
                        <FieldDescription className={errors.tos_uri ? "text-destructive" : undefined}>
                            {errors.tos_uri?.message ?? "URL of the client's terms of service."}
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="policy_uri">Policy URI</FieldLabel>
                        <Controller
                            control={control}
                            name="policy_uri"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="policy_uri"
                                    placeholder="https://client.example.com/policy"
                                    aria-invalid={Boolean(errors.policy_uri)}
                                />
                            )}
                        />
                        <FieldDescription className={errors.policy_uri ? "text-destructive" : undefined}>
                            {errors.policy_uri?.message ?? "URL of the client's policy document."}
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="software_id">Software ID</FieldLabel>
                        <Controller
                            control={control}
                            name="software_id"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="software_id"
                                    placeholder="Optional software identifier"
                                    aria-invalid={Boolean(errors.software_id)}
                                />
                            )}
                        />
                        <FieldDescription className={errors.software_id ? "text-destructive" : undefined}>
                            {errors.software_id?.message ?? "Optional software product identifier."}
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="software_version">Software Version</FieldLabel>
                        <Controller
                            control={control}
                            name="software_version"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="software_version"
                                    placeholder="1.0.0"
                                    aria-invalid={Boolean(errors.software_version)}
                                />
                            )}
                        />
                        <FieldDescription className={errors.software_version ? "text-destructive" : undefined}>
                            {errors.software_version?.message ?? "Optional software version."}
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="software_statement">Software Statement URI</FieldLabel>
                        <Controller
                            control={control}
                            name="software_statement"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="software_statement"
                                    placeholder="https://example.com/software-statement.jwt"
                                    aria-invalid={Boolean(errors.software_statement)}
                                />
                            )}
                        />
                        <FieldDescription className={errors.software_statement ? "text-destructive" : undefined}>
                            {errors.software_statement?.message ?? "URL of a signed software statement (JWT)."}
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel>Post-logout Redirect URIs</FieldLabel>
                        <div className="space-y-2">
                            {postLogoutUriValues.map((_, index) => (
                                <div key={`post-logout-${index}`} className="grid grid-cols-[1fr_auto] gap-2">
                                    <Controller
                                        control={control}
                                        name={`post_logout_redirect_uris.${index}`}
                                        render={({ field: uriField }) => (
                                            <Input
                                                {...uriField}
                                                placeholder="https://client.example.com/post-logout"
                                                aria-invalid={Boolean(Array.isArray(errors.post_logout_redirect_uris) && errors.post_logout_redirect_uris[index])}
                                            />
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removePostLogoutUri(index)}
                                        aria-label="Remove post-logout redirect URI"
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
                                onClick={addPostLogoutUri}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Post-logout Redirect URI
                            </Button>
                        </div>
                        <FieldDescription>
                            Optional URIs to redirect after end session. Leave empty to disable.
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel>Grant Types</FieldLabel>
                        <div className="flex flex-wrap gap-4 pt-2">
                            {(["authorization_code", "client_credentials", "refresh_token"] as const).map((grant) => (
                                <Controller
                                    key={grant}
                                    control={control}
                                    name="grant_types"
                                    render={({ field }) => {
                                        const selected = Array.isArray(field.value) ? field.value : [];
                                        const checked = selected.includes(grant);
                                        return (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(checked) => {
                                                        const next = checked
                                                            ? [...selected, grant]
                                                            : selected.filter((g) => g !== grant);
                                                        field.onChange(next);
                                                    }}
                                                    aria-invalid={Boolean(errors.grant_types)}
                                                />
                                                <span className="text-sm capitalize">{grant.replace(/_/g, " ")}</span>
                                            </label>
                                        );
                                    }}
                                />
                            ))}
                        </div>
                        <FieldDescription className={errors.grant_types ? "text-destructive" : undefined}>
                            {errors.grant_types?.message ?? "Allowed OAuth 2.0 grant types."}
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel>Response Types</FieldLabel>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <Controller
                                control={control}
                                name="response_types"
                                render={({ field }) => {
                                    const selected = Array.isArray(field.value) ? field.value : [];
                                    const checked = selected.includes("code");
                                    return (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked ? ["code"] : []);
                                                }}
                                                aria-invalid={Boolean(errors.response_types)}
                                            />
                                            <span className="text-sm">code</span>
                                        </label>
                                    );
                                }}
                            />
                        </div>
                        <FieldDescription className={errors.response_types ? "text-destructive" : undefined}>
                            {errors.response_types?.message ?? "Authorization code flow is typically used."}
                        </FieldDescription>
                    </Field>

                    <Field>
                        <div className="flex items-center gap-2 pt-2">
                            <Controller
                                control={control}
                                name="skip_consent"
                                render={({ field }) => (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox
                                            checked={Boolean(field.value)}
                                            onCheckedChange={(checked) => field.onChange(!!checked)}
                                            aria-invalid={Boolean(errors.skip_consent)}
                                        />
                                        <span className="text-sm font-medium">Skip consent screen</span>
                                    </label>
                                )}
                            />
                        </div>
                        <FieldDescription className={errors.skip_consent ? "text-destructive" : undefined}>
                            {errors.skip_consent?.message ?? "If enabled, users will not see a consent screen for this client."}
                        </FieldDescription>
                    </Field>

                </FieldGroup>

                <div className="flex items-center justify-end gap-4">
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
            </form>

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
                    clientName={client.client_name ?? ""}
                    clientId={client.client_id}
                    clientSecret={newSecret}
                />
            )}
        </div>
    );
}
