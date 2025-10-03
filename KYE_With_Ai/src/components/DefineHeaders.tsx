import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DefineHeadersProps {
  headers: string[];
  onHeadersUpdate: (headers: string[]) => void;
}

const DefineHeaders: React.FC<DefineHeadersProps> = ({
  headers,
  onHeadersUpdate,
}) => {
  const [editedHeaders, setEditedHeaders] = useState<string[]>([]);

  useEffect(() => {
    setEditedHeaders(headers);
  }, [headers]);

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...editedHeaders];
    newHeaders[index] = value;
    setEditedHeaders(newHeaders);
  };

  const handleSave = () => {
    onHeadersUpdate(editedHeaders);
  };

  return (
    <Card className="h-full border border-success/30 bg-white shadow-sm">
      <CardHeader className="pb-2 border-b flex flex-col sm:flex-row justify-between items-center gap-2">
        <CardTitle className="text-sm font-semibold text-success">
          Define Headers
        </CardTitle>
        <Button
          onClick={handleSave}
          className="w-full sm:w-auto h-7 text-xs"
          variant="default"
        >
          Update Headers
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col h-full">
        {headers.length > 0 ? (
          <div className="overflow-y-auto max-h-[320px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    Original Name
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    Editable Name
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedHeaders.map((header, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs">{headers[index]}</TableCell>
                    <TableCell>
                      <Input
                        value={header}
                        onChange={(e) =>
                          handleHeaderChange(index, e.target.value)
                        }
                        className="h-7 text-xs"
                        placeholder={`Column ${index + 1}`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Upload an Excel file to define headers
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DefineHeaders;
