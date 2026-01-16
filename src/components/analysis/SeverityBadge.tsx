import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface SeverityBadgeProps {
  severity: "low" | "moderate" | "high" | "critical";
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SeverityBadge({
  severity,
  showIcon = true,
  size = "md",
  className = "",
}: SeverityBadgeProps) {
  const config = {
    low: {
      label: "Low",
      labelHi: "कम",
      className: "bg-success/10 text-success border-success/20",
      icon: Info,
    },
    moderate: {
      label: "Moderate",
      labelHi: "मध्यम",
      className: "bg-accent/10 text-accent border-accent/20",
      icon: AlertCircle,
    },
    high: {
      label: "High",
      labelHi: "उच्च",
      className: "bg-destructive/10 text-destructive border-destructive/20",
      icon: AlertTriangle,
    },
    critical: {
      label: "Critical",
      labelHi: "गंभीर",
      className: "bg-destructive text-destructive-foreground",
      icon: AlertTriangle,
    },
  };

  const { label, className: badgeClassName, icon: Icon } = config[severity];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <Badge className={`${badgeClassName} ${sizeClasses[size]} border ${className}`}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {label} Severity
    </Badge>
  );
}
