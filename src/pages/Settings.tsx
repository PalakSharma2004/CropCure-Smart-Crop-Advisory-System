import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Globe, 
  Moon, 
  Smartphone, 
  Shield, 
  HelpCircle,
  LogOut
} from "lucide-react";

export default function Settings() {
  return (
    <AppLayout title="Settings">
      <div className="p-4 space-y-6">
        {/* Language */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language / भाषा
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select defaultValue="en">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push" className="flex flex-col gap-1">
                <span>Push Notifications</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Receive alerts about your crops
                </span>
              </Label>
              <Switch id="push" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weather" className="flex flex-col gap-1">
                <span>Weather Alerts</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Get notified about weather changes
                </span>
              </Label>
              <Switch id="weather" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tips" className="flex flex-col gap-1">
                <span>Daily Tips</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Receive daily farming tips
                </span>
              </Label>
              <Switch id="tips" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark" className="flex flex-col gap-1">
                <span>Dark Mode</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Easier on eyes in low light
                </span>
              </Label>
              <Switch id="dark" />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Data & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="analytics" className="flex flex-col gap-1">
                <span>Usage Analytics</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Help us improve the app
                </span>
              </Label>
              <Switch id="analytics" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="offline" className="flex flex-col gap-1">
                <span>Offline Mode</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Download data for offline use
                </span>
              </Label>
              <Switch id="offline" />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button variant="outline" className="w-full justify-start" size="lg">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" size="lg">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-4">
          Version 1.0.0 • Made with ❤️ in India
        </p>
      </div>
    </AppLayout>
  );
}
