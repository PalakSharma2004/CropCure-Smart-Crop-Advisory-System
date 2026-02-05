 import { AppLayout } from "@/components/layout";
 import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { 
   Leaf, 
   Users, 
   Target, 
   Heart,
   Award,
   Globe,
   Shield,
   Smartphone,
   ExternalLink
 } from "lucide-react";
 
 const stats = [
   { label: "Farmers Helped", value: "50,000+", icon: Users },
   { label: "Crops Analyzed", value: "1M+", icon: Leaf },
   { label: "Accuracy Rate", value: "90%+", icon: Target },
   { label: "States Covered", value: "28", icon: Globe },
 ];
 
 const features = [
   {
     icon: Smartphone,
     title: "AI-Powered Detection",
     description: "Advanced machine learning algorithms trained on millions of crop images for accurate disease identification."
   },
   {
     icon: Globe,
     title: "Multi-Language Support",
     description: "Available in English, Hindi, Marathi, Telugu, and Tamil to serve farmers across India."
   },
   {
     icon: Shield,
     title: "Works Offline",
     description: "Capture images without internet connectivity. Analysis syncs automatically when you're back online."
   },
   {
     icon: Heart,
     title: "Free for Farmers",
     description: "Core features are completely free, making advanced crop care accessible to all farmers."
   },
 ];
 
 const team = [
   { name: "Agricultural AI Team", role: "Disease Detection Models" },
   { name: "Farming Experts", role: "Treatment Recommendations" },
   { name: "Regional Partners", role: "Local Language Support" },
 ];
 
 export default function About() {
   return (
     <AppLayout title="About CropCare">
       <div className="p-4 space-y-6">
         {/* Hero Section */}
         <div className="text-center py-6">
           <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4">
             <Leaf className="h-10 w-10 text-primary" />
           </div>
           <h1 className="text-2xl font-heading font-bold text-primary mb-2">
             CropCare
           </h1>
           <p className="text-muted-foreground">
             Smart Farming Assistant
           </p>
           <p className="text-sm text-muted-foreground mt-1">
             Version 1.0.0
           </p>
         </div>
 
         {/* Mission */}
         <Card>
           <CardContent className="p-4">
             <h2 className="font-heading font-semibold mb-2 flex items-center gap-2">
               <Target className="h-4 w-4 text-primary" />
               Our Mission
             </h2>
             <p className="text-sm text-muted-foreground leading-relaxed">
               CropCare is dedicated to empowering farmers with AI-powered crop disease detection 
               and expert treatment recommendations. We believe every farmer deserves access to 
               agricultural expertise, regardless of their location or resources.
             </p>
           </CardContent>
         </Card>
 
         {/* Stats */}
         <div className="grid grid-cols-2 gap-3">
           {stats.map((stat) => {
             const Icon = stat.icon;
             return (
               <Card key={stat.label}>
                 <CardContent className="p-4 text-center">
                   <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                   <p className="text-xl font-bold text-foreground">{stat.value}</p>
                   <p className="text-xs text-muted-foreground">{stat.label}</p>
                 </CardContent>
               </Card>
             );
           })}
         </div>
 
         {/* Features */}
         <Card>
           <CardContent className="p-4">
             <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
               <Award className="h-4 w-4 text-primary" />
               Key Features
             </h2>
             <div className="space-y-4">
               {features.map((feature) => {
                 const Icon = feature.icon;
                 return (
                   <div key={feature.title} className="flex gap-3">
                     <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                       <Icon className="h-5 w-5 text-primary" />
                     </div>
                     <div>
                       <h3 className="font-medium text-sm">{feature.title}</h3>
                       <p className="text-xs text-muted-foreground">{feature.description}</p>
                     </div>
                   </div>
                 );
               })}
             </div>
           </CardContent>
         </Card>
 
         {/* Team */}
         <Card>
           <CardContent className="p-4">
             <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
               <Users className="h-4 w-4 text-primary" />
               Our Team
             </h2>
             <div className="space-y-3">
               {team.map((member) => (
                 <div key={member.name} className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                     <Users className="h-5 w-5 text-muted-foreground" />
                   </div>
                   <div>
                     <p className="font-medium text-sm">{member.name}</p>
                     <p className="text-xs text-muted-foreground">{member.role}</p>
                   </div>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
 
         {/* Links */}
         <div className="space-y-2">
           <Button variant="outline" className="w-full justify-between">
             <span>Privacy Policy</span>
             <ExternalLink className="h-4 w-4" />
           </Button>
           <Button variant="outline" className="w-full justify-between">
             <span>Terms of Service</span>
             <ExternalLink className="h-4 w-4" />
           </Button>
           <Button variant="outline" className="w-full justify-between">
             <span>Open Source Licenses</span>
             <ExternalLink className="h-4 w-4" />
           </Button>
         </div>
 
         {/* Footer */}
         <div className="text-center py-4 space-y-2">
           <p className="text-sm text-muted-foreground">
             Made with ❤️ in India
           </p>
           <p className="text-xs text-muted-foreground">
             © 2024 CropCare. All rights reserved.
           </p>
         </div>
       </div>
     </AppLayout>
   );
 }