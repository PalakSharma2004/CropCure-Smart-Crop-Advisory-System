import { AppLayout } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Droplets, Leaf, Bug, ShoppingBag, Clock, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { useAnalysis } from "@/hooks/useAnalyses";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter((item) => item.trim().length > 0);
}

export default function Recommendations() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useAnalysis(analysisId);

  const analysis = data?.analysis;
  const recommendations = data?.recommendations;

  if (isLoading) {
    return (
      <AppLayout title="Recommendations">
        <div className="p-4 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (error || !analysis) {
    return (
      <AppLayout title="Recommendations">
        <div className="p-4 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-destructive" />
          <p className="font-medium">Recommendations not available</p>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Could not load this recommendation set."}
          </p>
          <Button onClick={() => navigate("/history")}>Go to History</Button>
        </div>
      </AppLayout>
    );
  }

  const treatmentSteps = toStringArray(recommendations?.treatment_steps);
  const preventiveMeasures = toStringArray(recommendations?.precautionary_measures);
  const productsRecommended = toStringArray(recommendations?.products_recommended);
  const expertTips = toStringArray(recommendations?.expert_tips);

  const diseaseName = analysis.disease_prediction || "Healthy";

  const treatmentIcons = [Droplets, Leaf, Bug];

  return (
    <AppLayout title="Recommendations">
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-xl font-heading font-semibold">Treatment Plan</h2>
          <p className="text-muted-foreground text-sm capitalize">
            For {analysis.crop_type} • {diseaseName}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {treatmentSteps.length > 0 ? (
            treatmentSteps.map((step, index) => {
              const Icon = treatmentIcons[index % treatmentIcons.length];
              return (
                <AccordionItem key={index} value={`step-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Treatment Step {index + 1}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Action recommended by AI analysis</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-3 ml-13">
                      <p className="text-sm text-muted-foreground">{step}</p>
                      {recommendations?.timeline && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{recommendations.timeline}</span>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                No treatment steps available for this analysis.
              </CardContent>
            </Card>
          )}
        </Accordion>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-accent" />
              Preventive Measures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {preventiveMeasures.length > 0 ? (
              <ul className="space-y-2">
                {preventiveMeasures.map((measure, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{measure}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No preventive measures available.</p>
            )}
          </CardContent>
        </Card>

        {(productsRecommended.length > 0 || expertTips.length > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading">Additional Guidance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {productsRecommended.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Recommended Products</p>
                  <ul className="space-y-1">
                    {productsRecommended.map((product, index) => (
                      <li key={index} className="text-sm text-muted-foreground">• {product}</li>
                    ))}
                  </ul>
                </div>
              )}

              {expertTips.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Expert Tips</p>
                  <ul className="space-y-1">
                    {expertTips.map((tip, index) => (
                      <li key={index} className="text-sm text-muted-foreground">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <Button size="lg" className="w-full">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Find Products Nearby
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/chat")}>
            Ask AI for More Details
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

