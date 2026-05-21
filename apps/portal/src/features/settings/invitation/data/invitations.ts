import { useQuery } from "@tanstack/react-query"
import { organization } from "@/data-provider/auth-provider"

export type UserInvitation = {
    id: string
    email: string
    role: string
    status: "pending" | "accepted" | "rejected" | "canceled"
    organizationId: string
    organizationName?: string
    organizationSlug?: string
    inviterId?: string
    expiresAt?: Date
    createdAt?: Date
}

export const userInvitationsQueryKey = () => ["user", "invitations"] as const

function toInvitation(record: Record<string, unknown>): UserInvitation {
    return {
        id: String(record.id),
        email: String(record.email ?? ""),
        role: String(record.role ?? ""),
        status: (record.status as UserInvitation["status"]) ?? "pending",
        organizationId: String(record.organizationId ?? ""),
        organizationName: record.organizationName as string | undefined,
        organizationSlug: record.organizationSlug as string | undefined,
        inviterId: record.inviterId as string | undefined,
        expiresAt: record.expiresAt
            ? new Date(record.expiresAt as string)
            : undefined,
        createdAt: record.createdAt
            ? new Date(record.createdAt as string)
            : undefined,
    }
}

export function useUserInvitationsQuery() {
    return useQuery({
        queryKey: userInvitationsQueryKey(),
        queryFn: async () => {
            const r = await organization.listUserInvitations()
            if (r.error) {
                throw new Error(
                    r.error.message ?? "Failed to load your invitations."
                )
            }
            const records = (r.data ?? []) as unknown as Record<
                string,
                unknown
            >[]
            return records.map(toInvitation)
        },
    })
}
