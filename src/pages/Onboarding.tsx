import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Camera, Cloud, MessageCircle, ChevronRight, ChevronLeft, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const onboardingSteps = [
  {
    icon: Leaf,
    image: "🌾",
    translationKey: "step1",
  },
  {
    icon: Camera,
    image: "📷",
    translationKey: "step2",
  },
  {
    icon: Cloud,
    image: "🌤️",
    translationKey: "step3",
  },
  {
    icon: MessageCircle,
    image: "💬",
    translationKey: "step4",
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const navigate = useNavigate();
  const { t, currentLanguage, toggleLanguage } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
    if (isRightSwipe && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("cropcare_onboarded", "true");
      navigate("/auth");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("cropcare_onboarded", "true");
    navigate("/auth");
  };

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with skip and language toggle */}
      <div className="flex justify-between items-center p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="text-muted-foreground gap-2"
        >
          <Globe className="h-4 w-4" />
          {currentLanguage === 'en' ? 'हिंदी' : 'EN'}
        </Button>
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          {t("common.skip")}
        </Button>
      </div>

      {/* Swipeable content area */}
      <div 
        ref={containerRef}
        className="flex-1 flex flex-col items-center justify-center px-6 touch-pan-x"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Illustration */}
        <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-fade-in">
          <span className="text-7xl">{step.image}</span>
        </div>

        {/* Icon badge */}
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-6 -mt-4 shadow-lg">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>

        {/* Text content with slide animation */}
        <div key={currentStep} className="text-center animate-slide-up">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
            {t(`onboarding.${step.translationKey}.title`)}
          </h2>
          <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {t(`onboarding.${step.translationKey}.description`)}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 pb-8">
        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-primary"
                  : index < currentStep
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handlePrev}
              size="lg"
              className="flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1" size="lg">
            {currentStep === onboardingSteps.length - 1 ? (
              t("common.getStarted")
            ) : (
              <>
                {t("common.next")}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
