import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function Admin() {
  // Simple admin page to download CSV
  // In a real app this would be protected by auth

  const handleDownload = () => {
    // Direct link to the download endpoint
    window.location.href = api.survey.downloadCsv.path;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage survey responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download all survey responses as a CSV file for analysis.
          </p>
          <Button onClick={handleDownload} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download CSV Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
