import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Leaf, 
  Search, 
  Bookmark,
  BookmarkCheck,
  Download,
  FileText,
  Video,
  ShieldCheck,
  Bug,
  Droplets,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEducationalContent, useToggleBookmark, useMarkDownloaded, type ContentWithProgress } from "@/hooks/useEducationalContent";
import { useLanguage } from "@/hooks/useLanguage";

const categoryIcons = {
  diseases: Bug,
  treatments: ShieldCheck,
  prevention: Leaf,
  general: BookOpen,
};

const categoryColors = {
  diseases: "bg-destructive/10 text-destructive",
  treatments: "bg-success/10 text-success",
  prevention: "bg-primary/10 text-primary",
  general: "bg-accent/10 text-accent",
};

export default function Learn() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { currentLanguage } = useLanguage();
  
  // Real data hooks
  const { data: content, isLoading, error } = useEducationalContent(currentLanguage);
  const toggleBookmarkMutation = useToggleBookmark();
  const markDownloadedMutation = useMarkDownloaded();

  const categories = useMemo(() => {
    if (!content) return [];
    return [
      { id: "diseases", name: "Diseases", count: content.filter(c => c.category === "diseases").length, icon: Bug },
      { id: "treatments", name: "Treatments", count: content.filter(c => c.category === "treatments").length, icon: ShieldCheck },
      { id: "prevention", name: "Prevention", count: content.filter(c => c.category === "prevention").length, icon: Leaf },
      { id: "general", name: "General", count: content.filter(c => c.category === "general").length, icon: Droplets },
    ];
  }, [content]);

  const filteredContent = useMemo(() => {
    if (!content) return [];
    
    return content.filter((item) => {
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === "all" || 
        (activeTab === "bookmarks" && item.isBookmarked) ||
        (activeTab === "downloads" && item.isDownloaded) ||
        item.category === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [content, searchQuery, activeTab]);

  const handleBookmark = async (item: ContentWithProgress) => {
    try {
      await toggleBookmarkMutation.mutateAsync({ 
        contentId: item.id, 
        isBookmarked: item.isBookmarked 
      });
      toast.success(item.isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  const handleDownload = async (item: ContentWithProgress) => {
    try {
      await markDownloadedMutation.mutateAsync(item.id);
      toast.success("Downloaded for offline access");
    } catch {
      toast.error("Failed to download");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "article": return FileText;
      case "guide": return BookOpen;
      default: return FileText;
    }
  };

  if (error) {
    return (
      <AppLayout title="Learn">
        <div className="p-4 text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-2 text-destructive opacity-50" />
          <p className="text-destructive">Failed to load content</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Learn">
      <div className="p-4 space-y-6 pb-24">
        {/* Header */}
        <div>
          <h2 className="text-xl font-heading font-semibold">
            Learn & Grow
          </h2>
          <p className="text-muted-foreground text-sm">
            Expand your farming knowledge
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles, videos, guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
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

        {/* Categories */}
        <div className="grid grid-cols-2 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="w-10 h-10 rounded-full mb-3" />
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.id} 
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-all",
                    activeTab === category.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setActiveTab(activeTab === category.id ? "all" : category.id)}
                >
                  <CardContent className="p-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-3",
                      categoryColors[category.id as keyof typeof categoryColors]
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-medium text-sm">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.count} resources</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="bookmarks">
              <Bookmark className="h-4 w-4 mr-1" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="downloads">
              <Download className="h-4 w-4 mr-1" />
              Offline
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <div className="flex gap-4">
                      <Skeleton className="w-28 h-24" />
                      <div className="flex-1 py-3 pr-4">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-3 w-3/4 mb-2" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredContent.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No resources found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredContent.map((item) => {
                const TypeIcon = getTypeIcon(item.content_type);
                const CategoryIcon = categoryIcons[item.category];
                
                return (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex gap-4">
                        <div className="relative w-28 h-24 bg-muted shrink-0">
                          <img
                            src={item.thumbnail_url || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          {item.content_type === "video" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                <Play className="h-5 w-5 text-primary fill-primary ml-0.5" />
                              </div>
                            </div>
                          )}
                          {item.isDownloaded && (
                            <Badge className="absolute bottom-1 left-1 text-[10px] bg-success">
                              Offline
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 py-3 pr-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 shrink-0 -mr-2"
                              disabled={toggleBookmarkMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookmark(item);
                              }}
                            >
                              {item.isBookmarked ? (
                                <BookmarkCheck className="h-4 w-4 text-primary" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs gap-1">
                              <TypeIcon className="h-3 w-3" />
                              {item.content_type}
                            </Badge>
                            <Badge variant="outline" className={cn("text-xs", categoryColors[item.category])}>
                              {item.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                              <Clock className="h-3 w-3" />
                              {item.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Downloadable Guides Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Offline Guides</p>
                  <p className="text-xs text-muted-foreground">Download for field use</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {["Crop Disease Manual", "Pest Control Guide", "Fertilizer Chart", "Seasonal Calendar"].map((guide) => (
                <Button 
                  key={guide} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs justify-start"
                  onClick={() => toast.success(`${guide} downloaded!`)}
                >
                  <FileText className="h-3 w-3 mr-2" />
                  {guide}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
