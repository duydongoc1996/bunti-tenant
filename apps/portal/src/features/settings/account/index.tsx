import { ContentSection } from "../components/content-section"
import { AccountForm } from "./account-form"

export function SettingsAccount() {
    return (
        <ContentSection
            title="Account"
            desc="Update your name, avatar, email verification, language, and password."
        >
            <AccountForm />
        </ContentSection>
    )
}
