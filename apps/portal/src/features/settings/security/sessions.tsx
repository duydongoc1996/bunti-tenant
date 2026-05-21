import { formatDistanceToNow } from "date-fns"
import { Loader2, LogOut, Monitor, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { authClient, useSession } from "@/data-provider/auth-provider"
import { ContentSection } from "../components/content-section"

type SessionRow = {
    id: string
    token: string
    userAgent?: string | null
    ipAddress?: string | null
    createdAt: Date | string
    expiresAt: Date | string
    updatedAt?: Date | string
}

function describeUserAgent(ua: string | null | undefined) {
    if (!ua) return "Unknown device"

    const browser = /Edg\//.test(ua)
        ? "Edge"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Firefox\//.test(ua)
            ? "Firefox"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Browser"

    const os = /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Android/.test(ua)
            ? "Android"
            : /iPhone|iPad|iOS/.test(ua)
              ? "iOS"
              : /Linux/.test(ua)
                ? "Linux"
                : "Unknown"

    return `${browser} on ${os}`
}

export function SessionsList() {
    const { data: current } = useSession()
    const [sessions, setSessions] = useState<SessionRow[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [revokingToken, setRevokingToken] = useState<string | null>(null)

    async function load() {
        setLoading(true)
        const { data, error } = await authClient.listSessions()
        setLoading(false)
        if (error) {
            toast.error(error.message ?? "Could not load sessions.")
            return
        }
        setSessions((data ?? []) as SessionRow[])
    }

    useEffect(() => {
        void load()
    }, [])

    async function onRevoke(token: string) {
        setRevokingToken(token)
        const { error } = await authClient.revokeSession({ token })
        setRevokingToken(null)
        if (error) {
            toast.error(error.message ?? "Could not log out session.")
            return
        }
        toast.success("Session logged out.")
        setSessions((prev) =>
            prev ? prev.filter((s) => s.token !== token) : prev
        )
    }

    if (loading && sessions === null) {
        return (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
                <Loader2 className="me-2 h-4 w-4 animate-spin" /> Loading
                sessions…
            </div>
        )
    }

    if (!sessions || sessions.length === 0) {
        return (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No active sessions.
            </div>
        )
    }

    const currentToken = current?.session?.token

    return (
        <ContentSection
            title="Sessions"
            desc="Manage your active sessions. Log out of any device you don't recognize."
        >
            <div className="space-y-6">
                <div className="grid gap-4">
                    {sessions.map((s) => {
                        const isCurrent = s.token === currentToken
                        const isExpired =
                            new Date(s.expiresAt).getTime() < Date.now()
                        return (
                            <Card key={s.id ?? s.token}>
                                <CardHeader>
                                    <div className="flex items-center justify-between gap-2">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Monitor className="h-4 w-4" />
                                            {describeUserAgent(s.userAgent)}
                                        </CardTitle>
                                        {isCurrent && (
                                            <Badge
                                                variant="secondary"
                                                className="gap-1 text-emerald-600 dark:text-emerald-400"
                                            >
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                This device
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription>
                                        {s.ipAddress
                                            ? `IP ${s.ipAddress}`
                                            : "IP unknown"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    <div>
                                        Signed in{" "}
                                        {formatDistanceToNow(
                                            new Date(s.createdAt),
                                            {
                                                addSuffix: true,
                                            }
                                        )}
                                    </div>
                                    <div>
                                        {isExpired ? "Expired " : "Expires "}
                                        {formatDistanceToNow(
                                            new Date(s.expiresAt),
                                            {
                                                addSuffix: true,
                                            }
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    {isExpired ? null : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onRevoke(s.token)}
                                            disabled={revokingToken === s.token}
                                        >
                                            {revokingToken === s.token ? (
                                                <Loader2 className="me-2 h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <LogOut className="me-2 h-3.5 w-3.5" />
                                            )}
                                            {isCurrent ? "Sign out" : "Log out"}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </ContentSection>
    )
}
