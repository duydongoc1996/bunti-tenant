import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { SelectDropdown } from "@/components/select-dropdown"
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
import { organization } from "@/data-provider/auth-provider"
import { membersQueryKey } from "../data/members"
import { type MemberRow, orgRoleSchema } from "../data/schema"

const formSchema = z.object({
    role: orgRoleSchema,
})

type UpdateRoleForm = z.infer<typeof formSchema>

const roleOptions = [
    { label: "Member", value: "member" },
    { label: "Admin", value: "admin" },
    { label: "Owner", value: "owner" },
] as const

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: MemberRow
    organizationId: string
}

export function UpdateRoleDialog({
    open,
    onOpenChange,
    currentRow,
    organizationId,
}: Props) {
    const queryClient = useQueryClient()

    const form = useForm<UpdateRoleForm>({
        resolver: zodResolver(formSchema),
        defaultValues: { role: currentRow.role },
    })

    useEffect(() => {
        form.reset({ role: currentRow.role })
    }, [currentRow.role, form])

    const mutation = useMutation({
        mutationFn: async (values: UpdateRoleForm) => {
            if (!currentRow.memberId) {
                throw new Error("Member id missing.")
            }
            if (values.role === currentRow.role) return
            const r = await organization.updateMemberRole({
                memberId: currentRow.memberId,
                role: values.role,
                organizationId,
            })
            if (r.error) {
                throw new Error(r.error.message ?? "Could not update role.")
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: membersQueryKey(organizationId),
            })
            toast.success("Role updated.")
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
                form.reset({ role: currentRow.role })
                onOpenChange(state)
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-start">
                    <DialogTitle>Update role</DialogTitle>
                    <DialogDescription>
                        Change the role for{" "}
                        <span className="font-medium">
                            {currentRow.name ?? currentRow.email}
                        </span>
                        .
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="update-role-form"
                        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <FormControl>
                                        <SelectDropdown
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Select a role"
                                            items={roleOptions.map(
                                                ({ label, value }) => ({
                                                    label,
                                                    value,
                                                })
                                            )}
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
                        form="update-role-form"
                        disabled={mutation.isPending}
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
