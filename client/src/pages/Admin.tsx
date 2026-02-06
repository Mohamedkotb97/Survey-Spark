import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, BarChart3, Users, Calendar, TrendingUp, Lock, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ADMIN_PASSWORD = "OCD$survey$2026";
const DELETE_PASSWORD = "delete$admin";

interface SurveyResponse {
  id: number;
  name: string;
  company: string;
  overallExperience: number;
  serviceQuality: number;
  timeliness: number;
  communication: number;
  professionalism: number;
  issueResolution: number;
  easeOfAccess: number;
  valueAdded: number;
  efficiency: number;
  suggestions: string | null;
  createdAt: string;
}

interface Analytics {
  total: number;
  averageRatings: Record<string, number>;
  dateRange: { earliest: string; latest: string } | null;
  responsesByDate: { date: string; count: number }[];
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storedPassword, setStoredPassword] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("admin_password") : null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // Check if already authenticated
  if (storedPassword === ADMIN_PASSWORD && !isAuthenticated) {
    setIsAuthenticated(true);
  }

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_password", password);
      }
      setPassword("");
    } else {
      alert("Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_password");
    }
  };

  // Fetch responses
  const { data: responses = [], isLoading: loadingResponses } = useQuery<SurveyResponse[]>({
    queryKey: ["admin-responses"],
    queryFn: async () => {
      const res = await fetch("/api/admin/responses?password=" + encodeURIComponent(ADMIN_PASSWORD));
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch analytics
  const { data: analytics, isLoading: loadingAnalytics } = useQuery<Analytics>({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics?password=" + encodeURIComponent(ADMIN_PASSWORD));
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const handleDownload = () => {
    window.location.href = `/api/admin/download-csv?password=${encodeURIComponent(ADMIN_PASSWORD)}`;
  };

  // Delete all responses mutation
  const deleteMutation = useMutation({
    mutationFn: async (deletePwd: string) => {
      const res = await fetch("/api/admin/delete-all?password=" + encodeURIComponent(ADMIN_PASSWORD), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Delete-Password": deletePwd,
        },
        body: JSON.stringify({ password: deletePwd }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to delete");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-responses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      setShowDeleteDialog(false);
      setDeletePassword("");
      alert("All survey responses have been deleted successfully");
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to delete responses");
    },
  });

  const handleDeleteAll = () => {
    if (deletePassword === DELETE_PASSWORD) {
      if (window.confirm("Are you absolutely sure you want to delete ALL survey responses? This action cannot be undone.")) {
        deleteMutation.mutate(deletePassword);
      }
    } else {
      alert("Incorrect delete password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Access
            </CardTitle>
            <CardDescription>Enter password to access admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter admin password"
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Survey Response Analytics</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
            <Button 
              onClick={() => setShowDeleteDialog(true)} 
              variant="destructive"
              disabled={analytics?.total === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {loadingAnalytics ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Responses</p>
                    <p className="text-3xl font-bold">{analytics.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <p className="text-3xl font-bold">
                      {analytics.total > 0
                        ? Object.values(analytics.averageRatings).reduce((a, b) => a + b, 0) / Object.keys(analytics.averageRatings).length
                        : 0}
                      <span className="text-lg text-muted-foreground">/5</span>
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Date Range</p>
                    <p className="text-sm font-semibold">
                      {analytics.dateRange
                        ? `${new Date(analytics.dateRange.earliest).toLocaleDateString()} - ${new Date(analytics.dateRange.latest).toLocaleDateString()}`
                        : "N/A"}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Responses</p>
                    <p className="text-3xl font-bold">
                      {analytics.responsesByDate.find(
                        (r) => r.date === new Date().toISOString().split("T")[0]
                      )?.count || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Average Ratings */}
        {analytics && analytics.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Average Ratings by Category</CardTitle>
              <CardDescription>Overall performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analytics.averageRatings).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-lg font-bold">{value.toFixed(2)}/5</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Responses Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Survey Responses</CardTitle>
            <CardDescription>
              {loadingResponses ? "Loading..." : `${responses.length} total responses`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingResponses ? (
              <div className="text-center py-8 text-muted-foreground">Loading responses...</div>
            ) : responses.length === 0 ? (
              <Alert>
                <AlertDescription>No survey responses yet.</AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Overall</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Timeliness</TableHead>
                      <TableHead>Communication</TableHead>
                      <TableHead>Professionalism</TableHead>
                      <TableHead>Issue Resolution</TableHead>
                      <TableHead>Ease of Access</TableHead>
                      <TableHead>Value Added</TableHead>
                      <TableHead>Efficiency</TableHead>
                      <TableHead>Suggestions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>
                          {new Date(response.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{response.name}</TableCell>
                        <TableCell>{response.company}</TableCell>
                        <TableCell>{response.overallExperience}</TableCell>
                        <TableCell>{response.serviceQuality}</TableCell>
                        <TableCell>{response.timeliness}</TableCell>
                        <TableCell>{response.communication}</TableCell>
                        <TableCell>{response.professionalism}</TableCell>
                        <TableCell>{response.issueResolution}</TableCell>
                        <TableCell>{response.easeOfAccess}</TableCell>
                        <TableCell>{response.valueAdded}</TableCell>
                        <TableCell>{response.efficiency}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {response.suggestions || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete All Survey Responses</DialogTitle>
              <DialogDescription>
                This action will permanently delete all survey responses. This cannot be undone.
                Please enter the delete password to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="delete-password">Delete Password</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDeleteAll()}
                  placeholder="Enter delete password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowDeleteDialog(false);
                setDeletePassword("");
              }}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAll}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete All"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
