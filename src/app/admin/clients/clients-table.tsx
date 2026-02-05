'use client';

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Search,
    Plus,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Key,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
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

    const handleDeleteClient = (clientId: string) => {
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

            <Card>
                <CardHeader>
                    <CardTitle>OAuth Clients ({totalClients})</CardTitle>
                    <CardDescription>
                        Manage OAuth2/OIDC client applications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                                    <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                                        <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                                    </div>
                                    <div className="h-6 bg-muted rounded animate-pulse w-16" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paginatedClients.map((client: OAuthClientRow) => (
                                <div key={client.client_id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                            {client.logo_uri ? (
                                                <Image src={client.logo_uri} alt={client.client_name ?? client.client_id} className="h-8 w-8 rounded-full" width={32} height={32} />
                                            ) : (
                                                <Key className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">{client.client_name ?? client.client_id}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Client ID: {client.client_id}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Created: {formatDate((client as { createdAt?: string }).createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Badge variant={client.public ? "secondary" : "default"}>
                                            {client.type ?? "web"}
                                        </Badge>

                                        <Badge variant={client.disabled ? "destructive" : "default"}>
                                            {client.disabled ? "Disabled" : "Enabled"}
                                        </Badge>

                                        {client.client_secret && (
                                            <Badge variant="outline" className="font-mono text-xs">
                                                Confidential
                                            </Badge>
                                        )}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={actionLoading === client.client_id}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/clients/${client.client_id}`}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteClient(client.client_id)}
                                                    disabled={actionLoading === client.client_id}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete Client
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}

                            {paginatedClients.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No OAuth clients found
                                </div>
                            )}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-muted-foreground">
                                Showing {currentPage * PAGE_SIZE + 1} to {Math.min((currentPage + 1) * PAGE_SIZE, totalClients)} of {totalClients} clients
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
                </CardContent>
            </Card>

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
