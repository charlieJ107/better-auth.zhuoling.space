import { CreateUserForm } from "./create-user-form";

export default function CreateUserPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Create New User</h1>
                <p className="text-muted-foreground">
                    Add a new user account to the system
                </p>
            </div>
            
            <CreateUserForm />
        </div>
    );
}
