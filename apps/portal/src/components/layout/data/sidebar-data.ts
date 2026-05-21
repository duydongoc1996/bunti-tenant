import {
    Bell,
    Bug,
    Building2,
    Construction,
    FileX,
    HelpCircle,
    Inbox,
    LayoutDashboard,
    ListTodo,
    Lock,
    MessagesSquare,
    Monitor,
    Package,
    Palette,
    ServerOff,
    Settings,
    ShieldCheck,
    UserCog,
    Users,
    UsersRound,
    UserX,
} from "lucide-react"
import {
    UserRole,
    useActiveOrganization,
    useListOrganizations,
    useSession,
} from "@/data-provider/auth-provider"
import type { SidebarData } from "../types"

export function useSidebarData(): SidebarData {
    const { data: activeOrg } = useActiveOrganization()
    const { data: orgs } = useListOrganizations()
    const { data: session } = useSession()

    const slug = activeOrg?.slug ?? orgs?.[0]?.slug
    const orgBase = slug ? `/org/${slug}` : ""
    const hasOrg = activeOrg || (orgs && orgs.length > 0)
    const isAdmin = session?.user.role === UserRole.ADMIN

    return {
        navGroups: [
            {
                title: "General",
                isHidden: !hasOrg,
                items: [
                    {
                        title: "Dashboard",
                        url: orgBase ? `${orgBase}` : "/",
                        icon: LayoutDashboard,
                    },
                    {
                        title: "Tasks",
                        url: `${orgBase}/tasks`,
                        icon: ListTodo,
                    },
                    {
                        title: "Apps",
                        url: `${orgBase}/apps`,
                        icon: Package,
                    },
                    {
                        title: "Chats",
                        url: `${orgBase}/chats`,
                        badge: "3",
                        icon: MessagesSquare,
                    },
                    {
                        title: "Members",
                        url: `${orgBase}/members`,
                        icon: UsersRound,
                    },
                ],
            },
            {
                title: "Admin",
                isHidden: !isAdmin,
                items: [
                    {
                        title: "Users",
                        url: "/admin/users",
                        icon: Users,
                    },
                    {
                        title: "Organizations",
                        url: "/admin/organizations",
                        icon: Building2,
                    },
                ],
            },
            {
                title: "Pages",
                isHidden: true,
                items: [
                    {
                        title: "Auth",
                        icon: ShieldCheck,
                        items: [
                            { title: "Sign In", url: "/sign-in" },
                            { title: "Sign Up", url: "/sign-up" },
                            {
                                title: "Forgot Password",
                                url: "/forgot-password",
                            },
                        ],
                    },
                    {
                        title: "Errors",
                        icon: Bug,
                        items: [
                            {
                                title: "Unauthorized",
                                url: "/errors/unauthorized",
                                icon: Lock,
                            },
                            {
                                title: "Forbidden",
                                url: "/errors/forbidden",
                                icon: UserX,
                            },
                            {
                                title: "Not Found",
                                url: "/errors/not-found",
                                icon: FileX,
                            },
                            {
                                title: "Internal Server Error",
                                url: "/errors/internal-server-error",
                                icon: ServerOff,
                            },
                            {
                                title: "Maintenance Error",
                                url: "/errors/maintenance-error",
                                icon: Construction,
                            },
                        ],
                    },
                ],
            },
            {
                title: "Other",
                isHidden: true,
                items: [
                    {
                        title: "Settings",
                        icon: Settings,
                        items: [
                            {
                                title: "Account",
                                url: "/settings",
                                icon: UserCog,
                            },
                            {
                                title: "Security",
                                url: "/settings/security",
                                icon: ShieldCheck,
                            },
                            {
                                title: "Invitations",
                                url: "/settings/invitation",
                                icon: Inbox,
                            },
                            {
                                title: "Appearance",
                                url: "/settings/appearance",
                                icon: Palette,
                            },
                            {
                                title: "Notifications",
                                url: "/settings/notifications",
                                icon: Bell,
                            },
                            {
                                title: "Display",
                                url: "/settings/display",
                                icon: Monitor,
                            },
                        ],
                    },
                    {
                        title: "Help Center",
                        url: `${orgBase}/help-center`,
                        icon: HelpCircle,
                    },
                ],
            },
        ],
    }
}
