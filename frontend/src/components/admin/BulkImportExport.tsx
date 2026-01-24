import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BulkImportExport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Bulk Import/Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Import and export functionality will be available in a future update.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkImportExport;
