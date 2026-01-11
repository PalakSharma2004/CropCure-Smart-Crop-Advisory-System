import { NavLink, useLocation } from "react-router-dom";
import { Home, Camera, MessageCircle, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Home", labelHi: "होम" },
  { path: "/capture", icon: Camera, label: "Camera", labelHi: "कैमरा" },
  { path: "/chat", icon: MessageCircle, label: "Chat", labelHi: "चैट" },
  { path: "/history", icon: History, label: "History", labelHi: "इतिहास" },
  { path: "/profile", icon: User, label: "Profile", labelHi: "प्रोफ़ाइल" },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/dashboard" && location.pathname === "/");
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-[64px] px-2 py-1 rounded-lg transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
