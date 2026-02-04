import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ExternalLink,
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

// Placeholder thumbnails based on category
const getCategoryThumbnail = (category: string) => {
  const thumbnails: Record<string, string> = {
    diseases: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=150&fit=crop",
    treatments: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&h=150&fit=crop",
    prevention: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&h=150&fit=crop",
    general: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=200&h=150&fit=crop",
  };
  return thumbnails[category] || thumbnails.general;
};

// Sample content body for demo
const getSampleContent = (item: ContentWithProgress): string => {
  if (item.content_body) return item.content_body;
  
  // Generate sample content based on title/category
  const sampleContents: Record<string, string> = {
    diseases: `## Understanding ${item.title}

### Overview
This comprehensive guide helps you identify and understand common crop diseases that can affect your harvest.

### Key Signs to Look For
- **Leaf discoloration**: Yellow, brown, or black spots on leaves
- **Wilting**: Plants that droop despite adequate water
- **Lesions**: Visible damage spots on stems or fruits
- **Mold growth**: Fuzzy or powdery substances on plant surfaces

### Prevention Tips
1. Rotate your crops annually
2. Maintain proper plant spacing for air circulation
3. Water at the base of plants, not on leaves
4. Remove infected plant material promptly

### When to Seek Help
If you notice widespread symptoms or rapid disease progression, consider consulting an agricultural expert or using the CropCare AI analysis feature.`,
    treatments: `## ${item.title}

### Treatment Overview
This guide provides step-by-step instructions for treating common crop issues effectively.

### Recommended Approach
1. **Identify the problem** - Use CropCare's AI analysis for accurate diagnosis
2. **Choose the right treatment** - Select appropriate fungicides/pesticides
3. **Apply at the right time** - Early morning or late evening works best
4. **Follow safety guidelines** - Always wear protective equipment

### Application Tips
- Apply treatments during calm weather (low wind)
- Ensure proper coverage of all plant surfaces
- Follow recommended dosage guidelines
- Keep records of all treatments applied

### Follow-up Care
Monitor treated plants for 7-14 days to assess treatment effectiveness.`,
    prevention: `## ${item.title}

### Prevention is Better Than Cure
Implementing preventive measures can significantly reduce crop losses and treatment costs.

### Key Prevention Strategies
1. **Healthy soil management**
   - Test soil pH regularly
   - Add organic matter for nutrition
   - Practice crop rotation

2. **Water management**
   - Use drip irrigation when possible
   - Avoid overwatering
   - Water early in the day

3. **Plant selection**
   - Choose disease-resistant varieties
   - Buy certified seeds
   - Inspect seedlings before transplanting

### Monitoring Schedule
Check your crops weekly for early signs of problems.`,
    general: `## ${item.title}

### Introduction
This educational resource covers essential farming practices to improve your crop yield and quality.

### Best Practices
- **Soil preparation**: Test and amend soil before planting
- **Timing**: Plant at the optimal time for your region
- **Spacing**: Give plants room to grow
- **Nutrients**: Provide balanced fertilization

### Seasonal Considerations
Adjust your farming practices based on weather conditions and seasonal changes.

### Additional Resources
Use the CropCare app features to track your progress and get personalized recommendations.`,
  };
  
  return sampleContents[item.category] || sampleContents.general;
};

export default function Learn() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedContent, setSelectedContent] = useState<ContentWithProgress | null>(null);
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

  const handleBookmark = async (e: React.MouseEvent, item: ContentWithProgress) => {
    e.stopPropagation();
    try {
      await toggleBookmarkMutation.mutateAsync({ 
        contentId: item.id, 
        isBookmarked: item.isBookmarked 
      });
      toast.success(item.isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
    } catch {
      toast.error("Please log in to bookmark content");
    }
  };

  const handleDownload = async (item: ContentWithProgress) => {
    try {
      await markDownloadedMutation.mutateAsync(item.id);
      toast.success("Downloaded for offline access");
    } catch {
      toast.error("Please log in to download content");
    }
  };

  const openContent = (item: ContentWithProgress) => {
    setSelectedContent(item);
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
            <TabsTrigger value="bookmarks" className="flex items-center gap-1">
              <Bookmark className="h-3 w-3" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center gap-1">
              <Download className="h-3 w-3" />
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
                
                return (
                  <Card 
                    key={item.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                    onClick={() => openContent(item)}
                  >
                    <CardContent className="p-0">
                      <div className="flex gap-4">
                        <div className="relative w-28 h-24 bg-muted shrink-0">
                          <img
                            src={item.thumbnail_url || getCategoryThumbnail(item.category)}
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
                            <span className="absolute bottom-1 left-1 text-[10px] bg-success text-success-foreground px-1.5 py-0.5 rounded">
                              Offline
                            </span>
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
                              onClick={(e) => handleBookmark(e, item)}
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
                            <span className={cn(
                              "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                              "bg-secondary text-secondary-foreground"
                            )}>
                              <TypeIcon className="h-3 w-3" />
                              {item.content_type}
                            </span>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full border",
                              categoryColors[item.category]
                            )}>
                              {item.category}
                            </span>
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

      {/* Content Viewer Dialog */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden">
          {selectedContent && (
            <>
              {/* Header Image/Video */}
              <div className="relative w-full aspect-video bg-muted">
                <img
                  src={selectedContent.thumbnail_url || getCategoryThumbnail(selectedContent.category)}
                  alt={selectedContent.title}
                  className="w-full h-full object-cover"
                />
                {selectedContent.content_type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                      <Play className="h-8 w-8 text-primary fill-primary ml-1" />
                    </div>
                    <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                      Video content - tap to play
                    </p>
                  </div>
                )}
                <span className={cn(
                  "absolute top-3 right-3 text-xs px-2 py-1 rounded-full",
                  categoryColors[selectedContent.category]
                )}>
                  {selectedContent.category}
                </span>
              </div>
              
              <DialogHeader className="px-4 pt-4 pb-2">
                <DialogTitle className="text-lg leading-tight">
                  {selectedContent.title}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedContent.description}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {selectedContent.duration}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedContent.view_count} views
                  </span>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[40vh] px-4 pb-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {getSampleContent(selectedContent).split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-base font-medium mt-3 mb-1">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('- **')) {
                      const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
                      if (match) {
                        return (
                          <p key={i} className="ml-4 my-1">
                            • <strong>{match[1]}</strong>: {match[2]}
                          </p>
                        );
                      }
                    }
                    if (line.startsWith('- ')) {
                      return <p key={i} className="ml-4 my-1">• {line.replace('- ', '')}</p>;
                    }
                    if (line.match(/^\d+\. /)) {
                      return <p key={i} className="ml-4 my-1">{line}</p>;
                    }
                    if (line.trim()) {
                      return <p key={i} className="my-2">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              </ScrollArea>

              <div className="flex items-center gap-2 p-4 border-t bg-muted/30">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleBookmark({ stopPropagation: () => {} } as React.MouseEvent, selectedContent)}
                >
                  {selectedContent.isBookmarked ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                {selectedContent.is_downloadable && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownload(selectedContent)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {selectedContent.isDownloaded ? "Downloaded" : "Download"}
                  </Button>
                )}
                {selectedContent.content_url && (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(selectedContent.content_url!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
