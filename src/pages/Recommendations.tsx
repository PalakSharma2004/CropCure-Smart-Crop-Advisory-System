import { AppLayout } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Droplets, 
  Bug, 
  Leaf, 
  ShoppingBag, 
  Clock, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function Recommendations() {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  // Mock data
  const recommendations = {
    disease: "Early Blight",
    treatments: [
      {
        id: "1",
        type: "chemical",
        name: "Copper-based Fungicide",
        description: "Apply copper oxychloride spray at 2.5g per liter of water",
        timing: "Early morning or late evening",
        frequency: "Every 7-10 days",
        priority: "high",
      },
      {
        id: "2",
        type: "organic",
        name: "Neem Oil Treatment",
        description: "Mix 5ml neem oil with 1 liter water and spray on affected areas",
        timing: "Evening hours",
        frequency: "Weekly",
        priority: "medium",
      },
      {
        id: "3",
        type: "cultural",
        name: "Remove Affected Leaves",
        description: "Prune and dispose of infected leaves to prevent spread",
        timing: "Immediately",
        frequency: "As needed",
        priority: "high",
      },
    ],
    preventiveMeasures: [
      "Ensure proper spacing between plants for air circulation",
      "Water at the base of plants, avoid wetting leaves",
      "Rotate crops annually",
      "Use disease-resistant varieties",
    ],
  };

  const priorityBadge = {
    high: "bg-destructive text-destructive-foreground",
    medium: "bg-accent text-accent-foreground",
    low: "bg-secondary text-secondary-foreground",
  };

  const typeIcon = {
    chemical: Droplets,
    organic: Leaf,
    cultural: Bug,
  };

  return (
    <AppLayout title="Recommendations">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-heading font-semibold">
            Treatment Plan
          </h2>
          <p className="text-muted-foreground text-sm">
            For {recommendations.disease}
          </p>
        </div>

        {/* Treatments */}
        <Accordion type="single" collapsible className="space-y-3">
          {recommendations.treatments.map((treatment) => {
            const Icon = typeIcon[treatment.type as keyof typeof typeIcon];
            return (
              <AccordionItem 
                key={treatment.id} 
                value={treatment.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{treatment.name}</p>
                      <Badge 
                        variant="secondary" 
                        className={`mt-1 text-xs ${priorityBadge[treatment.priority as keyof typeof priorityBadge]}`}
                      >
                        {treatment.priority} priority
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-3 ml-13">
                    <p className="text-sm text-muted-foreground">
                      {treatment.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{treatment.timing}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{treatment.frequency}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Preventive Measures */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-accent" />
              Preventive Measures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.preventiveMeasures.map((measure, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{measure}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
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
