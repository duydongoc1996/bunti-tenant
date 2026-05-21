import { useMutation, useQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { Building2, Check, Loader2, MailWarning, X } from "lucide-react"
import { useEffect } from "react"
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
import {
    organization,
    signOut,
    useSession,
} from "@/data-provider/auth-provider"

const route = getRouteApi("/(auth)/accept-invitation/$invitationId")

type InvitationDetails = {
    id: string
    email: string
    role: string
    status: string
    organizationId: string
    organizationName?: string
    organizationSlug?: string
    expiresAt?: string
}

export function AcceptInvitation() {
    const { invitationId } = route.useParams()
    const navigate = useNavigate()
    const { data: session, isPending: sessionPending } = useSession()

    useEffect(() => {
        if (sessionPending) return
        if (!session) {
            navigate({
                to: "/sign-in",
                search: { redirect: `/accept-invitation/${invitationId}` },
                replace: true,
            })
        }
    }, [session, sessionPending, invitationId, navigate])

    const invitationQuery = useQuery({
        queryKey: ["invitation", invitationId],
        enabled: !!session,
        queryFn: async () => {
            const r = await organization.getInvitation({
                query: { id: invitationId },
            })
            if (r.error) {
                throw new Error(r.error.message ?? "Invitation not found.")
            }
            return r.data as unknown as InvitationDetails
        },
    })

    const acceptMutation = useMutation({
        mutationFn: async () => {
            const r = await organization.acceptInvitation({ invitationId })
            if (r.error) {
                throw new Error(
                    r.error.message ?? "Could not accept invitation."
                )
            }
            return r.data
        },
        onSuccess: () => {
            const slug = invitationQuery.data?.organizationSlug
            toast.success("Invitation accepted.")
            if (slug) {
                navigate({
                    to: "/org/$orgId",
                    params: { orgId: slug },
                    replace: true,
                })
            } else {
                navigate({ to: "/", replace: true })
            }
        },
        onError: (err: Error) => toast.error(err.message),
    })

    const rejectMutation = useMutation({
        mutationFn: async () => {
            const r = await organization.rejectInvitation({ invitationId })
            if (r.error) {
                throw new Error(
                    r.error.message ?? "Could not reject invitation."
                )
            }
            return r.data
        },
        onSuccess: () => {
            toast.success("Invitation declined.")
            navigate({ to: "/", replace: true })
        },
        onError: (err: Error) => toast.error(err.message),
    })

    if (sessionPending || !session) {
        return (
            <Centered>
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </Centered>
        )
    }

    if (invitationQuery.isPending) {
        return (
            <Centered>
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </Centered>
        )
    }

    if (invitationQuery.error) {
        return (
            <Centered>
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MailWarning className="text-destructive" />
                            Invitation unavailable
                        </CardTitle>
                        <CardDescription>
                            {invitationQuery.error.message}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button
                            variant="outline"
                            onClick={() => navigate({ to: "/" })}
                        >
                            Back to app
                        </Button>
                    </CardFooter>
                </Card>
            </Centered>
        )
    }

    const inv = invitationQuery.data
    const sessionEmail = session.user.email
    const emailMatches =
        inv.email.trim().toLowerCase() === sessionEmail.trim().toLowerCase()
    const isPending = inv.status === "pending"

    if (!emailMatches) {
        return (
            <Centered>
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MailWarning className="text-destructive" />
                            Wrong account
                        </CardTitle>
                        <CardDescription>
                            This invitation was sent to{" "}
                            <span className="font-semibold">{inv.email}</span>{" "}
                            but you're signed in as{" "}
                            <span className="font-semibold">
                                {sessionEmail}
                            </span>
                            .
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate({ to: "/" })}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                await signOut()
                                navigate({
                                    to: "/sign-in",
                                    search: {
                                        redirect: `/accept-invitation/${invitationId}`,
                                    },
                                    replace: true,
                                })
                            }}
                        >
                            Sign in as {inv.email}
                        </Button>
                    </CardFooter>
                </Card>
            </Centered>
        )
    }

    if (!isPending) {
        return (
            <Centered>
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Invitation no longer pending</CardTitle>
                        <CardDescription>
                            This invitation is currently{" "}
                            <span className="font-semibold">{inv.status}</span>.
                            Nothing to do here.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button
                            variant="outline"
                            onClick={() => navigate({ to: "/" })}
                        >
                            Back to app
                        </Button>
                    </CardFooter>
                </Card>
            </Centered>
        )
    }

    return (
        <Centered>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 />
                        {inv.organizationName ?? "Organization"}
                    </CardTitle>
                    <CardDescription>
                        You've been invited to join as{" "}
                        <span className="font-semibold capitalize">
                            {inv.role}
                        </span>
                        .
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">
                        Invitation for{" "}
                        <span className="font-medium text-foreground">
                            {inv.email}
                        </span>
                        .
                    </div>
                </CardContent>
                <CardFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => rejectMutation.mutate()}
                        disabled={
                            acceptMutation.isPending || rejectMutation.isPending
                        }
                    >
                        {rejectMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <X />
                        )}
                        Decline
                    </Button>
                    <Button
                        onClick={() => acceptMutation.mutate()}
                        disabled={
                            acceptMutation.isPending || rejectMutation.isPending
                        }
                    >
                        {acceptMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <Check />
                        )}
                        Accept
                    </Button>
                </CardFooter>
            </Card>
        </Centered>
    )
}

function Centered({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-svh items-center justify-center p-4">
            {children}
        </div>
    )
}
