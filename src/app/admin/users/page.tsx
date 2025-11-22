import { UsersTable } from "./users-table";

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage user accounts, roles, and permissions
                    </p>
                </div>
            </div>
            
            <UsersTable />
        </div>
    );
}
