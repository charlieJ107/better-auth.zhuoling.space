import { EditUserForm } from "./edit-user-form";

interface EditUserPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
    const { id } = await params;
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Edit User</h1>
                <p className="text-muted-foreground">
                    Update user account information and settings
                </p>
            </div>
            
            <EditUserForm userId={id} />
        </div>
    );
}
