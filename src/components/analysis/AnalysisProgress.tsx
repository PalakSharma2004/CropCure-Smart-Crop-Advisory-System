import { Progress } from "@/components/ui/progress";
import { Leaf, Search, Brain, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface AnalysisProgressProps {
  isAnalyzing: boolean;
  onComplete?: () => void;
}

const steps = [
  { icon: Leaf, label: "Processing image", labelHi: "छवि प्रोसेस हो रही है" },
  { icon: Search, label: "Detecting crop type", labelHi: "फसल का पता लगाया जा रहा है" },
  { icon: Brain, label: "Analyzing for diseases", labelHi: "रोगों का विश्लेषण" },
  { icon: CheckCircle, label: "Generating results", labelHi: "परिणाम तैयार हो रहे हैं" },
];

export function AnalysisProgress({ isAnalyzing, onComplete }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const stepDuration = 1500;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          onComplete?.();
          return 100;
        }
        return newProgress;
      });
    }, stepDuration / 50);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isAnalyzing, onComplete]);

  if (!isAnalyzing) return null;

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Icon animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative bg-primary text-primary-foreground rounded-full p-6">
              <CurrentIcon className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Current step */}
        <div className="text-center">
          <p className="text-lg font-heading font-semibold">
            {steps[currentStep].label}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {steps[currentStep].labelHi}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
