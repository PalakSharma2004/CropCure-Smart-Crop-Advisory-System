import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  User, 
  MapPin, 
  Phone, 
  Edit, 
  Leaf, 
  Award,
  ChevronRight,
  Camera,
  Bell,
  Globe,
  LogOut,
  Mail,
  Save,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const cropTypes = ["Wheat", "Rice", "Tomato", "Cotton", "Sugarcane", "Potato", "Onion", "Maize", "Soybean", "Mustard"];

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);

  // User data state
  const [user, setUser] = useState({
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "+91 98765 43210",
    location: "Uttar Pradesh",
    city: "Varanasi",
    crops: ["Wheat", "Rice", "Tomato"],
    scans: 24,
    memberSince: "January 2024",
    avatarUrl: "",
  });

  // Edit form state
  const [editForm, setEditForm] = useState({ ...user });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    diseaseAlerts: true,
    weatherUpdates: true,
    tipsAndGuides: true,
    promotions: false,
  });

  const handleSaveProfile = () => {
    setUser(editForm);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleCancelEdit = () => {
    setEditForm({ ...user });
    setIsEditing(false);
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload
    setShowPhotoDialog(false);
    toast.success("Photo uploaded successfully!");
  };

  const handleLogout = () => {
    toast.success("Logged out successfully!");
    navigate("/auth");
  };

  const toggleCrop = (crop: string) => {
    setEditForm(prev => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop]
    }));
  };

  return (
    <AppLayout title="Profile">
      <div className="p-4 space-y-6 pb-24">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                  onClick={() => setShowPhotoDialog(true)}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-heading font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {user.city}, {user.location}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {user.phone}
                </p>
              </div>
              <Button 
                variant={isEditing ? "secondary" : "outline"} 
                size="icon"
                onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        {isEditing && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-base">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email"
                    type="email"
                    className="pl-9"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone"
                    className="pl-9"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select 
                    value={editForm.location} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City/District</Label>
                  <Input 
                    id="city"
                    value={editForm.city}
                    onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>My Crops</Label>
                <div className="flex flex-wrap gap-2">
                  {cropTypes.map((crop) => (
                    <Badge 
                      key={crop}
                      variant={editForm.crops.includes(crop) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCrop(crop)}
                    >
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={handleSaveProfile}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        )}

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
        {!isEditing && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center justify-between">
                My Crops
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => setIsEditing(true)}>
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Preferences */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Disease Alerts</p>
                <p className="text-xs text-muted-foreground">Get notified about crop diseases</p>
              </div>
              <Switch 
                checked={notifications.diseaseAlerts}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, diseaseAlerts: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Weather Updates</p>
                <p className="text-xs text-muted-foreground">Daily weather forecasts</p>
              </div>
              <Switch 
                checked={notifications.weatherUpdates}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weatherUpdates: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Tips & Guides</p>
                <p className="text-xs text-muted-foreground">Farming tips and best practices</p>
              </div>
              <Switch 
                checked={notifications.tipsAndGuides}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, tipsAndGuides: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Promotions</p>
                <p className="text-xs text-muted-foreground">Special offers and discounts</p>
              </div>
              <Switch 
                checked={notifications.promotions}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, promotions: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2">
          {[
            { label: "My Farm Details", path: "/farm", icon: Leaf },
            { label: "Language Preferences", path: "/settings", icon: Globe },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.path} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(item.path)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full text-destructive border-destructive/50 hover:bg-destructive/10">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign Out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out? You'll need to log in again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-xs text-center text-muted-foreground">
          Member since {user.memberSince}
        </p>
      </div>

      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Profile Photo</DialogTitle>
            <DialogDescription>
              Upload a new profile photo or take one with your camera.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={handlePhotoUpload}>
              <Camera className="h-8 w-8" />
              <span>Take Photo</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={handlePhotoUpload}>
              <User className="h-8 w-8" />
              <span>Choose from Gallery</span>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPhotoDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
