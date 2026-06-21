import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  CheckCircle2,
  PlusCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useImportFile } from "../../import/hooks/useImportFile";
import { useImportStatus } from "../../import/hooks/useImportStatus";
import { isQueuedImport } from "../../import/types/import.types";
import type { ImportResult } from "../../import/types/import.types";

const SESSION_JOB_KEY = "dawak_import_job_id";
const IMPORTED_HASHES_KEY = "dawak_imported_hashes";

// ── File hash using Web Crypto API (no extra packages) ─────────
async function getFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getImportedHashes(): string[] {
  try {
    return JSON.parse(localStorage.getItem(IMPORTED_HASHES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveImportedHash(hash: string) {
  const hashes = getImportedHashes();
  if (!hashes.includes(hash)) {
    hashes.push(hash);
    localStorage.setItem(IMPORTED_HASHES_KEY, JSON.stringify(hashes));
  }
}

type ModalState = "upload" | "polling" | "result";

interface ImportDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Status config for result table ────────────────────────────
const statusConfig = {
  matched: {
    label: "Matched",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700",
  },
  auto_created: {
    label: "Auto Created",
    icon: PlusCircle,
    className: "bg-blue-100 text-blue-700",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-100 text-red-600",
  },
};

export default function ImportDataModal({
  open,
  onOpenChange,
}: ImportDataModalProps) {
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>("upload");
  const [syncResult, setSyncResult] = useState<ImportResult | null>(null);
  const [jobId, setJobId] = useState<string | null>(() =>
    sessionStorage.getItem(SESSION_JOB_KEY),
  );
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [pendingHash, setPendingHash] = useState<string | null>(null);

  // ── Hooks ────────────────────────────────────────────────────
  const { mutate: uploadFile, isPending: isUploading } = useImportFile();
  const { data: jobStatus } = useImportStatus(jobId);

  // Restore polling state if jobId exists (page refresh case)
  useEffect(() => {
    if (jobId && open) setModalState("polling");
  }, [jobId, open]);

  // ── Watch job completion ──────────────────────────────────────
  useEffect(() => {
    if (!jobStatus) return;
    if (jobStatus.state === "completed" && jobStatus.result) {
      sessionStorage.removeItem(SESSION_JOB_KEY);
      setJobId(null);
      setSyncResult(jobStatus.result);
      setModalState("result");
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
        refetchType: "all",
      });
      toast.success("Import completed successfully!");
    }
    if (jobStatus.state === "failed") {
      sessionStorage.removeItem(SESSION_JOB_KEY);
      setJobId(null);
      setModalState("upload");
      toast.error("Import job failed. Please try again.");
    }
  }, [jobStatus, queryClient]);

  // ── Dropzone ─────────────────────────────────────────────────
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      setFileError(null);
      if (files.length > 0) setSelectedFile(files[0]);
    },
    onDropRejected: () => {
      setFileError("Only .xlsx or .xls files are allowed (max 10MB).");
    },
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: isUploading,
  });

  // ── Handlers ─────────────────────────────────────────────────
  const doUpload = (file: File, hash: string) => {
    uploadFile(file, {
      onSuccess: (data) => {
        saveImportedHash(hash);
        if (isQueuedImport(data)) {
          setJobId(data.jobId);
          setRowCount(data.rowCount);
          sessionStorage.setItem(SESSION_JOB_KEY, data.jobId);
          setModalState("polling");
        } else {
          setSyncResult(data);
          setModalState("result");
          queryClient.invalidateQueries({
            queryKey: ["inventory"],
            refetchType: "all",
          });
          toast.success("Import completed!");
        }
      },
      onError: (err) => {
        toast.error(
          typeof err === "string" ? err : "Upload failed. Please try again.",
        );
      },
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const hash = await getFileHash(selectedFile);
    const hashes = getImportedHashes();
    if (hashes.includes(hash)) {
      // Same file was imported before — warn user
      setPendingHash(hash);
      setIsDuplicate(true);
      return;
    }
    doUpload(selectedFile, hash);
  };

  const handleForceUpload = () => {
    if (!selectedFile || !pendingHash) return;
    setIsDuplicate(false);
    doUpload(selectedFile, pendingHash);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileError(null);
    setSyncResult(null);
    setJobId(null);
    setRowCount(null);
    setModalState("upload");
    setIsDuplicate(false);
    setPendingHash(null);
    sessionStorage.removeItem(SESSION_JOB_KEY);
  };

  const handleClose = (open: boolean) => {
    if (!open && modalState === "polling") {
      // Job still running — close modal but keep polling in background
      // sessionStorage jobId stays intact so polling continues
      onOpenChange(false);
      toast.info(
        "Import is running in the background. Your inventory will update automatically when done.",
      );
      return;
    }
    if (!open) handleReset();
    onOpenChange(open);
  };

  const progress = jobStatus?.progress ?? 0;
  const finalResult = syncResult ?? jobStatus?.result ?? null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {modalState === "upload" && "Import Inventory Data"}
            {modalState === "polling" && "Processing File..."}
            {modalState === "result" && "Import Complete"}
          </DialogTitle>
        </DialogHeader>

        {/* ── UPLOAD ────────────────────────────────────────── */}
        {modalState === "upload" && (
          <div className="space-y-4">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                isDragActive
                  ? "border-[#014AB3] bg-blue-50"
                  : "border-gray-200 bg-gray-50 hover:border-[#014AB3] hover:bg-blue-50/40",
                isUploading && "cursor-not-allowed opacity-60",
                fileError && "border-red-300 bg-red-50",
              )}>
              <input {...getInputProps()} />
              {selectedFile ? (
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-7 w-7 text-green-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setFileError(null);
                    }}
                    className="ml-1 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud
                    className={cn(
                      "mb-2 h-9 w-9",
                      isDragActive ? "text-[#014AB3]" : "text-gray-300",
                    )}
                  />
                  <p className="text-sm font-medium text-gray-700">
                    {isDragActive
                      ? "Drop your file here"
                      : "Drag & drop Excel file here"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    or click to browse
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    .xlsx, .xls — up to 10MB
                  </p>
                </>
              )}
            </div>

            {fileError && <p className="text-xs text-red-500">{fileError}</p>}

            {/* Duplicate file warning */}
            {isDuplicate && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ You already imported this file before
                </p>
                <p className="mt-0.5 text-xs text-yellow-700">
                  Uploading it again will add duplicate entries to your
                  inventory. Are you sure?
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setIsDuplicate(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-yellow-500 text-xs text-white hover:bg-yellow-600"
                    onClick={handleForceUpload}
                    disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload Anyway"}
                  </Button>
                </div>
              </div>
            )}

            {/* Hint */}
            <p className="text-xs text-gray-400">
              Required columns: Drug Name, Quantity, Price. Optional: Expiry
              Date, Batch No, Discount. Column names can be in Arabic or
              English.
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#014AB3] hover:bg-[#013a8f]"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload & Import"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── POLLING ───────────────────────────────────────── */}
        {modalState === "polling" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#014AB3]" />
            <div>
              <p className="font-medium text-gray-800">
                Processing your file...
              </p>
              {rowCount && (
                <p className="mt-0.5 text-sm text-gray-500">
                  {rowCount} rows in queue
                </p>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full">
              <div className="mb-1 flex justify-between text-xs text-gray-400">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#014AB3] transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Checking for updates every 3 seconds…
            </p>
          </div>
        )}

        {/* ── RESULT ────────────────────────────────────────── */}
        {modalState === "result" && finalResult && (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center rounded-lg border border-green-200 bg-green-50 py-3">
                <CheckCircle2 className="mb-1 h-5 w-5 text-green-600" />
                <span className="text-lg font-bold text-green-700">
                  {finalResult.matched}
                </span>
                <span className="text-xs text-green-600">Matched</span>
              </div>
              <div className="flex flex-col items-center rounded-lg border border-blue-200 bg-blue-50 py-3">
                <PlusCircle className="mb-1 h-5 w-5 text-blue-600" />
                <span className="text-lg font-bold text-blue-700">
                  {finalResult.autoCreated}
                </span>
                <span className="text-xs text-blue-600">Auto Created</span>
              </div>
              <div className="flex flex-col items-center rounded-lg border border-red-200 bg-red-50 py-3">
                <XCircle className="mb-1 h-5 w-5 text-red-500" />
                <span className="text-lg font-bold text-red-600">
                  {finalResult.failed}
                </span>
                <span className="text-xs text-red-500">Failed</span>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Processed{" "}
              <span className="font-medium text-gray-600">
                {finalResult.total}
              </span>{" "}
              rows total
            </p>

            {/* Rows table */}
            <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-100">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">
                      Drug Name
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {finalResult.rows.map((row, i) => {
                    const cfg = statusConfig[row.status];
                    const Icon = cfg.icon;
                    return (
                      <tr
                        key={i}
                        className={cn(
                          row.status === "failed" && "bg-red-50/40",
                        )}>
                        <td className="px-3 py-2 font-medium text-gray-800">
                          {row.drugName || (
                            <span className="italic text-gray-400">
                              Unknown
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                              cfg.className,
                            )}>
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-400">
                          {row.error ??
                            (row.drugId ? `${row.drugId.slice(0, 8)}…` : "—")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                Import Another
              </Button>
              <Button
                size="sm"
                className="ml-auto bg-[#014AB3] hover:bg-[#013a8f]"
                onClick={() => handleClose(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
