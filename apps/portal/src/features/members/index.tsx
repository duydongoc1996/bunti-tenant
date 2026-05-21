import { getRouteApi } from "@tanstack/react-router"
import { ConfigDrawer } from "@/components/config-drawer"
import { DefaultHeader } from "@/components/layout/default-header"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import {
    useActiveMember,
    useActiveOrganization,
} from "@/data-provider/auth-provider"
import { MembersDialogs } from "./components/members-dialogs"
import { MembersPrimaryButtons } from "./components/members-primary-buttons"
import { MembersProvider } from "./components/members-provider"
import { MembersTable } from "./components/members-table"
import { useMembersQuery } from "./data/members"

const route = getRouteApi("/_authenticated/org/$orgId/members/")

export function Members() {
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const { data: activeOrg } = useActiveOrganization()
    const { data: activeMember } = useActiveMember()
    const orgId = activeOrg?.id
    const role = activeMember?.role
    const canManage = role === "owner" || role === "admin"

    const { data, isLoading, error } = useMembersQuery(orgId)

    return (
        <MembersProvider canManage={canManage}>
            <DefaultHeader />

            <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Members
                        </h2>
                        <p className="text-muted-foreground">
                            Members of {activeOrg?.name ?? "this organization"}{" "}
                            and pending invitations.
                        </p>
                    </div>
                    <MembersPrimaryButtons canInvite={canManage} />
                </div>

                {error ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                        {error.message}
                    </div>
                ) : null}

                <MembersTable
                    data={data ?? []}
                    search={search}
                    navigate={navigate}
                    isLoading={isLoading || !orgId}
                />
            </Main>

            {orgId ? <MembersDialogs organizationId={orgId} /> : null}
        </MembersProvider>
    )
}
