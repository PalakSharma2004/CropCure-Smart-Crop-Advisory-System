import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Cloud, 
  Leaf,
  Trash2,
  Settings,
  BellOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "alert" | "info" | "success";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Mock notifications for now
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Disease Detected",
    message: "Possible leaf blight detected in your recent tomato scan. View recommendations.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "Weather Alert",
    message: "Heavy rain expected tomorrow. Consider delaying pesticide application.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  },
  {
    id: "3",
    type: "success",
    title: "Healthy Crop",
    message: "Your wheat scan shows healthy crops! Keep up the good practices.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
];

const notificationIcons = {
  alert: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  info: { icon: Cloud, color: "text-primary", bg: "bg-primary/10" },
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <AppLayout 
      title="Notifications"
      rightElement={
        <Button variant="ghost" size="icon" onClick={() => {}}>
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Button>
      }
    >
      <div className="p-4 space-y-4 pb-24">
        {/* Header Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive">
                Clear all
              </Button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BellOff className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              You're all caught up! We'll notify you when there's something new.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const { icon: Icon, color, bg } = notificationIcons[notification.type];
              
              return (
                <Card 
                  key={notification.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    !notification.read && "border-l-4 border-l-primary bg-primary/5"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", bg)}>
                        <Icon className={cn("h-5 w-5", color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={cn(
                              "font-medium text-sm",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 shrink-0 -mr-2 -mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Stay Updated</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Get alerts about crop health, weather changes, and treatment reminders.
                  Manage notification preferences in Settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
