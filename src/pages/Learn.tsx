import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: "video" | "article" | "guide";
  category: "diseases" | "treatments" | "prevention" | "general";
  duration: string;
  thumbnail: string;
  isBookmarked: boolean;
  isDownloaded: boolean;
}

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
  const [content, setContent] = useState<ContentItem[]>([
    {
      id: "1",
      title: "Identifying Common Tomato Diseases",
      description: "Learn to recognize early signs of blight, wilt, and other tomato diseases with visual examples.",
      type: "video",
      category: "diseases",
      duration: "5 min",
      thumbnail: "/placeholder.svg",
      isBookmarked: true,
      isDownloaded: false,
    },
    {
      id: "2",
      title: "Organic Pest Control Methods",
      description: "Discover natural ways to protect your crops from common pests without chemicals.",
      type: "article",
      category: "prevention",
      duration: "3 min read",
      thumbnail: "/placeholder.svg",
      isBookmarked: false,
      isDownloaded: false,
    },
    {
      id: "3",
      title: "Best Practices for Rice Cultivation",
      description: "Complete guide to growing healthy rice crops from planting to harvest.",
      type: "video",
      category: "general",
      duration: "8 min",
      thumbnail: "/placeholder.svg",
      isBookmarked: false,
      isDownloaded: true,
    },
    {
      id: "4",
      title: "Treating Wheat Rust Disease",
      description: "Step-by-step treatment guide for wheat rust with recommended fungicides.",
      type: "guide",
      category: "treatments",
      duration: "4 min read",
      thumbnail: "/placeholder.svg",
      isBookmarked: true,
      isDownloaded: false,
    },
    {
      id: "5",
      title: "Early Blight Prevention in Potatoes",
      description: "Preventive measures to protect potato crops from early blight infection.",
      type: "article",
      category: "prevention",
      duration: "5 min read",
      thumbnail: "/placeholder.svg",
      isBookmarked: false,
      isDownloaded: false,
    },
    {
      id: "6",
      title: "Water Management for Crops",
      description: "Efficient irrigation techniques to optimize water usage and crop yield.",
      type: "video",
      category: "general",
      duration: "6 min",
      thumbnail: "/placeholder.svg",
      isBookmarked: false,
      isDownloaded: false,
    },
    {
      id: "7",
      title: "Cotton Leaf Curl Virus Guide",
      description: "Understanding and managing cotton leaf curl virus in your fields.",
      type: "guide",
      category: "diseases",
      duration: "7 min read",
      thumbnail: "/placeholder.svg",
      isBookmarked: false,
      isDownloaded: false,
    },
    {
      id: "8",
      title: "Integrated Pest Management",
      description: "Comprehensive approach combining biological, cultural, and chemical pest control.",
      type: "video",
      category: "treatments",
      duration: "10 min",
      thumbnail: "/placeholder.svg",
      isBookmarked: false,
      isDownloaded: false,
    },
  ]);

  const categories = [
    { id: "diseases", name: "Diseases", count: content.filter(c => c.category === "diseases").length, icon: Bug },
    { id: "treatments", name: "Treatments", count: content.filter(c => c.category === "treatments").length, icon: ShieldCheck },
    { id: "prevention", name: "Prevention", count: content.filter(c => c.category === "prevention").length, icon: Leaf },
    { id: "general", name: "General", count: content.filter(c => c.category === "general").length, icon: Droplets },
  ];

  const filteredContent = useMemo(() => {
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

  const handleBookmark = (id: string) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
    ));
    const item = content.find(c => c.id === id);
    toast.success(item?.isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
  };

  const handleDownload = (id: string) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, isDownloaded: true } : item
    ));
    toast.success("Downloaded for offline access");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "article": return FileText;
      case "guide": return BookOpen;
      default: return FileText;
    }
  };

  return (
    <AppLayout title="Learn">
      <div className="p-4 space-y-6">
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
          {categories.map((category) => {
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
          })}
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
            {filteredContent.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No resources found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredContent.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                const CategoryIcon = categoryIcons[item.category];
                
                return (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex gap-4">
                        <div className="relative w-28 h-24 bg-muted shrink-0">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          {item.type === "video" && (
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookmark(item.id);
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
                              {item.type}
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
