import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useDeleteInventory } from "../hooks/useDeleteInventory";
import type { InventoryItem } from "../types/inventory.types";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  item,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteItem, isPending } = useDeleteInventory();

  const handleDelete = () => {
    deleteItem(item.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const drugLabel = [item.drug.brand_name, item.drug.strength]
    .filter(Boolean)
    .join(" ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Drug from Inventory?</DialogTitle>
          <DialogDescription>
            You&apos;re about to permanently remove{" "}
            <span className="font-medium text-gray-900">{drugLabel}</span> from
            your inventory. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose className="cursor-pointer" disabled={isPending}>
            Cancel
          </DialogClose>
          <Button
            onClick={handleDelete}
            disabled={isPending}
            className="gap-1.5 bg-red-500 text-white hover:bg-red-600">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Remove"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
