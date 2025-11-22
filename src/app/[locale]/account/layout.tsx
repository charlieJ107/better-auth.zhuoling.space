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
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Activity, KeyRound, Lock, User } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";
import { Locale, locales } from "@/lib/i18n";
import Link from "next/link";
import Logo from "@/components/logo";

export default async function AccountLayout({ children, params }: { children: React.ReactNode, params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    if (!locales.includes(locale as Locale)) {
        return notFound();
    }
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect(`/${locale}/login?callbackURL=/${locale}/account`);
    }
    const dict = await getDictionary(locale as Locale);
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
                            {dict.pages.account.account}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href={`/${locale}/account`}>
                                            <Activity className="size-4" />
                                            <span>{dict.pages.account.dashboard}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href={`/${locale}/account/info`}>
                                            <User className="size-4" />
                                            <span>{dict.pages.account.profile}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href={`/${locale}/account/password`}>
                                            <Lock className="size-4" />
                                            <span>{dict.pages.account.password}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href={`/${locale}/account/api-keys`}>
                                            <KeyRound className="size-4" />
                                            <span>{dict.pages.account.apiKeys}</span>
                                        </Link>
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
                    }} locale={locale as Locale} />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
            {children}
        </SidebarProvider>
    );
}