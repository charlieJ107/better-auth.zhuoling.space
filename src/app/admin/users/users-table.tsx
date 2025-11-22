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
    Edit, 
    Ban, 
    UserCheck, 
    Trash2,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role?: string;
    banned?: boolean;
    banReason?: string;
    createdAt: string;
    updatedAt: string;
}

export function UsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const limit = 100;
    const totalPages = Math.ceil(totalUsers / limit);

    const fetchUsers = async (page = 0, search = "") => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await authClient.admin.listUsers({
                query: {
                    limit: limit.toString(),
                    offset: (page * limit).toString(),
                    searchValue: search,
                    searchField: "email",
                    sortBy: "createdAt",
                    sortDirection: "desc"
                }
            });

            if (response.error) {
                throw new Error(response.error.message || 'Failed to fetch users');
            }

            setUsers(response.data?.users as User[] || []);
            setTotalUsers(response.data?.total || 0);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(0);
        fetchUsers(0, value);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchUsers(page, searchTerm);
    };

    const handleBanUser = async (userId: string, ban: boolean) => {
        try {
            setActionLoading(userId);
            
            if (ban) {
                const response = await authClient.admin.banUser({
                    userId,
                    banReason: "Banned by admin",
                    banExpiresIn: undefined // Permanent ban
                });
                
                if (response.error) {
                    throw new Error(response.error.message || 'Failed to ban user');
                }
            } else {
                const response = await authClient.admin.unbanUser({
                    userId,
                });
                
                if (response.error) {
                    throw new Error(response.error.message || 'Failed to unban user');
                }
            }
            
            // Refresh the users list
            await fetchUsers(currentPage, searchTerm);
        } catch (err) {
            console.error('Error updating user ban status:', err);
            setError(err instanceof Error ? err.message : 'Failed to update user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            setActionLoading(userId);
            
            const response = await authClient.admin.removeUser({
                userId,
            });
            
            if (response.error) {
                throw new Error(response.error.message || 'Failed to delete user');
            }
            
            // Refresh the users list
            await fetchUsers(currentPage, searchTerm);
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchUsers();
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
                            placeholder="Search users by email..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-8 w-64"
                        />
                    </div>
                </div>
                <Button asChild>
                    <Link href="/admin/users/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create User
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
                    <CardTitle>Users ({totalUsers})</CardTitle>
                    <CardDescription>
                        Manage user accounts and permissions
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
                            {users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Created: {formatDate(user.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={user.emailVerified ? "default" : "secondary"}>
                                            {user.emailVerified ? "Verified" : "Unverified"}
                                        </Badge>
                                        
                                        {user.banned && (
                                            <Badge variant="destructive">Banned</Badge>
                                        )}
                                        
                                        {user.role && (
                                            <Badge variant="outline">{user.role}</Badge>
                                        )}
                                        
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    disabled={actionLoading === user.id}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/users/${user.id}`}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit User
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleBanUser(user.id, !user.banned)}
                                                    disabled={actionLoading === user.id}
                                                >
                                                    {user.banned ? (
                                                        <>
                                                            <UserCheck className="h-4 w-4 mr-2" />
                                                            Unban User
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ban className="h-4 w-4 mr-2" />
                                                            Ban User
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                            
                            {users.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No users found
                                </div>
                            )}
                        </div>
                    )}
                    
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-muted-foreground">
                                Showing {currentPage * limit + 1} to {Math.min((currentPage + 1) * limit, totalUsers)} of {totalUsers} users
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
        </div>
    );
}
