import { createFileRoute } from "@tanstack/react-router"
import { SettingsInvitation } from "@/features/settings/invitation"

export const Route = createFileRoute("/_authenticated/settings/invitation")({
    component: SettingsInvitation,
})
