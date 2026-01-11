import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Camera, Cloud, MessageCircle, ChevronRight } from "lucide-react";

const onboardingSteps = [
  {
    icon: Leaf,
    title: "Welcome to CropCare",
    titleHi: "क्रॉपकेयर में आपका स्वागत है",
    description: "Your AI-powered farming assistant for healthier crops and better yields.",
    descriptionHi: "स्वस्थ फसलों और बेहतर उपज के लिए आपका AI-संचालित कृषि सहायक।",
  },
  {
    icon: Camera,
    title: "Instant Disease Detection",
    titleHi: "तुरंत रोग पहचान",
    description: "Take a photo of your crop and get instant AI-powered disease diagnosis.",
    descriptionHi: "अपनी फसल की तस्वीर लें और तुरंत AI-संचालित रोग निदान प्राप्त करें।",
  },
  {
    icon: Cloud,
    title: "Weather Insights",
    titleHi: "मौसम की जानकारी",
    description: "Get local weather forecasts and alerts to plan your farming activities.",
    descriptionHi: "अपनी खेती की गतिविधियों की योजना बनाने के लिए स्थानीय मौसम पूर्वानुमान प्राप्त करें।",
  },
  {
    icon: MessageCircle,
    title: "Expert AI Assistant",
    titleHi: "विशेषज्ञ AI सहायक",
    description: "Chat with our AI assistant for personalized farming advice in your language.",
    descriptionHi: "अपनी भाषा में व्यक्तिगत खेती सलाह के लिए हमारे AI सहायक से चैट करें।",
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("cropcare_onboarded", "true");
      navigate("/auth");
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
      <div className="flex justify-end p-4">
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Skip
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-fade-in">
          <Icon className="w-16 h-16 text-primary" />
        </div>

        <div className="text-center animate-slide-up">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
            {step.title}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {step.titleHi}
          </p>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {step.description}
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-center gap-2 mb-6">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-6 bg-primary"
                  : index < currentStep
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <Button onClick={handleNext} className="w-full" size="lg">
          {currentStep === onboardingSteps.length - 1 ? (
            "Get Started"
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
