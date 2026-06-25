/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Search, Check, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAddInventory } from "../hooks/useAddInventory";
import { useDrugSearch } from "../hooks/useDrugSearch";
import type { DrugInfo } from "../types/inventory.types";

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const addItemSchema = z.object({
  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be greater than zero"),
  selling_price: z.coerce.number().positive("Price must be greater than zero"),
  batch_number: z.string().optional(),
  expiry_date: z.string().optional(),
  discount_percent: z.coerce.number().min(0).max(100).optional(),
});

type AddItemFormInput = z.input<typeof addItemSchema>;
type AddItemFormValues = z.output<typeof addItemSchema>;

export function AddItemModal({ open, onOpenChange }: AddItemModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [showResults, setShowResults] = useState(false);

  const { data: drugResults, isLoading: isSearching } =
    useDrugSearch(searchTerm);
  const { mutate: addItem, isPending } = useAddInventory();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<AddItemFormInput, any, AddItemFormValues>({
    resolver: zodResolver(addItemSchema),
  });

  const resetAll = () => {
    setSearchTerm("");
    setSelectedDrug(null);
    setShowResults(false);
    resetForm();
  };

  const handleClose = () => {
    resetAll();
    onOpenChange(false);
  };

  const handleSelectDrug = (drug: DrugInfo) => {
    setSelectedDrug(drug);
    setSearchTerm(drug.brand_name);
    setShowResults(false);
  };

  const handleChangeDrug = () => {
    setSelectedDrug(null);
    setSearchTerm("");
    setShowResults(false);
  };

  const onSubmit = (values: AddItemFormValues) => {
    if (!selectedDrug) return; // Submit button is disabled in this case anyway — extra safety
    console.log(selectedDrug);
    addItem(
      {
        drug_id: selectedDrug.drug_id,
        quantity: values.quantity,
        selling_price: values.selling_price,
        batch_number: values.batch_number || undefined,
        expiry_date: values.expiry_date || undefined,
        discount_percent: values.discount_percent ?? 0,
      },
      {
        onSuccess: () => handleClose(),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Add New Drug</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ───────── Drug Search / Selection ───────── */}
          <div className="space-y-1.5">
            <Label>Drug</Label>

            {selectedDrug ? (
              <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">
                      {selectedDrug.brand_name}
                    </p>
                    {(selectedDrug.strength || selectedDrug.dosage_form) && (
                      <p className="text-xs text-muted-foreground">
                        {[selectedDrug.strength, selectedDrug.dosage_form]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleChangeDrug}>
                  <X className="h-4 w-4" />
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by drug name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="pl-9"
                  autoComplete="off"
                />

                {/* Dropdown results */}
                {showResults && searchTerm.trim().length >= 2 && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-y-auto">
                    {isSearching && (
                      <div className="px-3 py-3 text-sm text-muted-foreground">
                        Searching...
                      </div>
                    )}

                    {!isSearching && drugResults?.length === 0 && (
                      <div className="px-3 py-3 text-sm text-muted-foreground">
                        No matching results
                      </div>
                    )}

                    {!isSearching &&
                      drugResults?.map((drug) => (
                        <button
                          key={drug.drug_id}
                          type="button"
                          onClick={() => handleSelectDrug(drug)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0">
                          <p className="text-sm font-medium">
                            {drug.brand_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {[
                              drug.brand_name_ar,
                              drug.strength,
                              drug.dosage_form,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {!selectedDrug && (
              <p className="text-xs text-muted-foreground">
                Select a drug from the search results.
              </p>
            )}
          </div>

          {/* ───────── Quantity + Price ───────── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" {...register("quantity")} />
              {errors.quantity && (
                <p className="text-xs text-red-500">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="selling_price">Price (EGP)</Label>
              <Input
                id="selling_price"
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
              <Label htmlFor="batch_number">Batch Number (optional)</Label>
              <Input id="batch_number" {...register("batch_number")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expiry_date">Expiry Date (optional)</Label>
              <Input
                id="expiry_date"
                type="date"
                {...register("expiry_date")}
              />
            </div>
          </div>

          {/* ───────── Discount ───────── */}
          <div className="space-y-1.5">
            <Label htmlFor="discount_percent">Discount % (optional)</Label>
            <Input
              id="discount_percent"
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedDrug || isPending}
              className="gap-1.5 bg-[#014AB3] hover:bg-[#013a8f]">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "Add Drug"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
