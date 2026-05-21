import { ConfigDrawer } from "@/components/config-drawer"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { Header } from "./header"

export function DefaultHeader({ children }: { children?: React.ReactNode }) {
    return (
        <Header>
            {children}
            <Search className="ms-auto" />
            <ThemeSwitch />
            <ConfigDrawer />
        </Header>
    )
}
