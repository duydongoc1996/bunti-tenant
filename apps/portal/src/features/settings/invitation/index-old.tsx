import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Building2, Check, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { DefaultHeader } from "@/components/layout/default-header"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { ThemeSwitch } from "@/components/theme-switch"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { organization, resetAuthAtoms } from "@/data-provider/auth-provider"
import {
    type UserInvitation,
    userInvitationsQueryKey,
    useUserInvitationsQuery,
} from "./data/invitations"

export function Invitations() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { data, isLoading, error } = useUserInvitationsQuery()

    const accept = useMutation({
        mutationFn: async (inv: UserInvitation) => {
            const r = await organization.acceptInvitation({
                invitationId: inv.id,
            })
            if (r.error) {
                throw new Error(
                    r.error.message ?? "Could not accept invitation."
                )
            }
            return inv
        },
        onSuccess: (inv) => {
            queryClient.invalidateQueries({
                queryKey: userInvitationsQueryKey(),
            })
            queryClient.invalidateQueries({ queryKey: ["org", "members"] })
            resetAuthAtoms()
            toast.success(
                `Joined ${inv.organizationName ?? "the organization"}.`
            )
            if (inv.organizationSlug) {
                navigate({
                    to: "/org/$orgId",
                    params: { orgId: inv.organizationSlug },
                })
            }
        },
        onError: (err: Error) => toast.error(err.message),
    })

    const reject = useMutation({
        mutationFn: async (inv: UserInvitation) => {
            const r = await organization.rejectInvitation({
                invitationId: inv.id,
            })
            if (r.error) {
                throw new Error(
                    r.error.message ?? "Could not decline invitation."
                )
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: userInvitationsQueryKey(),
            })
            toast.success("Invitation declined.")
        },
        onError: (err: Error) => toast.error(err.message),
    })

    const invitations = data ?? []

    return (
        <>
            <DefaultHeader />

            <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Invitations
                    </h2>
                    <p className="text-muted-foreground">
                        Pending invitations across all organizations.
                    </p>
                </div>

                {error ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                        {error.message}
                    </div>
                ) : null}

                {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading invitations…
                    </div>
                ) : invitations.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No pending invitations</CardTitle>
                            <CardDescription>
                                You're up to date. When someone invites you to
                                an organization it'll show up here.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {invitations.map((inv) => (
                            <Card key={inv.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="size-4" />
                                        {inv.organizationName ?? "Organization"}
                                    </CardTitle>
                                    <CardDescription>
                                        Invited as{" "}
                                        <span className="font-semibold capitalize">
                                            {inv.role}
                                        </span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    For {inv.email}
                                    {inv.expiresAt ? (
                                        <>
                                            {" · expires "}
                                            {inv.expiresAt.toLocaleDateString()}
                                        </>
                                    ) : null}
                                </CardContent>
                                <CardFooter className="gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => reject.mutate(inv)}
                                        disabled={
                                            accept.isPending || reject.isPending
                                        }
                                    >
                                        {reject.isPending &&
                                        reject.variables?.id === inv.id ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <X />
                                        )}
                                        Decline
                                    </Button>
                                    <Button
                                        onClick={() => accept.mutate(inv)}
                                        disabled={
                                            accept.isPending ||
                                            reject.isPending ||
                                            (inv.expiresAt &&
                                                inv.expiresAt < new Date())
                                        }
                                    >
                                        {accept.isPending &&
                                        accept.variables?.id === inv.id ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <Check />
                                        )}
                                        Accept
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </Main>
        </>
    )
}
