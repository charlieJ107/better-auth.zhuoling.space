import { TeamSwitcher } from "@/components/team-switcher";
import {
    SidebarProvider,
    SidebarHeader,
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarRail,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Activity, Users, BarChart3, Settings, Key } from "lucide-react";
import Logo from "@/components/logo";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/login?callbackURL=/admin');
    }

    if (session.user.role !== 'admin') {
        redirect('/unauthorized');
    }

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader className="flex items-center justify-between my-4">
                    <Logo className="flex items-center flex-col gap-2" />
                    <TeamSwitcher teams={[]} />
                </SidebarHeader>
                <SidebarSeparator className="my-4 ml-0" />
                <SidebarContent>
                    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                        <SidebarGroupLabel>
                            Admin Dashboard
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/admin">
                                            <BarChart3 className="size-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/admin/users">
                                            <Users className="size-4" />
                                            <span>User Management</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/admin/clients">
                                            <Key className="size-4" />
                                            <span>OAuth Clients</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                        <SidebarGroupLabel>
                            System
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton disabled>
                                        <Activity className="size-4" />
                                        <span>Sessions</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton disabled>
                                        <Settings className="size-4" />
                                        <span>Settings</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarSeparator className="mt-4 ml-0" />
                <SidebarFooter>
                    <NavUser user={{
                        name: session.user.name,
                        email: session.user.email,
                        avatar: session.user.image || undefined,
                    }} locale="en" />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
            <div className="flex-1 p-6">
                {children}
            </div>
        </SidebarProvider>
    );
}