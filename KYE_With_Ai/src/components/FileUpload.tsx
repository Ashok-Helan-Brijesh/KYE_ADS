import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  onFileUploaded: (file: File, data: any[]) => void;
  isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  isLoading = false,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);

  const parseExcelFile = useCallback(async (file: File) => {
    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];

      const formattedData = rows
        .filter((row) => row.some((cell) => cell !== undefined && cell !== ""))
        .map((row) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header || `Column_${index + 1}`] = row[index] || "";
          });
          return obj;
        });

      return formattedData;
    } catch (err) {
      throw new Error(
        "Failed to parse Excel file. Please ensure it's a valid Excel format."
      );
    }
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setUploadedFile(file);
      setIsParsing(true);

      try {
        const data = await parseExcelFile(file);
        onFileUploaded(file, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setUploadedFile(null);
      } finally {
        setIsParsing(false);
      }
    },
    [parseExcelFile, onFileUploaded]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
          ".xlsx",
        ],
        "application/vnd.ms-excel": [".xls"],
      },
      maxFiles: 1,
      disabled: isLoading || isParsing,
    });

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
  };

  return (
    <Card className="p-8 bg-white border border-border rounded-lg shadow-sm">
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            AI Arena
          </h3>
          <p className="text-muted-foreground">
            Drop your Excel file here to begin the audit analysis
          </p>
        </div>

        {!uploadedFile && (
          <div
            {...getRootProps({ "aria-label": "Excel file upload dropzone" })}
            className={`
              border border-border rounded-lg p-6 text-center cursor-pointer transition-smooth bg-white
              ${
                isDragActive
                  ? "border-primary shadow-ai"
                  : "hover:border-primary/50 hover:bg-muted/10"
              }
              ${isLoading || isParsing ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <input {...getInputProps()} />
            {isParsing ? (
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground mb-4" />
            ) : (
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDragActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
            )}
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive
                  ? "Drop your Excel file here..."
                  : "Drag & drop your Excel file"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse (.xlsx, .xls files supported)
              </p>
            </div>
          </div>
        )}

        {fileRejections.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Unsupported file type. Please upload a valid Excel file (.xlsx or
              .xls).
            </p>
          </div>
        )}

        {uploadedFile && !error && (
          <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-success-foreground">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-success/80">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-success hover:text-success/80"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <X className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Upload Error</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="mt-2 text-destructive hover:text-destructive/80"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FileUpload;
