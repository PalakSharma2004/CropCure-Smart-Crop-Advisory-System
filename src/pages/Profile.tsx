import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  MapPin, 
  Phone, 
  Edit, 
  Leaf, 
  Award,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  // Mock user data
  const user = {
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    location: "Varanasi, UP",
    crops: ["Wheat", "Rice", "Tomato"],
    scans: 24,
    memberSince: "January 2024",
  };

  return (
    <AppLayout title="Profile">
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-heading font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {user.location}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {user.phone}
                </p>
              </div>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{user.scans}</p>
              <p className="text-xs text-muted-foreground">Total Scans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <Award className="h-5 w-5 text-accent" />
              </div>
              <p className="text-2xl font-bold">Silver</p>
              <p className="text-xs text-muted-foreground">Member Level</p>
            </CardContent>
          </Card>
        </div>

        {/* My Crops */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center justify-between">
              My Crops
              <Button variant="ghost" size="sm" className="text-primary">
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.crops.map((crop) => (
                <Badge key={crop} variant="secondary" className="text-sm">
                  {crop}
                </Badge>
              ))}
              <Badge variant="outline" className="text-sm cursor-pointer">
                + Add Crop
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2">
          {[
            { label: "My Farm Details", path: "/farm" },
            { label: "Subscription", path: "/subscription" },
            { label: "Language Preferences", path: "/settings" },
            { label: "Help & Support", path: "/help" },
          ].map((item) => (
            <Card 
              key={item.path} 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <span className="font-medium">{item.label}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Member since {user.memberSince}
        </p>
      </div>
    </AppLayout>
  );
}
