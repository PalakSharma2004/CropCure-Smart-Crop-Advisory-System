import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Cloud,
  BookOpen,
  Settings,
  HelpCircle,
  Info,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HamburgerMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { path: "/weather", icon: Cloud, label: "Weather", labelHi: "मौसम" },
  { path: "/learn", icon: BookOpen, label: "Learn", labelHi: "सीखें" },
  { path: "/settings", icon: Settings, label: "Settings", labelHi: "सेटिंग्स" },
  { path: "/help", icon: HelpCircle, label: "Help & Support", labelHi: "मदद" },
  { path: "/about", icon: Info, label: "About", labelHi: "जानकारी" },
];

export function HamburgerMenu({ open, onOpenChange }: HamburgerMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <SheetTitle className="font-heading text-xl text-primary">
              CropCare
            </SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Smart Farming Assistant
          </p>
        </SheetHeader>

        <nav className="mt-8 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                  "text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-xs text-muted-foreground text-center">
            Version 1.0.0
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
