import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadCloud, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DropzoneUploader from "../components/DropzoneUploader";
import ImportResultTable from "../components/ImportResultTable";
import { useImportFile } from "../hooks/useImportFile";
import { useImportStatus } from "../hooks/useImportStatus";
import { isQueuedImport } from "../types/import.types";
import type { ImportResult } from "../types/import.types";

const SESSION_JOB_KEY = "dawak_import_job_id";

type PageState = "upload" | "polling" | "result";

export default function ImportPage() {
  const queryClient = useQueryClient();

  // Restore jobId from sessionStorage in case of refresh during polling
  const [jobId, setJobId] = useState<string | null>(() =>
    sessionStorage.getItem(SESSION_JOB_KEY),
  );
  const [pageState, setPageState] = useState<PageState>(
    jobId ? "polling" : "upload",
  );
  const [syncResult, setSyncResult] = useState<ImportResult | null>(null);
  const [rowCount, setRowCount] = useState<number | null>(null);

  // ── Mutation: upload file ──────────────────────────────────────
  const { mutate: uploadFile, isPending: isUploading } = useImportFile();

  // ── Query: poll job status (only when jobId exists) ────────────
  const { data: jobStatus } = useImportStatus(jobId);

  // ── Watch job completion ───────────────────────────────────────
  useEffect(() => {
    if (!jobStatus) return;

    if (jobStatus.state === "completed" && jobStatus.result) {
      sessionStorage.removeItem(SESSION_JOB_KEY);
      setJobId(null);
      setSyncResult(jobStatus.result);
      setPageState("result");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Import completed successfully!");
    }

    if (jobStatus.state === "failed") {
      sessionStorage.removeItem(SESSION_JOB_KEY);
      setJobId(null);
      setPageState("upload");
      toast.error("Import job failed. Please try again.");
    }
  }, [jobStatus, queryClient]);

  // ── Handle file upload ─────────────────────────────────────────
  const handleUpload = (file: File) => {
    uploadFile(file, {
      onSuccess: (data) => {
        if (isQueuedImport(data)) {
          // Async — large file → start polling
          setJobId(data.jobId);
          setRowCount(data.rowCount);
          sessionStorage.setItem(SESSION_JOB_KEY, data.jobId);
          setPageState("polling");
        } else {
          // Sync — small file → show result immediately
          setSyncResult(data);
          setPageState("result");
          queryClient.invalidateQueries({ queryKey: ["inventory"] });
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

  // ── Reset to upload state ──────────────────────────────────────
  const handleReset = () => {
    setSyncResult(null);
    setJobId(null);
    setRowCount(null);
    setPageState("upload");
    sessionStorage.removeItem(SESSION_JOB_KEY);
  };

  const progress = jobStatus?.progress ?? 10;
  const finalResult = syncResult ?? jobStatus?.result ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Import Inventory
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload an Excel file to automatically import drugs into your
          inventory.
        </p>
      </div>

      {/* ── UPLOAD STATE ─────────────────────────────────────── */}
      {pageState === "upload" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-gray-700">
            <UploadCloud className="h-5 w-5 text-[#014AB3]" />
            <h2 className="font-medium">Upload your inventory file</h2>
          </div>
          <DropzoneUploader onUpload={handleUpload} isPending={isUploading} />

          {/* Hint */}
          <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-700">
            <strong>Supported columns:</strong> Drug Name, Quantity, Selling
            Price (required) · Expiry Date, Batch Number, Discount % (optional).
            Column names can be in Arabic or English — AI maps them
            automatically.
          </div>
        </div>
      )}

      {/* ── POLLING STATE ────────────────────────────────────── */}
      {pageState === "polling" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#014AB3]" />
            <div>
              <h2 className="font-semibold text-gray-800">
                Processing your file...
              </h2>
              {rowCount && (
                <p className="mt-1 text-sm text-gray-500">
                  {rowCount} rows in queue
                </p>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full">
              <div className="mb-1.5 flex justify-between text-xs text-gray-400">
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
              This page checks for updates every 3 seconds.
            </p>
          </div>
        </div>
      )}

      {/* ── RESULT STATE ─────────────────────────────────────── */}
      {pageState === "result" && finalResult && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {/* Success banner */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
                <span className="text-sm">✓</span>
              </div>
              <h2 className="font-semibold text-gray-800">Import Complete</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Import Another File
            </Button>
          </div>

          <ImportResultTable result={finalResult} />
        </div>
      )}
    </div>
  );
}
