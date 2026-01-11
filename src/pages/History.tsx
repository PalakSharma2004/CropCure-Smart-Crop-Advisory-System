import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Leaf, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function History() {
  const navigate = useNavigate();

  // Mock history data
  const scans = [
    {
      id: "1",
      date: "2024-01-10",
      crop: "Tomato",
      result: "Early Blight",
      status: "treated",
      imageUrl: "/placeholder.svg",
    },
    {
      id: "2",
      date: "2024-01-08",
      crop: "Rice",
      result: "Healthy",
      status: "healthy",
      imageUrl: "/placeholder.svg",
    },
    {
      id: "3",
      date: "2024-01-05",
      crop: "Wheat",
      result: "Rust Disease",
      status: "ongoing",
      imageUrl: "/placeholder.svg",
    },
  ];

  const statusBadge = {
    healthy: { color: "bg-success text-success-foreground", icon: CheckCircle },
    treated: { color: "bg-secondary text-secondary-foreground", icon: CheckCircle },
    ongoing: { color: "bg-accent text-accent-foreground", icon: AlertTriangle },
  };

  return (
    <AppLayout title="Crop History">
      <div className="p-4 space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">24</p>
              <p className="text-xs text-muted-foreground">Total Scans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">18</p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">6</p>
              <p className="text-xs text-muted-foreground">Issues</p>
            </CardContent>
          </Card>
        </div>

        {/* History Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="healthy">Healthy</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-3">
            {scans.map((scan) => {
              const status = statusBadge[scan.status as keyof typeof statusBadge];
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
                            {scan.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(scan.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="issues" className="mt-4">
            <div className="text-center text-muted-foreground py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No active issues</p>
            </div>
          </TabsContent>

          <TabsContent value="healthy" className="mt-4">
            <div className="text-center text-muted-foreground py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>All healthy scans will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
