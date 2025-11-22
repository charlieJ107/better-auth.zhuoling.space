'use client';

import { useState, useEffect } from "react";
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
    Globe
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import Image from "next/image";

interface OAuthClient {
    id: string;
    name: string;
    clientId: string;
    clientSecret?: string;
    redirectURLs: string[];
    type: string;
    disabled?: boolean;
    icon?: string;
    metadata?: string;
    createdAt: string;
    updatedAt: string;
}

interface ClientsResponse {
    clients: OAuthClient[];
    total: number;
    limit: number;
    offset: number;
}

export function OAuthClientsTable() {
    const [clients, setClients] = useState<OAuthClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalClients, setTotalClients] = useState(0);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<string | null>(null);

    const limit = 100;
    const totalPages = Math.ceil(totalClients / limit);

    const fetchClients = async (page = 0, search = "") => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: (page * limit).toString(),
            });

            if (search) {
                params.append('search', search);
            }

            const response = await fetch(`/api/admin/oauth-clients?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch OAuth clients');
            }

            const data: ClientsResponse = await response.json();
            setClients(data.clients);
            setTotalClients(data.total);
        } catch (err) {
            console.error('Error fetching OAuth clients:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch OAuth clients');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(0);
        fetchClients(0, value);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchClients(page, searchTerm);
    };

    const handleToggleDisabled = async (clientId: string, currentDisabled: boolean) => {
        try {
            setActionLoading(clientId);

            const response = await fetch(`/api/admin/oauth-clients/${clientId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    disabled: !currentDisabled
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update client status');
            }

            // Refresh the clients list
            await fetchClients(currentPage, searchTerm);
        } catch (err) {
            console.error('Error updating client status:', err);
            setError(err instanceof Error ? err.message : 'Failed to update client');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteClient = (clientId: string) => {
        setClientToDelete(clientId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteClient = async () => {
        if (!clientToDelete) return;

        try {
            setActionLoading(clientToDelete);

            const response = await fetch(`/api/admin/oauth-clients/${clientToDelete}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete client');
            }

            // Refresh the clients list
            await fetchClients(currentPage, searchTerm);
            setDeleteDialogOpen(false);
            setClientToDelete(null);
        } catch (err) {
            console.error('Error deleting client:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete client');
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                    {loading ? (
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
                            {clients.map((client) => (
                                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                            {client.icon ? (
                                                <Image src={client.icon} alt={client.name} className="h-8 w-8 rounded-full" width={32} height={32} />
                                            ) : (
                                                <Key className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">{client.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Client ID: {client.clientId}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Created: {formatDate(client.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Badge variant={client.type === 'confidential' ? 'default' : 'secondary'}>
                                            {client.type}
                                        </Badge>

                                        <Badge variant={client.disabled ? 'destructive' : 'default'}>
                                            {client.disabled ? 'Disabled' : 'Enabled'}
                                        </Badge>

                                        {client.clientSecret && (
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {client.clientSecret}
                                            </Badge>
                                        )}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={actionLoading === client.clientId}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/clients/${client.clientId}`}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleDisabled(client.clientId, client.disabled || false)}
                                                    disabled={actionLoading === client.clientId}
                                                >
                                                    {client.disabled ? (
                                                        <>
                                                            <Globe className="h-4 w-4 mr-2" />
                                                            Enable Client
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Globe className="h-4 w-4 mr-2" />
                                                            Disable Client
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteClient(client.clientId)}
                                                    disabled={actionLoading === client.clientId}
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

                            {clients.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No OAuth clients found
                                </div>
                            )}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-muted-foreground">
                                Showing {currentPage * limit + 1} to {Math.min((currentPage + 1) * limit, totalClients)} of {totalClients} clients
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
