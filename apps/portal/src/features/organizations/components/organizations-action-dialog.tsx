import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { organization } from "@/data-provider/auth-provider"
import type { Organization } from "../data/schema"

const slugRegex = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/

const formSchema = z.object({
    name: z.string().min(1, "Name is required."),
    slug: z
        .string()
        .min(1, "Slug is required.")
        .regex(
            slugRegex,
            "Slug must be lowercase, alphanumeric or dashes (max 40 chars)."
        ),
    logo: z.string().url().or(z.literal("")).optional(),
})

type OrgActionForm = z.infer<typeof formSchema>

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: Organization
}

export function OrganizationsActionDialog({
    open,
    onOpenChange,
    currentRow,
}: Props) {
    const isEdit = !!currentRow
    const queryClient = useQueryClient()

    const form = useForm<OrgActionForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: currentRow?.name ?? "",
            slug: currentRow?.slug ?? "",
            logo: currentRow?.logo ?? "",
        },
    })

    useEffect(() => {
        form.reset({
            name: currentRow?.name ?? "",
            slug: currentRow?.slug ?? "",
            logo: currentRow?.logo ?? "",
        })
    }, [currentRow, form])

    const mutation = useMutation({
        mutationFn: async (values: OrgActionForm) => {
            if (isEdit && currentRow) {
                const r = await organization.update({
                    organizationId: currentRow.id,
                    data: {
                        name: values.name,
                        slug: values.slug,
                        logo: values.logo || undefined,
                    },
                })
                if (r.error) {
                    throw new Error(
                        r.error.message ?? "Could not update organization."
                    )
                }
                return
            }

            const r = await organization.create({
                name: values.name,
                slug: values.slug,
                logo: values.logo || undefined,
            })
            if (r.error) {
                throw new Error(
                    r.error.message ?? "Could not create organization."
                )
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "organizations"],
            })
            toast.success(
                isEdit ? "Organization updated." : "Organization created."
            )
            onOpenChange(false)
        },
        onError: (err: Error) => {
            toast.error(err.message)
        },
    })

    return (
        <Dialog
            open={open}
            onOpenChange={(state) => {
                form.reset()
                onOpenChange(state)
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-start">
                    <DialogTitle>
                        {isEdit ? "Edit organization" : "New organization"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the organization's display name, slug, or logo."
                            : "Create a new organization. You will be added as its owner."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="organizations-action-form"
                        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Acme Inc."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="acme"
                                            autoCapitalize="off"
                                            spellCheck={false}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo URL (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://…"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter className="gap-y-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={mutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="organizations-action-form"
                        disabled={mutation.isPending}
                    >
                        {isEdit ? "Save" : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
