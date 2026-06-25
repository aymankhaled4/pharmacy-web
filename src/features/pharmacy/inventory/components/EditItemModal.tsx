/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useUpdateInventory } from "../hooks/useUpdateInventory";
import type { InventoryItem } from "../types/inventory.types";

interface EditItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem;
}

const editItemSchema = z.object({
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  selling_price: z.coerce.number().positive("Price must be greater than zero"),
  batch_number: z.string().optional(),
  expiry_date: z.string().optional(),
  discount_percent: z.coerce.number().min(0).max(100).optional(),
});

type EditItemFormInput = z.input<typeof editItemSchema>;
type EditItemFormValues = z.output<typeof editItemSchema>;

export function EditItemModal({
  open,
  onOpenChange,
  item,
}: EditItemModalProps) {
  const { mutate: updateItem, isPending } = useUpdateInventory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditItemFormInput, any, EditItemFormValues>({
    resolver: zodResolver(editItemSchema),
    defaultValues: {
      quantity: item.quantity,
      selling_price: item.selling_price,
      batch_number: item.batch_number ?? "",
      expiry_date: item.expiry_date ?? "",
      discount_percent: item.discount_percent ?? 0,
    },
  });

  // Re-populate form whenever the modal opens with fresh item data
  useEffect(() => {
    if (open) {
      reset({
        quantity: item.quantity,
        selling_price: item.selling_price,
        batch_number: item.batch_number ?? "",
        expiry_date: item.expiry_date ?? "",
        discount_percent: item.discount_percent ?? 0,
      });
    }
  }, [open, item, reset]);

  const onSubmit = (values: EditItemFormValues) => {
    updateItem(
      {
        id: item.id,
        payload: {
          quantity: values.quantity,
          selling_price: values.selling_price,
          batch_number: values.batch_number || undefined,
          expiry_date: values.expiry_date || undefined,
          discount_percent: values.discount_percent ?? 0,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Edit Drug</DialogTitle>
        </DialogHeader>

        {/* ── Read-only drug info banner ── */}
        <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2.5">
          <p className="text-sm font-medium text-gray-900">
            {item.drug.brand_name}
            {item.drug.strength ? ` ${item.drug.strength}` : ""}
          </p>
          {(item.drug.dosage_form || item.drug.generic_name) && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {[item.drug.dosage_form, item.drug.generic_name]
                .filter(Boolean)
                .join(" • ")}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ───────── Quantity + Price ───────── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                min={0}
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-xs text-red-500">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-selling_price">Price (EGP)</Label>
              <Input
                id="edit-selling_price"
                type="number"
                step="0.01"
                {...register("selling_price")}
              />
              {errors.selling_price && (
                <p className="text-xs text-red-500">
                  {errors.selling_price.message}
                </p>
              )}
            </div>
          </div>

          {/* ───────── Batch + Expiry ───────── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-batch_number">Batch Number (optional)</Label>
              <Input id="edit-batch_number" {...register("batch_number")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-expiry_date">Expiry Date (optional)</Label>
              <Input
                id="edit-expiry_date"
                type="date"
                {...register("expiry_date")}
              />
            </div>
          </div>

          {/* ───────── Discount ───────── */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-discount_percent">Discount % (optional)</Label>
            <Input
              id="edit-discount_percent"
              type="number"
              min={0}
              max={100}
              {...register("discount_percent")}
            />
            {errors.discount_percent && (
              <p className="text-xs text-red-500">
                {errors.discount_percent.message}
              </p>
            )}
          </div>

          {/* ───────── Actions ───────── */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-1.5 bg-[#014AB3] hover:bg-[#013a8f]">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
