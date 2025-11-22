import { CreateOAuthClientForm } from "./create-client-form";

export default function CreateOAuthClientPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Create OAuth Client</h1>
                <p className="text-muted-foreground">
                    Register a new OAuth2/OIDC client application
                </p>
            </div>
            
            <CreateOAuthClientForm />
        </div>
    );
}
