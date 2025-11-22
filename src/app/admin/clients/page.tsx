import { OAuthClientsTable } from "./clients-table";

export default function OAuthClientsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">OAuth Clients</h1>
                    <p className="text-muted-foreground">
                        Manage OAuth2/OIDC client applications
                    </p>
                </div>
            </div>
            
            <OAuthClientsTable />
        </div>
    );
}
