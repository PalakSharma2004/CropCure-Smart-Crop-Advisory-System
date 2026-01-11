import { ReactNode, useState } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { HamburgerMenu } from "./HamburgerMenu";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
  title?: string;
}

export function AppLayout({ 
  children, 
  showNav = true, 
  showHeader = true,
  title = "CropCare" 
}: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {showHeader && (
        <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-14 items-center justify-between px-4">
            <h1 className="text-lg font-heading font-semibold text-primary">
              {title}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>
      )}

      <main className={`flex-1 ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>

      {showNav && <BottomNavigation />}
      
      <HamburgerMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </div>
  );
}
