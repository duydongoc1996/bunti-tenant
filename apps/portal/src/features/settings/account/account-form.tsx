import { zodResolver } from "@hookform/resolvers/zod"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { CheckCircle2, Loader2, MailWarning } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { authClient, useSession } from "@/data-provider/auth-provider"
import { cn } from "@/lib/utils"

const LANGUAGE_STORAGE_KEY = "boong:portal:locale"

const languages = [
    { label: "English", value: "en" },
    { label: "Tiếng Việt", value: "vi" },
] as const

type LanguageCode = (typeof languages)[number]["value"]

function isLanguageCode(value: string | null): value is LanguageCode {
    return value !== null && languages.some((l) => l.value === value)
}

async function applyLocale(locale: LanguageCode) {
    const { loadLocale } = await import("@boong/i18n")
    loadLocale(locale)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
}

const profileFormSchema = z.object({
    name: z
        .string()
        .min(1, "Please enter your name.")
        .min(2, "Name must be at least 2 characters.")
        .max(60, "Name must not be longer than 60 characters."),
    image: z
        .string()
        .trim()
        .refine((v) => v === "" || /^https?:\/\//i.test(v), {
            message: "Avatar must be a valid URL.",
        })
        .optional(),
    language: z.enum(["en", "vi"]),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

function getInitials(name: string | null | undefined, email: string) {
    const source = name?.trim() || email
    return source
        .split(/\s+/)
        .map((s) => s[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
}

export function AccountForm() {
    const { data: session, isPending } = useSession()
    const user = session?.user

    const [storedLocale, setStoredLocale] = useState<LanguageCode>("en")
    const [savingProfile, setSavingProfile] = useState(false)

    const [sendingVerification, setSendingVerification] = useState(false)

    useEffect(() => {
        const v = localStorage.getItem(LANGUAGE_STORAGE_KEY)
        if (isLanguageCode(v)) setStoredLocale(v)
    }, [])

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: { name: "", image: "", language: "en" },
        values: user
            ? {
                  name: user.name ?? "",
                  image: user.image ?? "",
                  language: storedLocale,
              }
            : undefined,
    })

    async function onProfileSubmit(data: ProfileFormValues) {
        setSavingProfile(true)
        const { error } = await authClient.updateUser({
            name: data.name,
            image: data.image || undefined,
        })
        setSavingProfile(false)

        if (error) {
            toast.error(error.message ?? "Could not update account.")
            return
        }

        await applyLocale(data.language)
        setStoredLocale(data.language)
        toast.success("Account updated.")
    }

    async function onSendVerification() {
        if (!user?.email) return
        setSendingVerification(true)
        const { error } = await authClient.sendVerificationEmail({
            email: user.email,
            callbackURL: `${window.location.origin}/settings`,
        })
        setSendingVerification(false)

        if (error) {
            toast.error(error.message ?? "Could not send verification email.")
            return
        }

        toast.success(`Verification email sent to ${user.email}.`)
    }

    if (isPending || !user) {
        return (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
                <Loader2 className="me-2 h-4 w-4 animate-spin" /> Loading…
            </div>
        )
    }

    const avatarPreview = profileForm.watch("image") || user.image || undefined

    return (
        <div className="space-y-8">
            <Form {...profileForm}>
                <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={avatarPreview} alt={user.name} />
                            <AvatarFallback>
                                {getInitials(user.name, user.email)}
                            </AvatarFallback>
                        </Avatar>
                        <FormField
                            control={profileForm.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Avatar URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com/avatar.png"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Paste a link to your avatar image.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is the name that will be displayed on
                                    your profile and in emails.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <div className="flex items-center gap-2">
                            <Input
                                value={user.email}
                                readOnly
                                disabled
                                className="flex-1"
                            />
                            {user.emailVerified ? (
                                <Badge
                                    variant="secondary"
                                    className="gap-1 text-emerald-600 dark:text-emerald-400"
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Verified
                                </Badge>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={onSendVerification}
                                    disabled={sendingVerification}
                                >
                                    {sendingVerification ? (
                                        <Loader2 className="me-1 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <MailWarning className="me-1 h-3.5 w-3.5" />
                                    )}
                                    Verify email
                                </Button>
                            )}
                        </div>
                        <FormDescription>
                            {user.emailVerified
                                ? "Your email has been verified."
                                : "Click verify to receive a confirmation link."}
                        </FormDescription>
                    </FormItem>

                    <FormField
                        control={profileForm.control}
                        name="language"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Language</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-60 justify-between",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? languages.find(
                                                          (l) =>
                                                              l.value ===
                                                              field.value
                                                      )?.label
                                                    : "Select language"}
                                                <CaretSortIcon className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-60 p-0">
                                        <Command>
                                            <CommandInput placeholder="Search language..." />
                                            <CommandEmpty>
                                                No language found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                <CommandList>
                                                    {languages.map(
                                                        (language) => (
                                                            <CommandItem
                                                                value={
                                                                    language.label
                                                                }
                                                                key={
                                                                    language.value
                                                                }
                                                                onSelect={() => {
                                                                    profileForm.setValue(
                                                                        "language",
                                                                        language.value,
                                                                        {
                                                                            shouldDirty: true,
                                                                        }
                                                                    )
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "size-4",
                                                                        language.value ===
                                                                            field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {language.label}
                                                            </CommandItem>
                                                        )
                                                    )}
                                                </CommandList>
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>
                                    Language used in the dashboard.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={savingProfile}>
                        {savingProfile && (
                            <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        )}
                        Update account
                    </Button>
                </form>
            </Form>

            <Separator />
        </div>
    )
}
