import React from "react";
import { Table, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define the props interface
interface DataPreviewProps {
  data: any[];
  fileName: string;
  analysisResult?: any;
}

const DataPreview: React.FC<DataPreviewProps> = ({
  data,
  fileName,
  analysisResult,
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Table className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No Data Available
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Upload an Excel file to see the data preview
        </p>
      </Card>
    );
  }

  const headers = Object.keys(data[0]);

  const exportResults = () => {
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName
      .replace(".xlsx", "")
      .replace(".xls", "")}_analysis.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-gradient-card">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Table className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Data Preview</h3>
            <p className="text-sm text-muted-foreground">
              {fileName} • {data.length} rows • {headers.length} columns
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {analysisResult && (
            <Badge
              variant="secondary"
              className="bg-success/10 text-success border-success/20"
            >
              Analysis Complete
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={exportResults}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="p-4">
        <div className="overflow-auto max-h-[400px] w-full scrollbar-visible">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="border-b bg-white sticky top-0 z-10">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="text-left p-3 font-medium whitespace-nowrap"
                    style={{ minWidth: "8rem" }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b transition-smooth hover:bg-muted/30"
                >
                  {headers.map((header) => (
                    <td
                      key={header}
                      className="p-3 whitespace-nowrap"
                      style={{
                        maxWidth: "15rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <span>{row[header] || "-"}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

// Custom CSS for scrollbars
const styles = `
  .scrollbar-visible {
    scrollbar-gutter: stable;
    overflow-x: auto !important;
    overflow-y: auto !important;
  }
  .scrollbar-visible::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .scrollbar-visible::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .scrollbar-visible::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  .scrollbar-visible::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default DataPreview;
