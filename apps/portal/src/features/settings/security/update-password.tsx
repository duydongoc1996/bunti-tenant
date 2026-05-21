import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { PasswordInput } from "@/components/password-input"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { authClient } from "@/data-provider/auth-provider"
import { ContentSection } from "../components/content-section"

const passwordFormSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, "Please enter your current password."),
        newPassword: z
            .string()
            .min(7, "Password must be at least 7 characters long."),
        confirmPassword: z.string().min(1, "Please confirm your new password."),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: "Passwords don't match.",
        path: ["confirmPassword"],
    })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function UpdatePassword() {
    const [savingPassword, setSavingPassword] = useState(false)

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    async function onPasswordSubmit(data: PasswordFormValues) {
        setSavingPassword(true)
        const { error } = await authClient.changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            revokeOtherSessions: true,
        })
        setSavingPassword(false)

        if (error) {
            toast.error(error.message ?? "Could not update password.")
            return
        }

        toast.success("Password updated.")
        passwordForm.reset()
    }

    return (
        <ContentSection title="Password" desc="Update your password.">
            <div className="space-y-8">
                <Form {...passwordForm}>
                    <form
                        onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current password</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            placeholder="********"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New password</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            placeholder="********"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm new password</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            placeholder="********"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={savingPassword}>
                            {savingPassword && (
                                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                            )}
                            Update password
                        </Button>
                    </form>
                </Form>
            </div>
        </ContentSection>
    )
}
