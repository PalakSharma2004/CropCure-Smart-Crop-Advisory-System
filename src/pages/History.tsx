import { useState, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAnalyses, type CropAnalysis } from "@/hooks/useAnalyses";
import { VirtualizedList } from "@/components/common";
import { formatDistanceToNow } from "date-fns";

type ViewMode = "grid" | "list";

export default function History() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [cropFilter, setCropFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch real data
  const { data: analyses, isLoading, error } = useAnalyses();

  const getStatus = (analysis: CropAnalysis): 'healthy' | 'treated' | 'ongoing' => {
    if (!analysis.disease_prediction || 
        analysis.disease_prediction.toLowerCase() === 'healthy' ||
        analysis.disease_prediction.toLowerCase().includes('no disease')) {
      return 'healthy';
    }
    if (analysis.status === 'completed') {
      return 'treated';
    }
    return 'ongoing';
  };

  const statusBadge = {
    healthy: { color: "bg-success text-success-foreground", icon: CheckCircle, label: "Healthy" },
    treated: { color: "bg-secondary text-secondary-foreground", icon: CheckCircle, label: "Treated" },
    ongoing: { color: "bg-accent text-accent-foreground", icon: AlertTriangle, label: "Ongoing" },
  };

  // Get unique crops for filter
  const uniqueCrops = useMemo(() => {
    if (!analyses) return [];
    return [...new Set(analyses.map((s) => s.crop_type))];
  }, [analyses]);

  // Filter analyses
  const filteredAnalyses = useMemo(() => {
    if (!analyses) return [];
    
    return analyses.filter((analysis) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        analysis.crop_type.toLowerCase().includes(searchLower) ||
        (analysis.disease_prediction?.toLowerCase().includes(searchLower) || false);

      // Crop filter
      const matchesCrop = cropFilter === "all" || analysis.crop_type === cropFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all") {
        const analysisDate = new Date(analysis.analysis_date);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - analysisDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dateFilter === "week") matchesDate = daysDiff <= 7;
        else if (dateFilter === "month") matchesDate = daysDiff <= 30;
        else if (dateFilter === "quarter") matchesDate = daysDiff <= 90;
      }

      // Tab filter
      const status = getStatus(analysis);
      let matchesTab = true;
      if (activeTab === "issues") matchesTab = status !== "healthy";
      else if (activeTab === "healthy") matchesTab = status === "healthy";

      return matchesSearch && matchesCrop && matchesDate && matchesTab;
    });
  }, [analyses, searchQuery, cropFilter, dateFilter, activeTab]);

  // Stats
  const stats = useMemo(() => {
    if (!analyses) return { total: 0, healthy: 0, issues: 0 };
    const healthy = analyses.filter(a => getStatus(a) === 'healthy').length;
    return {
      total: analyses.length,
      healthy,
      issues: analyses.length - healthy,
    };
  }, [analyses]);

  const handleExportAll = () => {
    const data = filteredAnalyses.map((analysis) => ({
      date: analysis.analysis_date,
      crop: analysis.crop_type,
      result: analysis.disease_prediction || 'Healthy',
      status: getStatus(analysis),
      confidence: analysis.confidence_score,
    }));

    const csv = [
      "Date,Crop,Result,Status,Confidence",
      ...data.map((d) => `${d.date},${d.crop},${d.result},${d.status},${d.confidence || 0}%`),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cropcure-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCropFilter("all");
    setDateFilter("all");
  };

  const hasActiveFilters = searchQuery || cropFilter !== "all" || dateFilter !== "all";

  const renderScanCard = useCallback((analysis: CropAnalysis) => {
    const status = statusBadge[getStatus(analysis)];
    const StatusIcon = status.icon;

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow mb-3"
        onClick={() => navigate(`/analysis/${analysis.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
              <img
                src={analysis.image_url || "/placeholder.svg"}
                alt={analysis.crop_type}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium flex items-center gap-2 capitalize">
                    <Leaf className="h-4 w-4 text-primary" />
                    {analysis.crop_type}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {analysis.disease_prediction || 'Healthy'}
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
                  {formatDistanceToNow(new Date(analysis.analysis_date), { addSuffix: true })}
                </p>
                {analysis.confidence_score && (
                  <span className="text-xs font-medium text-primary">
                    {Math.round(analysis.confidence_score)}% confidence
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [navigate]);

  const renderGridItem = useCallback((analysis: CropAnalysis) => {
    const status = statusBadge[getStatus(analysis)];
    const StatusIcon = status.icon;

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
        onClick={() => navigate(`/analysis/${analysis.id}`)}
      >
        <div className="aspect-square bg-muted relative">
          <img
            src={analysis.image_url || "/placeholder.svg"}
            alt={analysis.crop_type}
            className="w-full h-full object-cover"
          />
          <Badge className={`absolute top-2 right-2 text-xs ${status.color}`}>
            <StatusIcon className="h-3 w-3" />
          </Badge>
        </div>
        <CardContent className="p-3">
          <p className="font-medium text-sm truncate capitalize">{analysis.crop_type}</p>
          <p className="text-xs text-muted-foreground truncate">{analysis.disease_prediction || 'Healthy'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(analysis.analysis_date), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>
    );
  }, [navigate]);

  if (error) {
    return (
      <AppLayout title="Crop History">
        <div className="p-4 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-destructive" />
          <p className="text-destructive">Failed to load history</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Crop History">
      <div className="p-4 space-y-4 pb-24">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-8 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              )}
              <p className="text-xs text-muted-foreground">Total Scans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-8 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-success">{stats.healthy}</p>
              )}
              <p className="text-xs text-muted-foreground">Healthy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-8 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-accent">{stats.issues}</p>
              )}
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
                    <SelectItem key={crop} value={crop} className="capitalize">
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
        {hasActiveFilters && analyses && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredAnalyses.length} of {analyses.length} scans
          </p>
        )}

        {/* History Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({analyses?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="issues">
              Issues ({stats.issues})
            </TabsTrigger>
            <TabsTrigger value="healthy">
              Healthy ({stats.healthy})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="w-16 h-16 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-32 mb-2" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAnalyses.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                {activeTab === "issues" ? (
                  <>
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No active issues found</p>
                  </>
                ) : activeTab === "healthy" ? (
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
              // Use virtual scrolling for large lists
              filteredAnalyses.length > 20 ? (
                <VirtualizedList
                  items={filteredAnalyses}
                  itemHeight={120}
                  containerHeight={500}
                  renderItem={(item) => renderScanCard(item)}
                  className="pr-2"
                />
              ) : (
                <div className="space-y-3">
                  {filteredAnalyses.map(renderScanCard)}
                </div>
              )
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredAnalyses.map(renderGridItem)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
