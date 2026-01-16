import { Progress } from "@/components/ui/progress";

interface ConfidenceIndicatorProps {
  confidence: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ConfidenceIndicator({
  confidence,
  size = "md",
  showLabel = true,
}: ConfidenceIndicatorProps) {
  const getConfidenceColor = () => {
    if (confidence >= 85) return "text-success";
    if (confidence >= 70) return "text-secondary";
    if (confidence >= 50) return "text-accent";
    return "text-destructive";
  };

  const getConfidenceLabel = () => {
    if (confidence >= 85) return "High confidence";
    if (confidence >= 70) return "Good confidence";
    if (confidence >= 50) return "Moderate confidence";
    return "Low confidence";
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const progressHeight = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {showLabel && (
          <span className="text-sm text-muted-foreground">
            {getConfidenceLabel()}
          </span>
        )}
        <span className={`font-bold ${sizeClasses[size]} ${getConfidenceColor()}`}>
          {confidence}%
        </span>
      </div>
      <Progress
        value={confidence}
        className={progressHeight[size]}
        style={{
          "--progress-background": confidence >= 85
            ? "hsl(var(--success))"
            : confidence >= 70
            ? "hsl(var(--secondary))"
            : confidence >= 50
            ? "hsl(var(--accent))"
            : "hsl(var(--destructive))",
        } as React.CSSProperties}
      />
    </div>
  );
}
