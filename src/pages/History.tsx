import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Search,
  Grid3X3,
  List,
  Download,
  Filter,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type ViewMode = "grid" | "list";
type ScanStatus = "healthy" | "treated" | "ongoing";

interface Scan {
  id: string;
  date: string;
  crop: string;
  result: string;
  status: ScanStatus;
  imageUrl: string;
  confidence: number;
}

export default function History() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [cropFilter, setCropFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Mock history data
  const scans: Scan[] = [
    {
      id: "1",
      date: "2024-01-10",
      crop: "Tomato",
      result: "Early Blight",
      status: "treated",
      imageUrl: "/placeholder.svg",
      confidence: 92,
    },
    {
      id: "2",
      date: "2024-01-08",
      crop: "Rice",
      result: "Healthy",
      status: "healthy",
      imageUrl: "/placeholder.svg",
      confidence: 98,
    },
    {
      id: "3",
      date: "2024-01-05",
      crop: "Wheat",
      result: "Rust Disease",
      status: "ongoing",
      imageUrl: "/placeholder.svg",
      confidence: 87,
    },
    {
      id: "4",
      date: "2024-01-03",
      crop: "Tomato",
      result: "Healthy",
      status: "healthy",
      imageUrl: "/placeholder.svg",
      confidence: 95,
    },
    {
      id: "5",
      date: "2023-12-28",
      crop: "Cotton",
      result: "Leaf Curl",
      status: "treated",
      imageUrl: "/placeholder.svg",
      confidence: 89,
    },
    {
      id: "6",
      date: "2023-12-20",
      crop: "Rice",
      result: "Brown Spot",
      status: "ongoing",
      imageUrl: "/placeholder.svg",
      confidence: 84,
    },
  ];

  const statusBadge = {
    healthy: { color: "bg-success text-success-foreground", icon: CheckCircle, label: "Healthy" },
    treated: { color: "bg-secondary text-secondary-foreground", icon: CheckCircle, label: "Treated" },
    ongoing: { color: "bg-accent text-accent-foreground", icon: AlertTriangle, label: "Ongoing" },
  };

  // Get unique crops for filter
  const uniqueCrops = useMemo(() => {
    return [...new Set(scans.map((s) => s.crop))];
  }, [scans]);

  // Filter scans
  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        scan.crop.toLowerCase().includes(searchLower) ||
        scan.result.toLowerCase().includes(searchLower);

      // Crop filter
      const matchesCrop = cropFilter === "all" || scan.crop === cropFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all") {
        const scanDate = new Date(scan.date);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - scanDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dateFilter === "week") matchesDate = daysDiff <= 7;
        else if (dateFilter === "month") matchesDate = daysDiff <= 30;
        else if (dateFilter === "quarter") matchesDate = daysDiff <= 90;
      }

      return matchesSearch && matchesCrop && matchesDate;
    });
  }, [scans, searchQuery, cropFilter, dateFilter]);

  // Filter by tab
  const getTabScans = (tab: string) => {
    if (tab === "all") return filteredScans;
    if (tab === "issues") return filteredScans.filter((s) => s.status !== "healthy");
    return filteredScans.filter((s) => s.status === "healthy");
  };

  const handleExportAll = () => {
    const data = filteredScans.map((scan) => ({
      date: scan.date,
      crop: scan.crop,
      result: scan.result,
      status: scan.status,
      confidence: scan.confidence,
    }));

    const csv = [
      "Date,Crop,Result,Status,Confidence",
      ...data.map((d) => `${d.date},${d.crop},${d.result},${d.status},${d.confidence}%`),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cropcare-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCropFilter("all");
    setDateFilter("all");
  };

  const hasActiveFilters = searchQuery || cropFilter !== "all" || dateFilter !== "all";

  const renderScanCard = (scan: Scan) => {
    const status = statusBadge[scan.status];
    const StatusIcon = status.icon;

    return (
      <Card
        key={scan.id}
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate(`/analysis/${scan.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
              <img
                src={scan.imageUrl}
                alt={scan.crop}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-primary" />
                    {scan.crop}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {scan.result}
                  </p>
                </div>
                <Badge className={status.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(scan.date).toLocaleDateString()}
                </p>
                <span className="text-xs font-medium text-primary">
                  {scan.confidence}% confidence
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGridItem = (scan: Scan) => {
    const status = statusBadge[scan.status];
    const StatusIcon = status.icon;

    return (
      <Card
        key={scan.id}
        className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
        onClick={() => navigate(`/analysis/${scan.id}`)}
      >
        <div className="aspect-square bg-muted relative">
          <img
            src={scan.imageUrl}
            alt={scan.crop}
            className="w-full h-full object-cover"
          />
          <Badge className={`absolute top-2 right-2 text-xs ${status.color}`}>
            <StatusIcon className="h-3 w-3" />
          </Badge>
        </div>
        <CardContent className="p-3">
          <p className="font-medium text-sm truncate">{scan.crop}</p>
          <p className="text-xs text-muted-foreground truncate">{scan.result}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(scan.date).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout title="Crop History">
      <div className="p-4 space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{scans.length}</p>
              <p className="text-xs text-muted-foreground">Total Scans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">
                {scans.filter((s) => s.status === "healthy").length}
              </p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">
                {scans.filter((s) => s.status !== "healthy").length}
              </p>
              <p className="text-xs text-muted-foreground">Issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search crops or diseases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter dropdowns */}
          {showFilters && (
            <div className="flex gap-2 flex-wrap">
              <Select value={cropFilter} onValueChange={setCropFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  {uniqueCrops.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}

              <Button variant="outline" size="sm" className="ml-auto" onClick={handleExportAll}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          )}
        </div>

        {/* Results count */}
        {hasActiveFilters && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredScans.length} of {scans.length} scans
          </p>
        )}

        {/* History Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({getTabScans("all").length})</TabsTrigger>
            <TabsTrigger value="issues">Issues ({getTabScans("issues").length})</TabsTrigger>
            <TabsTrigger value="healthy">Healthy ({getTabScans("healthy").length})</TabsTrigger>
          </TabsList>

          {["all", "issues", "healthy"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {getTabScans(tab).length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  {tab === "issues" ? (
                    <>
                      <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No active issues found</p>
                    </>
                  ) : tab === "healthy" ? (
                    <>
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No healthy scans found</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No scans match your search</p>
                    </>
                  )}
                </div>
              ) : viewMode === "list" ? (
                <div className="space-y-3">
                  {getTabScans(tab).map(renderScanCard)}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {getTabScans(tab).map(renderGridItem)}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
