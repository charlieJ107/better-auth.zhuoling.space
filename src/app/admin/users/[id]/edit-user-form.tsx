'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, CheckCircle, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { User as BetterAuthUser } from "better-auth";

interface User extends BetterAuthUser {
    username: string;
    role: string;
    banned: boolean;
    banReason: string;
    banExpires: Date;
}

interface EditUserFormProps {
    userId: string;
}

export function EditUserForm({ userId }: EditUserFormProps) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await authClient.admin.getUser({
                    query: { id: userId }
                });

                if (response.error) {
                    throw new Error(response.error.message || 'Failed to fetch user');
                }

                setUser(response.data as User);
            } catch (err) {
                console.error('Error fetching user:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch user');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const username = formData.get('username') as string;
        const role = formData.get('role') as string;
        const banned = formData.get('banned') === 'on';
        const banReason = formData.get('banReason') as string;

        // Validation
        if (!name || !email) {
            setError('Name and email are required');
            setSaving(false);
            return;
        }

        try {
            // Update user basic info
            const updateResponse = await authClient.admin.updateUser({
                userId,
                data: {
                    name,
                    email,
                    username,
                    role: role || 'user',
                }
            });

            if (updateResponse.error) {
                throw new Error(updateResponse.error.message || 'Failed to update user');
            }

            // Handle ban status
            if (banned && !user.banned) {
                const banResponse = await authClient.admin.banUser({
                    userId,
                    banReason: banReason || 'Banned by admin',
                    banExpiresIn: undefined // Permanent ban
                });

                if (banResponse.error) {
                    throw new Error(banResponse.error.message || 'Failed to ban user');
                }
            } else if (!banned && user.banned) {
                const unbanResponse = await authClient.admin.unbanUser({
                    userId,
                });

                if (unbanResponse.error) {
                    throw new Error(unbanResponse.error.message || 'Failed to unban user');
                }
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/admin/users');
            }, 2000);
        } catch (err) {
            console.error('Error updating user:', err);
            setError(err instanceof Error ? err.message : 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!confirm('Are you sure you want to reset this user\'s password? They will need to set a new password on next login.')) {
            return;
        }

        try {
            setSaving(true);
            const newPassword = Math.random().toString(36).substring(2, 15);

            const response = await authClient.admin.setUserPassword({
                userId,
                newPassword,
            });

            if (response.error) {
                throw new Error(response.error.message || 'Failed to reset password');
            }

            alert(`Password reset successfully. New password: ${newPassword}\n\nPlease share this with the user securely.`);
        } catch (err) {
            console.error('Error resetting password:', err);
            setError(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card className="max-w-2xl">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading user data...</span>
                </CardContent>
            </Card>
        );
    }

    if (error && !user) {
        return (
            <Card className="max-w-2xl">
                <CardContent>
                    <Alert variant="destructive">
                        <CircleAlert className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (!user) {
        return (
            <Card className="max-w-2xl">
                <CardContent>
                    <Alert variant="destructive">
                        <CircleAlert className="h-4 w-4" />
                        <AlertTitle>User Not Found</AlertTitle>
                        <AlertDescription>The requested user could not be found.</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>
                        Update user account details and settings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <CircleAlert className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>
                                    User updated successfully! Redirecting to users list...
                                </AlertDescription>
                            </Alert>
                        )}

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    defaultValue={user.name}
                                    required
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={user.email}
                                    required
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="username">Username</FieldLabel>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    defaultValue={user.username || ''}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="role">Role</FieldLabel>
                                <select
                                    id="role"
                                    name="role"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    defaultValue={user.role || 'user'}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </Field>

                            <Field>
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="banned"
                                        name="banned"
                                        type="checkbox"
                                        defaultChecked={user.banned || false}
                                        className="h-4 w-4 rounded border border-input"
                                    />
                                    <FieldLabel htmlFor="banned">Banned</FieldLabel>
                                </div>
                                <FieldDescription>
                                    Ban this user from accessing the system
                                </FieldDescription>
                            </Field>

                            {user.banned && (
                                <Field>
                                    <FieldLabel htmlFor="banReason">Ban Reason</FieldLabel>
                                    <Input
                                        id="banReason"
                                        name="banReason"
                                        type="text"
                                        defaultValue={user.banReason || ''}
                                        placeholder="Reason for banning this user"
                                    />
                                </Field>
                            )}
                        </FieldGroup>

                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePasswordReset}
                                disabled={saving}
                            >
                                Reset Password
                            </Button>

                            <div className="flex items-center space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/admin/users')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span>Email Verified:</span>
                        <span className={user.emailVerified ? 'text-green-600' : 'text-red-600'}>
                            {user.emailVerified ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Account Status:</span>
                        <span className={user.banned ? 'text-red-600' : 'text-green-600'}>
                            {user.banned ? 'Banned' : 'Active'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(user.createdAt).toISOString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>{new Date(user.updatedAt).toISOString()}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
