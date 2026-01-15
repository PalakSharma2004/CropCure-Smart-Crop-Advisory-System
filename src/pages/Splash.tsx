import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

export default function Splash() {
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage } = useLanguage();
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | null>(null);

  // Check if language was previously selected
  useEffect(() => {
    const savedLanguage = localStorage.getItem("cropcare_language");
    if (savedLanguage) {
      // Language already selected, auto-navigate
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          const hasOnboarded = localStorage.getItem("cropcare_onboarded");
          navigate(hasOnboarded ? "/dashboard" : "/onboarding");
        }, 300);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Show language selection after splash animation
      const timer = setTimeout(() => {
        setShowLanguageSelect(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const handleLanguageSelect = (lang: 'en' | 'hi') => {
    setSelectedLanguage(lang);
    setLanguage(lang);
  };

  const handleContinue = () => {
    if (!selectedLanguage) return;
    setFadeOut(true);
    setTimeout(() => {
      const hasOnboarded = localStorage.getItem("cropcare_onboarded");
      navigate(hasOnboarded ? "/dashboard" : "/onboarding");
    }, 300);
  };

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center bg-primary transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Main splash content */}
      <div className={`flex flex-col items-center transition-all duration-500 ${
        showLanguageSelect ? "translate-y-[-60px]" : ""
      }`}>
        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 animate-fade-in">
          <Leaf className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-white mb-2 animate-fade-in">
          CropCare
        </h1>
        <p className="text-white/80 text-sm animate-fade-in">
          Smart Farming Assistant
        </p>
        <p className="text-white/60 text-xs mt-1 animate-fade-in">
          स्मार्ट खेती सहायक
        </p>
      </div>

      {/* Language Selection Overlay */}
      {showLanguageSelect && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-slide-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-heading font-semibold text-foreground">
              {t("languages.selectLanguage")}
            </h2>
          </div>
          <p className="text-center text-muted-foreground text-sm mb-6">
            {t("languages.choosePreferred")}
          </p>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => handleLanguageSelect('en')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                selectedLanguage === 'en'
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <div className="text-2xl mb-2">🇺🇸</div>
              <p className="font-medium text-foreground">English</p>
            </button>
            <button
              onClick={() => handleLanguageSelect('hi')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                selectedLanguage === 'hi'
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <div className="text-2xl mb-2">🇮🇳</div>
              <p className="font-medium text-foreground">हिंदी</p>
            </button>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedLanguage}
            className="w-full"
            size="lg"
          >
            {t("common.continue")}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {t("common.version")} 1.0.0
          </p>
        </div>
      )}

      {/* Loading spinner - only show before language selection */}
      {!showLanguageSelect && (
        <div className="absolute bottom-10">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
