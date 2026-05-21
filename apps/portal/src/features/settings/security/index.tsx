import { SessionsList } from "./sessions"
import { UpdatePassword } from "./update-password"

export function SettingsSecurity() {
    return (
        <div className="grid h-full w-full grid-cols-1 gap-8 overflow-y-auto pb-12 lg:grid-cols-2 lg:overflow-hidden lg:pb-0">
            <UpdatePassword />
            <SessionsList />
        </div>
    )
}
