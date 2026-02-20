'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Key } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { useOAuthClients, type OAuthClientRow } from "@/hooks/use-oauth-clients";

const PAGE_SIZE = 10;

function formatDate(value: string | number | Date | undefined): string {
    if (value == null) return "—";
    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function OAuthClientsTable() {
    const router = useRouter();
    const { clients: allClients, isLoading, error, mutate } = useOAuthClients();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<string | null>(null);

    const filteredClients = useMemo(() => {
        if (!searchTerm.trim()) return allClients;
        const q = searchTerm.toLowerCase();
        return allClients.filter(
            (c) =>
                (c.client_name ?? "").toLowerCase().includes(q) ||
                (c.client_id ?? "").toLowerCase().includes(q)
        );
    }, [allClients, searchTerm]);

    const totalClients = filteredClients.length;
    const totalPages = Math.max(1, Math.ceil(totalClients / PAGE_SIZE));
    const paginatedClients = useMemo(
        () =>
            filteredClients.slice(
                currentPage * PAGE_SIZE,
                currentPage * PAGE_SIZE + PAGE_SIZE
            ),
        [filteredClients, currentPage]
    );

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(0);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRowClick = (clientId: string) => {
        router.push(`/admin/clients/${clientId}`);
    };

    const handleDeleteClient = (e: React.MouseEvent, clientId: string) => {
        e.stopPropagation();
        setClientToDelete(clientId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteClient = async () => {
        if (!clientToDelete) return;

        try {
            setActionLoading(clientToDelete);

            const result = await authClient.oauth2.deleteClient({
                client_id: clientToDelete,
            });

            if (result.error) {
                throw new Error(result.error.message ?? "Failed to delete client");
            }

            await mutate();
            setDeleteDialogOpen(false);
            setClientToDelete(null);
        } catch (err) {
            console.error("Error deleting client:", err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search clients by name or ID..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-8 w-64"
                        />
                    </div>
                </div>
                <Button asChild>
                    <Link href="/admin/clients/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Client
                    </Link>
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="rounded-lg border bg-card">
                <div className="px-4 py-3 border-b">
                    <h2 className="text-lg font-semibold">OAuth Clients ({totalClients})</h2>
                    <p className="text-sm text-muted-foreground">
                        Click a row to edit. Use the buttons for quick actions.
                    </p>
                </div>
                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="h-12 bg-muted/50 rounded animate-pulse"
                                style={{ width: i === 2 ? "70%" : "100%" }}
                            />
                        ))}
                    </div>
                ) : paginatedClients.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No OAuth clients found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50 text-left text-sm font-medium text-muted-foreground">
                                    <th className="h-10 px-4 py-2 font-medium">Client</th>
                                    <th className="h-10 px-4 py-2 font-medium">Status</th>
                                    <th className="h-10 px-4 py-2 font-medium">Created</th>
                                    <th className="h-10 px-4 py-2 font-medium w-[1%] text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedClients.map((client: OAuthClientRow) => {
                                    const createdAt = (client as { createdAt?: string }).createdAt;
                                    return (
                                        <tr
                                            key={client.client_id}
                                            onClick={() => handleRowClick(client.client_id)}
                                            className="border-b transition-colors hover:bg-muted/50 cursor-pointer last:border-b-0"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                                        {client.logo_uri ? (
                                                            <Image
                                                                src={client.logo_uri}
                                                                alt={client.client_name ?? client.client_id}
                                                                className="h-8 w-8 rounded-full object-cover"
                                                                width={32}
                                                                height={32}
                                                            />
                                                        ) : (
                                                            <Key className="h-4 w-4 text-primary" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {client.client_name ?? client.client_id}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {client.client_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <Badge
                                                        variant={client.public ? "secondary" : "default"}
                                                        className="text-xs"
                                                    >
                                                        {client.public ? "Public" : "Confidential"}
                                                    </Badge>
                                                    <Badge
                                                        variant={client.disabled ? "destructive" : "default"}
                                                        className="text-xs"
                                                    >
                                                        {client.disabled ? "Disabled" : "Enabled"}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {formatDate(createdAt)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div
                                                    className="flex items-center justify-end gap-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                asChild
                                                            >
                                                                <Link href={`/admin/clients/${client.client_id}`}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left">
                                                            <p>Edit client</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="inline-flex">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                    disabled={actionLoading === client.client_id}
                                                                    onClick={(e) =>
                                                                        handleDeleteClient(e, client.client_id)
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left">
                                                            <p>Delete client</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing {currentPage * PAGE_SIZE + 1} to{" "}
                            {Math.min((currentPage + 1) * PAGE_SIZE, totalClients)} of{" "}
                            {totalClients} clients
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete OAuth Client"
                description="Are you sure you want to delete this OAuth client? This action cannot be undone and will break any applications using this client."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={confirmDeleteClient}
                loading={actionLoading === clientToDelete}
            />
        </div>
    );
}
