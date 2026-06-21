import { CheckCircle2, PlusCircle, XCircle } from "lucide-react";
import type { ImportResult } from "../types/import.types";
import { cn } from "@/lib/utils";

interface ImportResultTableProps {
  result: ImportResult;
}

const statusConfig = {
  matched: {
    label: "Matched",
    icon: CheckCircle2,
    badgeClass: "bg-green-100 text-green-700",
    iconClass: "text-green-600",
  },
  auto_created: {
    label: "Auto Created",
    icon: PlusCircle,
    badgeClass: "bg-blue-100 text-blue-700",
    iconClass: "text-blue-600",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    badgeClass: "bg-red-100 text-red-600",
    iconClass: "text-red-500",
  },
};

export default function ImportResultTable({ result }: ImportResultTableProps) {
  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center rounded-xl border border-green-200 bg-green-50 py-4">
          <CheckCircle2 className="mb-1 h-6 w-6 text-green-600" />
          <span className="text-xl font-bold text-green-700">
            {result.matched}
          </span>
          <span className="text-xs text-green-600">Matched</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-blue-200 bg-blue-50 py-4">
          <PlusCircle className="mb-1 h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-blue-700">
            {result.autoCreated}
          </span>
          <span className="text-xs text-blue-600">Auto Created</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 py-4">
          <XCircle className="mb-1 h-6 w-6 text-red-500" />
          <span className="text-xl font-bold text-red-600">
            {result.failed}
          </span>
          <span className="text-xs text-red-500">Failed</span>
        </div>
      </div>

      {/* Total */}
      <p className="text-sm text-gray-500">
        Processed{" "}
        <span className="font-medium text-gray-700">{result.total}</span> rows
      </p>

      {/* Rows Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                #
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Drug Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {result.rows.map((row, index) => {
              const config = statusConfig[row.status];
              const Icon = config.icon;
              return (
                <tr
                  key={index}
                  className={cn(
                    "transition-colors",
                    row.status === "failed" && "bg-red-50/50",
                  )}>
                  <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {row.drugName || (
                      <span className="italic text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        config.badgeClass,
                      )}>
                      <Icon className={cn("h-3 w-3", config.iconClass)} />
                      {config.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {row.error ??
                      (row.drugId ? (
                        <span className="font-mono text-gray-400">
                          {row.drugId.slice(0, 8)}…
                        </span>
                      ) : (
                        "—"
                      ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
