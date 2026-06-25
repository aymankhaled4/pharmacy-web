// import { useState, useRef, useEffect } from "react";
// import { toast } from "sonner";
// import { useQueryClient } from "@tanstack/react-query";
// import { AddItemModal } from "../components/AddItemModal";

// import {
//   Package,
//   Clock,
//   TrendingDown,
//   Search,
//   SlidersHorizontal,
//   Upload,
//   Minus,
//   Plus,
//   Percent,
//   AlertTriangle,
//   ChevronLeft,
//   ChevronRight,
//   ChevronDown,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";
// import { useInventory } from "../hooks/useInventory";
// import { useUpdateInventory } from "../hooks/useUpdateInventory";
// import { useSetDiscount } from "../hooks/useSetDiscount";
// import { useImportStatus } from "../../import/hooks/useImportStatus";
// import ImportDataModal from "../components/ImportDataModal";
// import type { InventoryItem } from "../types/inventory.types";

// // ── helpers ───────────────────────────────────────────────────
// function formatDate(dateStr?: string) {
//   if (!dateStr) return "—";
//   return new Date(dateStr).toISOString().slice(0, 10);
// }

// function isNearExpiry(dateStr?: string) {
//   if (!dateStr) return false;
//   const days = Math.ceil(
//     (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
//   );
//   return days >= 0 && days <= 90;
// }

// function isExpired(dateStr?: string) {
//   if (!dateStr) return false;
//   return new Date(dateStr).getTime() < Date.now();
// }

// // ── KPI Card ──────────────────────────────────────────────────
// function KpiCard({
//   icon,
//   value,
//   label,
//   sublabel,
// }: {
//   icon: React.ReactNode;
//   value: number | string;
//   label: string;
//   sublabel: string;
// }) {
//   return (
//     <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//       <div className="flex items-start justify-between">
//         <div>
//           <p className="text-3xl font-bold tracking-tight text-gray-900">
//             {value}
//           </p>
//           <p className="mt-1 text-sm font-medium text-gray-700">{label}</p>
//           <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>
//         </div>
//         <div className="mt-0.5 opacity-20">{icon}</div>
//       </div>
//     </div>
//   );
// }

// // ── Status Badge ──────────────────────────────────────────────
// const LOW_STOCK_THRESHOLD = 10;

// function StatusBadge({ item }: { item: InventoryItem }) {
//   if (item.status === "expired" || isExpired(item.expiry_date)) {
//     return (
//       <span className="inline-flex w-fit items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
//         <AlertTriangle className="h-3 w-3" /> Expired
//       </span>
//     );
//   }
//   if (item.status === "out_of_stock" || item.quantity === 0) {
//     return (
//       <span className="inline-flex w-fit items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
//         <AlertTriangle className="h-3 w-3" /> Out of Stock
//       </span>
//     );
//   }
//   if (item.quantity > 0 && item.quantity <= LOW_STOCK_THRESHOLD) {
//     return (
//       <span className="inline-flex w-fit items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-600">
//         <AlertTriangle className="h-3 w-3" /> Low Stock
//       </span>
//     );
//   }
//   if (isNearExpiry(item.expiry_date)) {
//     return (
//       <span className="inline-flex w-fit items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-600">
//         <AlertTriangle className="h-3 w-3" /> Near Expiry
//       </span>
//     );
//   }
//   return (
//     <span className="inline-flex w-fit rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
//       In Stock
//     </span>
//   );
// }

// // ── Main Page ─────────────────────────────────────────────────
// export default function InventoryPage() {
//   const queryClient = useQueryClient();
//   const [addItemOpen, setAddItemOpen] = useState(false);
//   const [importOpen, setImportOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("");
//   const [filterOpen, setFilterOpen] = useState(false);
//   const [page, setPage] = useState(1);
//   const limit = 10;

//   // Background polling — stays active even when modal is closed
//   const [bgJobId] = useState<string | null>(() =>
//     sessionStorage.getItem("dawak_import_job_id"),
//   );
//   const { data: bgJobStatus } = useImportStatus(bgJobId);

//   // When background job completes, refresh inventory
//   useEffect(() => {
//     if (!bgJobStatus) return;
//     if (bgJobStatus.state === "completed" && bgJobStatus.result) {
//       sessionStorage.removeItem("dawak_import_job_id");
//       queryClient.invalidateQueries({
//         queryKey: ["inventory"],
//         refetchType: "all",
//       });
//     }
//   }, [bgJobStatus, queryClient]);

//   const {
//     data,
//     isLoading,
//     isError,
//     error,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//   } = useInventory({ search });

//   // Flatten all pages
//   const allItems = data?.pages.flatMap((p) => p.items) ?? [];
//   // total comes from the first page (DB count, unaffected by cursor)
//   const dbTotal = data?.pages[0]?.total ?? allItems.length;

//   // Client-side status filter + pagination
//   const filteredItems = statusFilter
//     ? allItems.filter((i) => {
//         if (statusFilter === "near_expiry") return isNearExpiry(i.expiry_date);
//         if (statusFilter === "expired")
//           return i.status === "expired" || isExpired(i.expiry_date);
//         if (statusFilter === "out_of_stock")
//           return i.status === "out_of_stock" || i.quantity === 0;
//         if (statusFilter === "low_stock")
//           return i.quantity > 0 && i.quantity <= LOW_STOCK_THRESHOLD;
//         return i.status === statusFilter;
//       })
//     : allItems;

//   const totalItems = filteredItems.length;
//   const totalPages = Math.max(1, Math.ceil(totalItems / limit));
//   const items = filteredItems.slice((page - 1) * limit, page * limit);

//   const totalInventory = dbTotal;
//   const expiringCount = allItems.filter((i) =>
//     isNearExpiry(i.expiry_date),
//   ).length;
//   const outOfStockCount = allItems.filter((i) => i.quantity === 0).length;

//   const statusOptions = [
//     { value: "", label: "All" },
//     { value: "low_stock", label: "Low Stock" },
//     { value: "out_of_stock", label: "Out of Stock" },
//     { value: "near_expiry", label: "Near Expiry" },
//     { value: "expired", label: "Expired" },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* ── Page Header ─────────────────────────────────────── */}
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">
//             Inventory Management
//           </h1>
//           <p className="mt-0.5 text-sm text-gray-500">
//             Monitor stock levels, track expiry dates, and manage drug
//             availability.
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             className="gap-1.5"
//             onClick={() => setAddItemOpen(true)}>
//             <Plus className="h-4 w-4" />
//             Add Drug
//           </Button>
//           <Button
//             size="sm"
//             className="gap-1.5 bg-[#014AB3] hover:bg-[#013a8f]"
//             onClick={() => setImportOpen(true)}>
//             <Upload className="h-4 w-4" />
//             Import Data
//           </Button>
//         </div>
//       </div>

//       {/* ── KPI Cards ───────────────────────────────────────── */}
//       <div className="grid grid-cols-3 gap-4">
//         <KpiCard
//           icon={<Package className="h-12 w-12 text-[#014AB3]" />}
//           value={totalInventory.toLocaleString()}
//           label="Total Inventory"
//           sublabel="Items currently in stock"
//         />
//         <KpiCard
//           icon={<Clock className="h-12 w-12 text-orange-500" />}
//           value={expiringCount}
//           label="Expiring Soon"
//           sublabel="Expires within 90 days"
//         />
//         <KpiCard
//           icon={<TrendingDown className="h-12 w-12 text-red-500" />}
//           value={outOfStockCount}
//           label="Out of Stock"
//           sublabel="Requires immediate restock"
//         />
//       </div>

//       {/* ── Search + Filter Bar ──────────────────────────────── */}
//       <div className="flex items-center gap-2">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//           <Input
//             placeholder="Search by drug name, category, or batch ID..."
//             className="h-9 pl-9"
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setPage(1);
//             }}
//           />
//         </div>

//         {/* Status filter dropdown */}
//         <div className="relative">
//           <Button
//             variant="outline"
//             size="sm"
//             className="h-9 gap-1.5"
//             onClick={() => setFilterOpen((o) => !o)}>
//             <SlidersHorizontal className="h-4 w-4" />
//             {statusFilter
//               ? statusOptions.find((o) => o.value === statusFilter)?.label
//               : "Filter"}
//             <ChevronDown className="h-3 w-3 text-gray-400" />
//           </Button>

//           {filterOpen && (
//             <>
//               {/* backdrop */}
//               <div
//                 className="fixed inset-0 z-10"
//                 onClick={() => setFilterOpen(false)}
//               />
//               <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
//                 {statusOptions.map((opt) => (
//                   <button
//                     key={opt.value}
//                     onClick={() => {
//                       setStatusFilter(opt.value);
//                       setPage(1);
//                       setFilterOpen(false);
//                     }}
//                     className={cn(
//                       "flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50",
//                       statusFilter === opt.value
//                         ? "font-medium text-[#014AB3]"
//                         : "text-gray-700",
//                     )}>
//                     {opt.label}
//                     {statusFilter === opt.value && (
//                       <span className="ml-auto text-[#014AB3]">✓</span>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* ── Table ───────────────────────────────────────────── */}
//       <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
//         <table className="w-full table-fixed text-sm">
//           <colgroup>
//             <col className="w-[30%]" /> {/* Medication Name */}
//             <col className="w-[15%]" /> {/* Category */}
//             <col className="w-[17%]" /> {/* Current Stock */}
//             <col className="w-[13%]" /> {/* Expiry Date */}
//             <col className="w-[14%]" /> {/* Status */}
//             <col className="w-[11%]" /> {/* Price */}
//           </colgroup>
//           <thead className="border-b border-gray-100 bg-gray-50/60">
//             <tr>
//               <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
//                 Medication Name
//               </th>
//               <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
//                 Category
//               </th>
//               <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
//                 Current Stock
//               </th>
//               <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
//                 Expiry Date
//               </th>
//               <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
//                 Status
//               </th>
//               <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
//                 Price
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {isLoading ? (
//               <tr>
//                 <td
//                   colSpan={6}
//                   className="px-5 py-12 text-center text-gray-400">
//                   <div className="flex items-center justify-center gap-2">
//                     <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#014AB3] border-t-transparent" />
//                     Loading inventory...
//                   </div>
//                 </td>
//               </tr>
//             ) : isError ? (
//               <tr>
//                 <td colSpan={6} className="px-5 py-12 text-center">
//                   <p className="text-red-400">Failed to load inventory.</p>
//                   {error && (
//                     <p className="mt-1 font-mono text-xs text-red-300">
//                       {typeof error === "string"
//                         ? error
//                         : JSON.stringify(error)}
//                     </p>
//                   )}
//                 </td>
//               </tr>
//             ) : items.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={6}
//                   className="px-5 py-12 text-center text-gray-400">
//                   {search
//                     ? "No drugs match your search."
//                     : "No inventory items found."}
//                 </td>
//               </tr>
//             ) : (
//               items.map((item) => <InventoryRow key={item.id} item={item} />)
//             )}
//           </tbody>
//         </table>

//         {/* ── Pagination ────────────────────────────────────── */}
//         <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
//           <p className="text-xs text-gray-500">
//             Showing{" "}
//             <span className="font-medium">
//               {totalItems > 0 ? (page - 1) * limit + 1 : 0} to{" "}
//               {Math.min(page * limit, totalItems)}
//             </span>{" "}
//             of <span className="font-medium">{dbTotal}</span> drugs
//           </p>
//           <div className="flex items-center gap-1">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}>
//               <ChevronLeft className="h-4 w-4" />
//               Previous
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={async () => {
//                 if (page === totalPages && hasNextPage) {
//                   await fetchNextPage();
//                 }
//                 setPage((p) => p + 1);
//               }}
//               disabled={
//                 (page === totalPages && !hasNextPage) || isFetchingNextPage
//               }>
//               {isFetchingNextPage ? "Loading..." : "Next"}
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* ── Import Modal ─────────────────────────────────────── */}
//       <ImportDataModal open={importOpen} onOpenChange={setImportOpen} />
//       {/* ── Add Item Modal ───────────────────────────────────── */}
//       <AddItemModal open={addItemOpen} onOpenChange={setAddItemOpen} />
//     </div>
//   );
// }

// // ── Inventory Row ─────────────────────────────────────────────
// function InventoryRow({ item }: { item: InventoryItem }) {
//   const [qty, setQty] = useState(item.quantity);
//   const [isSaving, setIsSaving] = useState(false);
//   const [showDiscount, setShowDiscount] = useState(false);
//   const [discountValue, setDiscountValue] = useState(
//     String(item.discount_percent ?? 0),
//   );
//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const { mutate: updateInventory } = useUpdateInventory();
//   const { mutate: setDiscount, isPending: isSettingDiscount } =
//     useSetDiscount();

//   const nearExpiry = isNearExpiry(item.expiry_date);
//   const expired = isExpired(item.expiry_date);

//   const drugName = item.drug?.brand_name ?? "—";
//   const genericName = item.drug?.generic_name;
//   const category = item.drug?.category;
//   const strength = item.drug?.strength;
//   const dosageForm = item.drug?.dosage_form;

//   // Debounce quantity update
//   const updateQty = (newQty: number) => {
//     setQty(newQty);
//     setIsSaving(true);
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(() => {
//       updateInventory(
//         { id: item.id, payload: { quantity: newQty } },
//         { onSettled: () => setIsSaving(false) },
//       );
//     }, 800);
//   };

//   const handleApplyDiscount = () => {
//     const parsed = parseFloat(discountValue);
//     if (isNaN(parsed) || parsed < 0 || parsed > 100) {
//       toast.error("Discount must be between 0 and 100");
//       return;
//     }
//     setDiscount(
//       { id: item.id, discount_percent: parsed },
//       { onSuccess: () => setShowDiscount(false) },
//     );
//   };

//   return (
//     <tr className="transition-colors hover:bg-gray-50/60">
//       {/* Drug name + ID */}
//       <td className="px-4 py-4">
//         <p
//           className="truncate font-semibold text-gray-900"
//           title={`${drugName} ${strength ?? ""}`}>
//           {drugName} {strength}
//         </p>
//         {genericName && (
//           <p className="truncate text-xs text-gray-400">{genericName}</p>
//         )}
//         <p className="text-xs text-gray-400">
//           ID: #DRG-{item.id.slice(-4).toUpperCase()}
//         </p>
//       </td>

//       {/* Category */}
//       <td className="px-4 py-4">
//         {category ? (
//           <span
//             className="inline-block max-w-full truncate rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
//             title={category}>
//             {category}
//           </span>
//         ) : (
//           <span className="text-gray-400">—</span>
//         )}
//       </td>

//       {/* Current stock with +/- controls */}
//       <td className="px-4 py-4">
//         <div className="flex items-center gap-1.5">
//           <span className="text-sm font-semibold text-gray-800">{qty}</span>
//           {dosageForm && (
//             <span className="truncate text-xs text-gray-400">
//               {dosageForm}s
//             </span>
//           )}
//           {isSaving && (
//             <div className="h-3 w-3 shrink-0 animate-spin rounded-full border border-[#014AB3] border-t-transparent" />
//           )}
//         </div>
//         <div className="mt-1.5 flex items-center gap-1.5">
//           <button
//             onClick={() => updateQty(Math.max(0, qty - 1))}
//             className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100">
//             <Minus className="h-3 w-3" />
//           </button>
//           <span className="min-w-5 text-center text-xs font-medium">{qty}</span>
//           <button
//             onClick={() => updateQty(qty + 1)}
//             className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100">
//             <Plus className="h-3 w-3" />
//           </button>
//         </div>
//       </td>

//       {/* Expiry date */}
//       <td className="px-4 py-4">
//         <span
//           className={cn(
//             "text-sm",
//             nearExpiry || expired
//               ? "font-medium text-orange-500"
//               : "text-gray-600",
//           )}>
//           {formatDate(item.expiry_date)}
//         </span>
//       </td>

//       {/* Status badge */}
//       <td className="px-4 py-4">
//         <div className="flex flex-col items-start gap-1">
//           <StatusBadge item={item} />
//           {(nearExpiry || expired) && !showDiscount && (
//             <button
//               className="flex cursor-pointer items-center gap-0.5 text-xs font-medium text-[#014AB3] hover:underline"
//               onClick={() => setShowDiscount(true)}>
//               <Percent className="h-3 w-3" />
//               Set Discount
//             </button>
//           )}
//           {(nearExpiry || expired) && showDiscount && (
//             <div className="flex items-center gap-1">
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 value={discountValue}
//                 onChange={(e) => setDiscountValue(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
//                 className="h-6 w-14 rounded border border-gray-200 px-1.5 text-xs focus:border-[#014AB3] focus:outline-none focus:ring-1 focus:ring-[#014AB3]/20"
//                 placeholder="%"
//                 autoFocus
//               />
//               <button
//                 onClick={handleApplyDiscount}
//                 disabled={isSettingDiscount}
//                 className="flex h-6 cursor-pointer items-center rounded bg-[#014AB3] px-2 text-xs font-medium text-white hover:bg-[#013a8f] disabled:opacity-50">
//                 {isSettingDiscount ? "..." : "Apply"}
//               </button>
//               <button
//                 onClick={() => setShowDiscount(false)}
//                 className="flex h-6 cursor-pointer items-center rounded border border-gray-200 px-1.5 text-xs text-gray-500 hover:bg-gray-100">
//                 ✕
//               </button>
//             </div>
//           )}
//         </div>
//       </td>

//       {/* Price */}
//       <td className="px-4 py-4">
//         <span className="font-semibold text-gray-900">
//           ${item.selling_price.toFixed(2)}
//         </span>
//       </td>
//     </tr>
//   );
// }

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AddItemModal } from "../components/AddItemModal";
import { EditItemModal } from "../components/EditItemModal";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";

import {
  Package,
  Clock,
  TrendingDown,
  Search,
  SlidersHorizontal,
  Upload,
  Minus,
  Plus,
  Percent,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useInventory } from "../hooks/useInventory";
import { useUpdateInventory } from "../hooks/useUpdateInventory";
import { useSetDiscount } from "../hooks/useSetDiscount";
import { useImportStatus } from "../../import/hooks/useImportStatus";
import ImportDataModal from "../components/ImportDataModal";
import type { InventoryItem } from "../types/inventory.types";

// ── helpers ───────────────────────────────────────────────────
function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toISOString().slice(0, 10);
}

function isNearExpiry(dateStr?: string) {
  if (!dateStr) return false;
  const days = Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return days >= 0 && days <= 90;
}

function isExpired(dateStr?: string) {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({
  icon,
  value,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-700">{label}</p>
          <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>
        </div>
        <div className="mt-0.5 opacity-20">{icon}</div>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
const LOW_STOCK_THRESHOLD = 10;

function StatusBadge({ item }: { item: InventoryItem }) {
  if (item.status === "expired" || isExpired(item.expiry_date)) {
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
        <AlertTriangle className="h-3 w-3" /> Expired
      </span>
    );
  }
  if (item.status === "out_of_stock" || item.quantity === 0) {
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
        <AlertTriangle className="h-3 w-3" /> Out of Stock
      </span>
    );
  }
  if (item.quantity > 0 && item.quantity <= LOW_STOCK_THRESHOLD) {
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-600">
        <AlertTriangle className="h-3 w-3" /> Low Stock
      </span>
    );
  }
  if (isNearExpiry(item.expiry_date)) {
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-600">
        <AlertTriangle className="h-3 w-3" /> Near Expiry
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
      In Stock
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Background polling — stays active even when modal is closed
  const [bgJobId] = useState<string | null>(() =>
    sessionStorage.getItem("dawak_import_job_id"),
  );
  const { data: bgJobStatus } = useImportStatus(bgJobId);

  // When background job completes, refresh inventory
  useEffect(() => {
    if (!bgJobStatus) return;
    if (bgJobStatus.state === "completed" && bgJobStatus.result) {
      sessionStorage.removeItem("dawak_import_job_id");
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
        refetchType: "all",
      });
    }
  }, [bgJobStatus, queryClient]);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInventory({ search });

  // Flatten all pages
  const allItems = data?.pages.flatMap((p) => p.items) ?? [];
  // total comes from the first page (DB count, unaffected by cursor)
  const dbTotal = data?.pages[0]?.total ?? allItems.length;

  // Client-side status filter + pagination
  const filteredItems = statusFilter
    ? allItems.filter((i) => {
        if (statusFilter === "near_expiry") return isNearExpiry(i.expiry_date);
        if (statusFilter === "expired")
          return i.status === "expired" || isExpired(i.expiry_date);
        if (statusFilter === "out_of_stock")
          return i.status === "out_of_stock" || i.quantity === 0;
        if (statusFilter === "low_stock")
          return i.quantity > 0 && i.quantity <= LOW_STOCK_THRESHOLD;
        return i.status === statusFilter;
      })
    : allItems;

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const items = filteredItems.slice((page - 1) * limit, page * limit);

  const totalInventory = dbTotal;
  const expiringCount = allItems.filter((i) =>
    isNearExpiry(i.expiry_date),
  ).length;
  const outOfStockCount = allItems.filter((i) => i.quantity === 0).length;

  const statusOptions = [
    { value: "", label: "All" },
    { value: "low_stock", label: "Low Stock" },
    { value: "out_of_stock", label: "Out of Stock" },
    { value: "near_expiry", label: "Near Expiry" },
    { value: "expired", label: "Expired" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Inventory Management
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Monitor stock levels, track expiry dates, and manage drug
            availability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setAddItemOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Drug
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-[#014AB3] hover:bg-[#013a8f]"
            onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard
          icon={<Package className="h-12 w-12 text-[#014AB3]" />}
          value={totalInventory.toLocaleString()}
          label="Total Inventory"
          sublabel="Items currently in stock"
        />
        <KpiCard
          icon={<Clock className="h-12 w-12 text-orange-500" />}
          value={expiringCount}
          label="Expiring Soon"
          sublabel="Expires within 90 days"
        />
        <KpiCard
          icon={<TrendingDown className="h-12 w-12 text-red-500" />}
          value={outOfStockCount}
          label="Out of Stock"
          sublabel="Requires immediate restock"
        />
      </div>

      {/* ── Search + Filter Bar ──────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by drug name, category, or batch ID..."
            className="h-9 pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Status filter dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setFilterOpen((o) => !o)}>
            <SlidersHorizontal className="h-4 w-4" />
            {statusFilter
              ? statusOptions.find((o) => o.value === statusFilter)?.label
              : "Filter"}
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </Button>

          {filterOpen && (
            <>
              {/* backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setFilterOpen(false)}
              />
              <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setPage(1);
                      setFilterOpen(false);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50",
                      statusFilter === opt.value
                        ? "font-medium text-[#014AB3]"
                        : "text-gray-700",
                    )}>
                    {opt.label}
                    {statusFilter === opt.value && (
                      <span className="ml-auto text-[#014AB3]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[26%]" /> {/* Medication Name */}
            <col className="w-[14%]" /> {/* Category */}
            <col className="w-[16%]" /> {/* Current Stock */}
            <col className="w-[12%]" /> {/* Expiry Date */}
            <col className="w-[14%]" /> {/* Status */}
            <col className="w-[10%]" /> {/* Price */}
            <col className="w-[8%]" /> {/* Actions */}
          </colgroup>
          <thead className="border-b border-gray-100 bg-gray-50/60">
            <tr>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Medication Name
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Category
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Current Stock
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Expiry Date
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Status
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Price
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#014AB3] border-t-transparent" />
                    Loading inventory...
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <p className="text-red-400">Failed to load inventory.</p>
                  {error && (
                    <p className="mt-1 font-mono text-xs text-red-300">
                      {typeof error === "string"
                        ? error
                        : JSON.stringify(error)}
                    </p>
                  )}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-gray-400">
                  {search
                    ? "No drugs match your search."
                    : "No inventory items found."}
                </td>
              </tr>
            ) : (
              items.map((item) => <InventoryRow key={item.id} item={item} />)
            )}
          </tbody>
        </table>

        {/* ── Pagination ────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-medium">
              {totalItems > 0 ? (page - 1) * limit + 1 : 0} to{" "}
              {Math.min(page * limit, totalItems)}
            </span>{" "}
            of <span className="font-medium">{dbTotal}</span> drugs
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (page === totalPages && hasNextPage) {
                  await fetchNextPage();
                }
                setPage((p) => p + 1);
              }}
              disabled={
                (page === totalPages && !hasNextPage) || isFetchingNextPage
              }>
              {isFetchingNextPage ? "Loading..." : "Next"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Import Modal ─────────────────────────────────────── */}
      <ImportDataModal open={importOpen} onOpenChange={setImportOpen} />
      {/* ── Add Item Modal ───────────────────────────────────── */}
      <AddItemModal open={addItemOpen} onOpenChange={setAddItemOpen} />
    </div>
  );
}

// ── Inventory Row ─────────────────────────────────────────────
function InventoryRow({ item }: { item: InventoryItem }) {
  const [qty, setQty] = useState(item.quantity);
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountValue, setDiscountValue] = useState(
    String(item.discount_percent ?? 0),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mutate: updateInventory } = useUpdateInventory();
  const { mutate: setDiscount, isPending: isSettingDiscount } =
    useSetDiscount();

  // ── Actions menu state ────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const nearExpiry = isNearExpiry(item.expiry_date);
  const expired = isExpired(item.expiry_date);

  const drugName = item.drug?.brand_name ?? "—";
  const genericName = item.drug?.generic_name;
  const category = item.drug?.category;
  const strength = item.drug?.strength;
  const dosageForm = item.drug?.dosage_form;

  // Debounce quantity update
  const updateQty = (newQty: number) => {
    setQty(newQty);
    setIsSaving(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateInventory(
        { id: item.id, payload: { quantity: newQty } },
        { onSettled: () => setIsSaving(false) },
      );
    }, 800);
  };

  const handleApplyDiscount = () => {
    const parsed = parseFloat(discountValue);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      toast.error("Discount must be between 0 and 100");
      return;
    }
    setDiscount(
      { id: item.id, discount_percent: parsed },
      { onSuccess: () => setShowDiscount(false) },
    );
  };

  return (
    <>
      <tr className="transition-colors hover:bg-gray-50/60">
        {/* Drug name + ID */}
        <td className="px-4 py-4">
          <p
            className="truncate font-semibold text-gray-900"
            title={`${drugName} ${strength ?? ""}`}>
            {drugName} {strength}
          </p>
          {genericName && (
            <p className="truncate text-xs text-gray-400">{genericName}</p>
          )}
          <p className="text-xs text-gray-400">
            ID: #DRG-{item.id.slice(-4).toUpperCase()}
          </p>
        </td>

        {/* Category */}
        <td className="px-4 py-4">
          {category ? (
            <span
              className="inline-block max-w-full truncate rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
              title={category}>
              {category}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>

        {/* Current stock with +/- controls */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-800">{qty}</span>
            {dosageForm && (
              <span className="truncate text-xs text-gray-400">
                {dosageForm}s
              </span>
            )}
            {isSaving && (
              <div className="h-3 w-3 shrink-0 animate-spin rounded-full border border-[#014AB3] border-t-transparent" />
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <button
              onClick={() => updateQty(Math.max(0, qty - 1))}
              className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100">
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-5 text-center text-xs font-medium">
              {qty}
            </span>
            <button
              onClick={() => updateQty(qty + 1)}
              className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100">
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </td>

        {/* Expiry date */}
        <td className="px-4 py-4">
          <span
            className={cn(
              "text-sm",
              nearExpiry || expired
                ? "font-medium text-orange-500"
                : "text-gray-600",
            )}>
            {formatDate(item.expiry_date)}
          </span>
        </td>

        {/* Status badge */}
        <td className="px-4 py-4">
          <div className="flex flex-col items-start gap-1">
            <StatusBadge item={item} />
            {(nearExpiry || expired) && !showDiscount && (
              <button
                className="flex cursor-pointer items-center gap-0.5 text-xs font-medium text-[#014AB3] hover:underline"
                onClick={() => setShowDiscount(true)}>
                <Percent className="h-3 w-3" />
                Set Discount
              </button>
            )}
            {(nearExpiry || expired) && showDiscount && (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                  className="h-6 w-14 rounded border border-gray-200 px-1.5 text-xs focus:border-[#014AB3] focus:outline-none focus:ring-1 focus:ring-[#014AB3]/20"
                  placeholder="%"
                  autoFocus
                />
                <button
                  onClick={handleApplyDiscount}
                  disabled={isSettingDiscount}
                  className="flex h-6 cursor-pointer items-center rounded bg-[#014AB3] px-2 text-xs font-medium text-white hover:bg-[#013a8f] disabled:opacity-50">
                  {isSettingDiscount ? "..." : "Apply"}
                </button>
                <button
                  onClick={() => setShowDiscount(false)}
                  className="flex h-6 cursor-pointer items-center rounded border border-gray-200 px-1.5 text-xs text-gray-500 hover:bg-gray-100">
                  ✕
                </button>
              </div>
            )}
          </div>
        </td>

        {/* Price */}
        <td className="px-4 py-4">
          <span className="font-semibold text-gray-900">
            ${item.selling_price.toFixed(2)}
          </span>
        </td>

        {/* ── Actions (3-dots menu) ── */}
        <td className="px-4 py-4">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                {/* Backdrop — closes menu on outside click */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />

                {/* Dropdown */}
                <div className="absolute right-0 top-8 z-20 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setEditOpen(true);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50">
                    <Pencil className="h-3.5 w-3.5 text-gray-400" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteOpen(true);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </td>
      </tr>

      {/* ── Edit Modal ── */}
      <EditItemModal open={editOpen} onOpenChange={setEditOpen} item={item} />

      {/* ── Delete Confirm Dialog ── */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        item={item}
      />
    </>
  );
}
