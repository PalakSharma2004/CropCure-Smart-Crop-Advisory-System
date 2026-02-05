import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Shield, 
  HelpCircle,
  LogOut,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPreferences, useUpdatePreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import { changeLanguage, getCurrentLanguage } from "@/i18n";

export default function Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { data: preferences, isLoading } = useUserPreferences();
  const updatePreferences = useUpdatePreferences();
  
  // Local state for UI
  const [language, setLanguage] = useState(getCurrentLanguage());
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [dailyTips, setDailyTips] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Initialize state from preferences
  useEffect(() => {
    if (preferences) {
      setLanguage(preferences.language || 'en');
      const notifSettings = preferences.notification_settings as {
        push_enabled?: boolean;
        weather_alerts?: boolean;
        daily_tips?: boolean;
      } | null;
      if (notifSettings) {
        setPushNotifications(notifSettings.push_enabled ?? true);
        setWeatherAlerts(notifSettings.weather_alerts ?? true);
        setDailyTips(notifSettings.daily_tips ?? false);
      }
    }
  }, [preferences]);

  // Initialize dark mode from localStorage/system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && systemDark);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLanguageChange = async (newLang: string) => {
    setLanguage(newLang);
    changeLanguage(newLang as 'en' | 'hi');
    
    // Save to database
    try {
      await updatePreferences.mutateAsync({ language: newLang });
      toast({
        title: newLang === 'hi' ? 'भाषा बदली गई' : 'Language Changed',
        description: newLang === 'hi' ? 'हिंदी में बदल दिया गया' : `Language set to ${newLang === 'en' ? 'English' : 'हिन्दी'}`,
      });
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    toast({
      title: checked ? 'Dark Mode Enabled' : 'Light Mode Enabled',
      description: checked ? 'Easier on eyes in low light' : 'Bright theme activated',
    });
  };

  const handleNotificationChange = async (
    type: 'push' | 'weather' | 'tips',
    checked: boolean
  ) => {
    // Update local state
    if (type === 'push') setPushNotifications(checked);
    if (type === 'weather') setWeatherAlerts(checked);
    if (type === 'tips') setDailyTips(checked);

    // Save to database
    const currentSettings = (preferences?.notification_settings as object) || {};
    const newSettings = {
      ...currentSettings,
      push_enabled: type === 'push' ? checked : pushNotifications,
      weather_alerts: type === 'weather' ? checked : weatherAlerts,
      daily_tips: type === 'tips' ? checked : dailyTips,
    };

    try {
      await updatePreferences.mutateAsync({ notification_settings: newSettings });
    } catch (error) {
      console.error('Failed to save notification preference:', error);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

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
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              More languages coming soon: Marathi, Telugu, Tamil
            </p>
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
              <Switch 
                id="push" 
                checked={pushNotifications}
                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weather" className="flex flex-col gap-1">
                <span>Weather Alerts</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Get notified about weather changes
                </span>
              </Label>
              <Switch 
                id="weather" 
                checked={weatherAlerts}
                onCheckedChange={(checked) => handleNotificationChange('weather', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tips" className="flex flex-col gap-1">
                <span>Daily Tips</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Receive daily farming tips
                </span>
              </Label>
              <Switch 
                id="tips" 
                checked={dailyTips}
                onCheckedChange={(checked) => handleNotificationChange('tips', checked)}
              />
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
              <Switch 
                id="dark" 
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
              />
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
              <Switch 
                id="analytics" 
                checked={analytics}
                onCheckedChange={setAnalytics}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="offline" className="flex flex-col gap-1">
                <span>Offline Mode</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Download data for offline use
                </span>
              </Label>
              <Switch 
                id="offline" 
                checked={offlineMode}
                onCheckedChange={setOfflineMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            size="lg"
            onClick={() => navigate('/help')}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive hover:text-destructive" 
            size="lg"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-4">
          Version 1.0.0 • Made with ❤️ in India
        </p>
      </div>
    </AppLayout>
  );
}
