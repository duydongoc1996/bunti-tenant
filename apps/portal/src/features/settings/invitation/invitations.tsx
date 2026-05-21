import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Building2, Check, Loader2, X } from "lucide-react"
import { toast } from "sonner"
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
import { ContentSection } from "../components/content-section"
import {
    type UserInvitation,
    userInvitationsQueryKey,
    useUserInvitationsQuery,
} from "./data/invitations"

export function InvitationsList() {
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
        <ContentSection
            title="Invitations"
            desc="Manage your active invitations. Accept or reject any invitation you receive."
        >
            <div className="space-y-6">
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
                    <div className="grid grid-cols-1 w-full justify-items-stretch gap-4">
                        {invitations.map((inv) => (
                            <Card
                                key={inv.id}
                                className="flex flex-col justify-between"
                            >
                                <div>
                                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                                        {/* Left Side: Title and Subtitle */}
                                        <div className="space-y-1.5 min-w-0">
                                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                                <Building2 className="size-4 shrink-0" />
                                                <span className="truncate">
                                                    {inv.organizationName ??
                                                        "Organization"}
                                                </span>
                                            </CardTitle>
                                            <CardDescription>
                                                Invited as{" "}
                                                <span className="font-semibold capitalize">
                                                    {inv.role}
                                                </span>
                                            </CardDescription>
                                        </div>

                                        {/* Right Side: Inline Action Buttons */}
                                        <div className="flex flex-row items-center gap-2 shrink-0">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="shrink-0"
                                                onClick={() =>
                                                    reject.mutate(inv)
                                                }
                                                disabled={
                                                    accept.isPending ||
                                                    reject.isPending
                                                }
                                            >
                                                {reject.isPending &&
                                                reject.variables?.id ===
                                                    inv.id ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : (
                                                    <X className="size-4 sm:hidden" />
                                                )}
                                                <span className="hidden sm:inline">
                                                    Decline
                                                </span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="shrink-0"
                                                onClick={() =>
                                                    accept.mutate(inv)
                                                }
                                                disabled={
                                                    accept.isPending ||
                                                    reject.isPending ||
                                                    (inv.expiresAt &&
                                                        inv.expiresAt <
                                                            new Date())
                                                }
                                            >
                                                {accept.isPending &&
                                                accept.variables?.id ===
                                                    inv.id ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : (
                                                    <Check className="size-4 sm:hidden" />
                                                )}
                                                <span className="hidden sm:inline">
                                                    Accept
                                                </span>
                                            </Button>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="text-sm text-muted-foreground pt-0">
                                        For {inv.email}
                                        {inv.expiresAt ? (
                                            <>
                                                {" · expires "}
                                                {inv.expiresAt.toLocaleDateString()}
                                            </>
                                        ) : null}
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </ContentSection>
    )
}
