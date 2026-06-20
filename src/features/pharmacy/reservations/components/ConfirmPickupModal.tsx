import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useConfirmPickup } from '../hooks/useConfirmPickup'

const schema = z.object({
  short_code: z
    .string()
    .trim()
    .regex(/^MC-[A-Z0-9]{4}$/i, 'Short code must be in the form MC-XXXX'),
})

type FormValues = z.infer<typeof schema>

interface ConfirmPickupModalProps {
  open: boolean
  defaultShortCode?: string
  onOpenChange: (open: boolean) => void
}

export default function ConfirmPickupModal({
  open,
  defaultShortCode,
  onOpenChange,
}: ConfirmPickupModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { short_code: defaultShortCode ?? '' },
  })

  const { mutate: confirmPickup, isPending } = useConfirmPickup(() => {
    onOpenChange(false)
    reset()
  })

  useEffect(() => {
    setValue('short_code', defaultShortCode ?? '')
  }, [defaultShortCode, setValue])

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit = (values: FormValues) => {
    confirmPickup(values.short_code.toUpperCase())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle>Confirm Pickup</DialogTitle>
          <DialogDescription>
            Enter the reservation short code to confirm pickup.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pickup code</label>
            <Input
              {...register('short_code')}
              placeholder="MC-XXXX"
              className={errors.short_code ? 'border-destructive' : ''}
            />
            {errors.short_code && (
              <p className="text-destructive text-xs">{errors.short_code.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#014AB3] text-white hover:bg-[#013F9A]"
            >
              {isPending ? 'Confirming...' : 'Confirm Pickup'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}