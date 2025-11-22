'use client';

import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Locale } from "@/lib/i18n";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertTriangle,
    Copy,
    KeyRound,
    Plus,
    RefreshCcw,
    ShieldAlert,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type ApiKeyRecord = {
    id: string;
    name: string | null;
    start: string | null;
    prefix: string | null;
    userId: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null;
    lastRequest: string | null;
    lastRefillAt: string | null;
    requestCount: number;
    remaining: number | null;
    rateLimitEnabled: boolean;
    rateLimitMax: number | null;
    rateLimitTimeWindow: number | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any> | null;
    permissions?: Record<string, string[]> | null;
};

type GeneratedApiKeyRecord = ApiKeyRecord & { key: string };

type ApiKeyResponse = Omit<
    ApiKeyRecord,
    "createdAt" | "updatedAt" | "expiresAt" | "lastRequest" | "lastRefillAt"
> & {
    createdAt: Date | string;
    updatedAt: Date | string;
    expiresAt: Date | string | null;
    lastRequest: Date | string | null;
    lastRefillAt: Date | string | null;
    key?: string;
};

const toISOStringValue = (value: Date | string): string =>
    typeof value === "string" ? value : value.toISOString();

const toOptionalISOString = (value: Date | string | null): string | null =>
    value ? toISOStringValue(value) : null;

const normalizeApiKey = (key: ApiKeyResponse): ApiKeyRecord => ({
    id: key.id,
    name: key.name ?? null,
    start: key.start ?? null,
    prefix: key.prefix ?? null,
    userId: key.userId,
    enabled: key.enabled,
    createdAt: toISOStringValue(key.createdAt),
    updatedAt: toISOStringValue(key.updatedAt),
    expiresAt: toOptionalISOString(key.expiresAt),
    lastRequest: toOptionalISOString(key.lastRequest),
    lastRefillAt: toOptionalISOString(key.lastRefillAt),
    requestCount: key.requestCount ?? 0,
    remaining: key.remaining ?? null,
    rateLimitEnabled: key.rateLimitEnabled ?? false,
    rateLimitMax: key.rateLimitMax ?? null,
    rateLimitTimeWindow: key.rateLimitTimeWindow ?? null,
    metadata: key.metadata ?? null,
    permissions: key.permissions ?? null,
});

const normalizeGeneratedApiKey = (
    key: ApiKeyResponse & { key: string },
): GeneratedApiKeyRecord => ({
    ...normalizeApiKey(key),
    key: key.key,
});

export interface ApiKeysPageTexts {
    title: string;
    description: string;
    listTitle: string;
    listDescription: string;
    createButton: string;
    refresh: string;
    emptyTitle: string;
    emptyDescription: string;
    createDialogTitle: string;
    createDialogDescription: string;
    nameLabel: string;
    namePlaceholder: string;
    prefixLabel: string;
    prefixPlaceholder: string;
    expirationToggle: string;
    expirationDaysLabel: string;
    expirationHelp: string;
    invalidExpiration: string;
    createSubmit: string;
    cancel: string;
    statusLabel: string;
    createdLabel: string;
    lastUsedLabel: string;
    expiresLabel: string;
    noExpiration: string;
    neverUsed: string;
    requestsLabel: string;
    idLabel: string;
    enableAction: string;
    disableAction: string;
    deleteAction: string;
    deleteTitle: string;
    deleteDescription: string;
    deleteConfirm: string;
    generatedTitle: string;
    generatedDescription: string;
    generatedWarning: string;
    generatedKeyLabel: string;
    generatedPrefixLabel: string;
    copy: string;
    copied: string;
    genericError: string;
    retry: string;
    loadingLabel: string;
    unknownKey: string;
    previewLabel: string;
    manageNoteTitle: string;
    manageNoteDescription: string;
}

export interface AccountDictionary {
    enabled: string;
    disabled: string;
    apiKeysPage: ApiKeysPageTexts;
}

interface ApiKeysManagerProps {
    locale: Locale;
    dictionary: AccountDictionary;
}

interface DeleteState {
    open: boolean;
    key: ApiKeyRecord | null;
}

export function ApiKeysManager({ locale, dictionary }: ApiKeysManagerProps) {
    const { apiKeysPage: texts, enabled: enabledLabel, disabled: disabledLabel } = dictionary;
    const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [prefix, setPrefix] = useState("");
    const [hasExpiration, setHasExpiration] = useState(false);
    const [expirationDays, setExpirationDays] = useState<number>(30);
    const [generatedKey, setGeneratedKey] = useState<GeneratedApiKeyRecord | null>(null);
    const [showGeneratedDialog, setShowGeneratedDialog] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [secretCopied, setSecretCopied] = useState(false);
    const [deleteState, setDeleteState] = useState<DeleteState>({ open: false, key: null });

    const formatDateTime = (value: string | null) => {
        if (!value) {
            return null;
        }
        try {
            return new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(new Date(value));
        } catch (err) {
            console.error("Failed to format date", err);
            return value;
        }
    };

    const sortedKeys = useMemo(() => {
        return [...apiKeys].sort((a, b) => {
            const aDate = new Date(a.createdAt).getTime();
            const bDate = new Date(b.createdAt).getTime();
            return bDate - aDate;
        });
    }, [apiKeys]);

    const resetForm = () => {
        setName("");
        setPrefix("");
        setHasExpiration(false);
        setExpirationDays(30);
        setFormError(null);
    };

    const fetchKeys = async (options?: { silent?: boolean }) => {
        try {
            if (options?.silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);
            const response = await authClient.apiKey.list();
            if (response.error) {
                throw new Error(response.error.message || texts.genericError);
            }
            const data = Array.isArray(response.data)
                ? response.data.map((item: ApiKeyResponse) => normalizeApiKey(item))
                : [];
            setApiKeys(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : texts.genericError;
            setError(message);
        } finally {
            if (options?.silent) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        void fetchKeys();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (hasExpiration && (!expirationDays || expirationDays <= 0)) {
            setFormError(texts.invalidExpiration);
            return;
        }

        try {
            setCreateLoading(true);
            const expiresIn = hasExpiration
                ? Math.floor(expirationDays * 24 * 60 * 60)
                : null;

            const response = await authClient.apiKey.create({
                name: name.trim() || undefined,
                prefix: prefix.trim() || undefined,
                expiresIn: expiresIn === null ? null : expiresIn,
            });

            if (response.error || !response.data) {
                throw new Error(response.error?.message || texts.genericError);
            }

            const payload = response.data as ApiKeyResponse & { key?: string };
            if (!payload.key) {
                throw new Error(texts.genericError);
            }

            setGeneratedKey(normalizeGeneratedApiKey({ ...payload, key: payload.key }));
            setShowGeneratedDialog(true);
            setCreateOpen(false);
            resetForm();
            await fetchKeys({ silent: true });
        } catch (err) {
            const message = err instanceof Error ? err.message : texts.genericError;
            setFormError(message);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleToggle = async (key: ApiKeyRecord) => {
        try {
            setActionLoadingId(key.id);
            const response = await authClient.apiKey.update({
                keyId: key.id,
                enabled: !key.enabled,
            });
            if (response.error) {
                throw new Error(response.error.message || texts.genericError);
            }
            setApiKeys((prev) =>
                prev.map((item) =>
                    item.id === key.id ? { ...item, enabled: !key.enabled } : item,
                ),
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : texts.genericError;
            setError(message);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteState.key) {
            return;
        }
        try {
            setActionLoadingId(deleteState.key.id);
            const response = await authClient.apiKey.delete({
                keyId: deleteState.key.id,
            });
            if (response.error) {
                throw new Error(response.error.message || texts.genericError);
            }
            setApiKeys((prev) => prev.filter((item) => item.id !== deleteState.key?.id));
            setDeleteState({ open: false, key: null });
        } catch (err) {
            const message = err instanceof Error ? err.message : texts.genericError;
            setError(message);
        } finally {
            setActionLoadingId(null);
        }
    };

    const copyToClipboard = async (value: string, onSuccess?: () => void) => {
        try {
            await navigator.clipboard.writeText(value);
            onSuccess?.();
        } catch (err) {
            console.error("Failed to copy text", err);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <KeyRound className="h-5 w-5" />
                            {texts.listTitle}
                        </CardTitle>
                        <CardDescription>{texts.listDescription}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void fetchKeys({ silent: true })}
                            disabled={loading || refreshing}
                        >
                            <RefreshCcw
                                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                            />
                            {texts.refresh}
                        </Button>
                        <Dialog open={createOpen} onOpenChange={(open) => {
                            setCreateOpen(open);
                            if (!open) {
                                resetForm();
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button type="button">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {texts.createButton}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form className="space-y-4" onSubmit={handleCreate}>
                                    <DialogHeader>
                                        <DialogTitle>{texts.createDialogTitle}</DialogTitle>
                                        <DialogDescription>
                                            {texts.createDialogDescription}
                                        </DialogDescription>
                                    </DialogHeader>

                                    {formError && (
                                        <Alert variant="destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>{formError}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="api-key-name">{texts.nameLabel}</Label>
                                        <Input
                                            id="api-key-name"
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                            placeholder={texts.namePlaceholder}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="api-key-prefix">{texts.prefixLabel}</Label>
                                        <Input
                                            id="api-key-prefix"
                                            value={prefix}
                                            onChange={(event) => setPrefix(event.target.value)}
                                            placeholder={texts.prefixPlaceholder}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="api-key-expiration"
                                                checked={hasExpiration}
                                                onCheckedChange={(checked) =>
                                                    setHasExpiration(checked === true)
                                                }
                                            />
                                            <Label htmlFor="api-key-expiration">
                                                {texts.expirationToggle}
                                            </Label>
                                        </div>
                                        {hasExpiration && (
                                            <div className="space-y-2">
                                                <Label htmlFor="api-key-expiration-days">
                                                    {texts.expirationDaysLabel}
                                                </Label>
                                                <Input
                                                    id="api-key-expiration-days"
                                                    type="number"
                                                    min={1}
                                                    value={expirationDays}
                                                    onChange={(event) =>
                                                        setExpirationDays(
                                                            Number(event.target.value) || 0,
                                                        )
                                                    }
                                                />
                                                <p className="text-sm text-muted-foreground">
                                                    {texts.expirationHelp}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setCreateOpen(false)}
                                        >
                                            {texts.cancel}
                                        </Button>
                                        <Button type="submit" disabled={createLoading}>
                                            {createLoading ? `${texts.createSubmit}...` : texts.createSubmit}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="flex items-center justify-between gap-4">
                                <span>{error}</span>
                                <Button variant="outline" size="sm" onClick={() => void fetchKeys()}>
                                    {texts.retry}
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {loading ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">{texts.loadingLabel}</p>
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                        </div>
                    ) : sortedKeys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
                            <KeyRound className="h-10 w-10 text-muted-foreground" />
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold">{texts.emptyTitle}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {texts.emptyDescription}
                                </p>
                            </div>
                            <Button onClick={() => setCreateOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {texts.createButton}
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="h-[50vh] space-y-4">
                            {sortedKeys.map((key) => {
                                const created = formatDateTime(key.createdAt);
                                const lastUsed = formatDateTime(key.lastRequest);
                                const expires = formatDateTime(key.expiresAt);
                                const preview = key.start ?? key.prefix ?? "—";
                                const isLoading = actionLoadingId === key.id;

                                return (
                                    <Card key={key.id} className="border-muted bg-muted/40">
                                        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg">
                                                    {key.name || texts.unknownKey}
                                                </CardTitle>
                                                <CardDescription>
                                                    {texts.previewLabel}: <code>{preview}</code>
                                                </CardDescription>
                                            </div>
                                            <div className="flex flex-col items-start gap-1 sm:items-end">
                                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    {texts.statusLabel}
                                                </p>
                                                <Badge variant={key.enabled ? "default" : "secondary"}>
                                                    {key.enabled ? enabledLabel : disabledLabel}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    {texts.createdLabel}
                                                </p>
                                                <p className="text-sm font-medium">
                                                    {created ?? "—"}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    {texts.lastUsedLabel}
                                                </p>
                                                <p className="text-sm font-medium">
                                                    {lastUsed ?? texts.neverUsed}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    {texts.expiresLabel}
                                                </p>
                                                <p className="text-sm font-medium">
                                                    {expires ?? texts.noExpiration}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    {texts.requestsLabel}
                                                </p>
                                                <p className="text-sm font-medium">{key.requestCount ?? 0}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">{texts.idLabel}</p>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs">{key.id}</code>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2"
                                                        onClick={() => void copyToClipboard(key.id)}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={isLoading}
                                                onClick={() => void handleToggle(key)}
                                            >
                                                {isLoading
                                                    ? `${key.enabled ? texts.disableAction : texts.enableAction}...`
                                                    : key.enabled
                                                        ? texts.disableAction
                                                        : texts.enableAction}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                disabled={isLoading}
                                                onClick={() => setDeleteState({ open: true, key })}
                                            >
                                                {texts.deleteAction}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>

            <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription className="space-y-1">
                    <p className="font-medium">{texts.manageNoteTitle}</p>
                    <p className="text-sm text-muted-foreground">
                        {texts.manageNoteDescription}
                    </p>
                </AlertDescription>
            </Alert>

            <Dialog
                open={showGeneratedDialog && !!generatedKey}
                onOpenChange={(open) => {
                    setShowGeneratedDialog(open);
                    if (!open) {
                        setGeneratedKey(null);
                        setSecretCopied(false);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{texts.generatedTitle}</DialogTitle>
                        <DialogDescription>
                            {texts.generatedDescription}
                        </DialogDescription>
                    </DialogHeader>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {texts.generatedWarning}
                        </AlertDescription>
                    </Alert>
                    <div className="space-y-4">
                        {generatedKey?.prefix && (
                            <div className="space-y-1">
                                <Label>{texts.generatedPrefixLabel}</Label>
                                <code className="block rounded border bg-muted p-2 text-sm">
                                    {generatedKey.prefix}
                                </code>
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label>{texts.generatedKeyLabel}</Label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 break-all rounded border bg-muted p-2 text-sm">
                                    {generatedKey?.key}
                                </code>
                                {generatedKey?.key && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            generatedKey?.key &&
                                            void copyToClipboard(generatedKey.key, () => {
                                                setSecretCopied(true);
                                                setTimeout(() => setSecretCopied(false), 2000);
                                            })
                                        }
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        {secretCopied ? texts.copied : texts.copy}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={() => setShowGeneratedDialog(false)}>
                            {texts.cancel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={deleteState.open}
                onOpenChange={(open) => setDeleteState({ open, key: open ? deleteState.key : null })}
                title={texts.deleteTitle}
                description={texts.deleteDescription}
                confirmText={texts.deleteConfirm}
                cancelText={texts.cancel}
                variant="destructive"
                onConfirm={() => void handleDelete()}
                loading={actionLoadingId === deleteState.key?.id}
            />
        </div>
    );
}

