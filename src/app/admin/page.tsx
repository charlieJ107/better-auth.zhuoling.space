import { DashboardStats } from "@/app/admin/dashboard-stats";

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of system statistics and user activity
                </p>
            </div>
            
            <DashboardStats />
        </div>
    );
}
