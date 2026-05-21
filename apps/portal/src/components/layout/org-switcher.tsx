import { useNavigate } from "@tanstack/react-router"
import { Building2, ChevronsUpDown, Cog, Inbox } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    organization,
    UserRole,
    useActiveOrganization,
    useListOrganizations,
    useSession,
} from "@/data-provider/auth-provider"

export function OrgSwitcher() {
    const navigate = useNavigate()
    const { isMobile } = useSidebar()
    const { data: organizations } = useListOrganizations()
    const { data: activeOrg } = useActiveOrganization()
    const { data: session } = useSession()

    const orgs = organizations ?? []
    const current = activeOrg ?? orgs[0]
    const isAdmin = session?.user.role === UserRole.ADMIN

    async function handleSelect(orgId: string, slug?: string | null) {
        await organization.setActive({ organizationId: orgId })
        if (slug) {
            navigate({ to: "/org/$orgId", params: { orgId: slug } })
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <Building2 className="size-4" />
                            </div>
                            <div className="grid flex-1 text-start text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {current?.name ?? "Select organization"}
                                </span>
                                <span className="truncate text-xs">
                                    {current?.slug ?? "—"}
                                </span>
                            </div>
                            <ChevronsUpDown className="ms-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Organizations
                        </DropdownMenuLabel>
                        {orgs.map((org, index) => (
                            <DropdownMenuItem
                                key={org.id}
                                onClick={() => handleSelect(org.id, org.slug)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <Building2 className="size-4 shrink-0" />
                                </div>
                                {org.name}
                                <DropdownMenuShortcut>
                                    ⌘{index + 1}
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="gap-2 p-2"
                            onClick={() =>
                                navigate({ to: "/settings/invitation" })
                            }
                        >
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Inbox className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">
                                Invitations
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            hidden={!isAdmin}
                            className="gap-2 p-2"
                            onClick={() => navigate({ to: "/admin" })}
                        >
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Cog className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">
                                Administration
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
