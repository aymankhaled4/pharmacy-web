import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DropzoneUploaderProps {
  onUpload: (file: File) => void;
  isPending: boolean;
}

export default function DropzoneUploader({
  onUpload,
  isPending,
}: DropzoneUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFileError(null);
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const onDropRejected = useCallback(() => {
    setFileError("Only .xlsx or .xls files are allowed (max 10MB).");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isPending,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFileError(null);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          isDragActive
            ? "border-[#014AB3] bg-blue-50"
            : "border-gray-200 bg-gray-50 hover:border-[#014AB3] hover:bg-blue-50/50",
          isPending && "cursor-not-allowed opacity-60",
          fileError && "border-red-400 bg-red-50",
        )}>
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud
              className={cn(
                "mb-3 h-10 w-10",
                isDragActive ? "text-[#014AB3]" : "text-gray-400",
              )}
            />
            <p className="text-sm font-medium text-gray-700">
              {isDragActive
                ? "Drop your file here"
                : "Drag & drop your Excel file here"}
            </p>
            <p className="mt-1 text-xs text-gray-400">or click to browse</p>
            <p className="mt-2 text-xs text-gray-400">
              .xlsx, .xls — up to 10MB
            </p>
          </>
        )}
      </div>

      {/* File error */}
      {fileError && <p className="text-sm text-red-500">{fileError}</p>}

      {/* Upload button */}
      <Button
        onClick={handleSubmit}
        disabled={!selectedFile || isPending}
        className="w-full bg-[#014AB3] hover:bg-[#013a8f]"
        size="lg">
        {isPending ? "Uploading..." : "Upload File"}
      </Button>
    </div>
  );
}
