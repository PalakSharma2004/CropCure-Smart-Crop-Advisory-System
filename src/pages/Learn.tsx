import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Clock, Leaf } from "lucide-react";

export default function Learn() {
  // Mock learning content
  const categories = [
    { name: "Disease Management", count: 12, icon: Leaf },
    { name: "Pest Control", count: 8, icon: Leaf },
    { name: "Water Management", count: 6, icon: Leaf },
    { name: "Soil Health", count: 10, icon: Leaf },
  ];

  const featuredContent = [
    {
      id: "1",
      title: "Identifying Common Tomato Diseases",
      type: "video",
      duration: "5 min",
      thumbnail: "/placeholder.svg",
    },
    {
      id: "2",
      title: "Organic Pest Control Methods",
      type: "article",
      duration: "3 min read",
      thumbnail: "/placeholder.svg",
    },
    {
      id: "3",
      title: "Best Practices for Rice Cultivation",
      type: "video",
      duration: "8 min",
      thumbnail: "/placeholder.svg",
    },
  ];

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

        {/* Categories */}
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium text-sm">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.count} resources</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Featured Content */}
        <div className="space-y-3">
          <h3 className="font-heading font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Featured Resources
          </h3>

          {featuredContent.map((content) => (
            <Card key={content.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex gap-4">
                  <div className="relative w-28 h-20 bg-muted shrink-0 rounded-l-lg overflow-hidden">
                    <img
                      src={content.thumbnail}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                    {content.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-8 w-8 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 py-3 pr-4">
                    <p className="font-medium text-sm line-clamp-2">{content.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {content.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {content.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
