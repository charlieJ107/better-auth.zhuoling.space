import { EditOAuthClientForm } from "@/app/admin/clients/[clientId]/edit-client-form";

interface EditOAuthClientPageProps {
    params: Promise<{ clientId: string }>;
}

export default async function EditOAuthClientPage({ params }: EditOAuthClientPageProps) {
    const { clientId } = await params;
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Edit OAuth Client</h1>
                <p className="text-muted-foreground">
                    Update OAuth client configuration and settings
                </p>
            </div>
            
            <EditOAuthClientForm clientId={clientId} />
        </div>
    );
}
