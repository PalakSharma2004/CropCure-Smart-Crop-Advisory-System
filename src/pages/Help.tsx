 import { AppLayout } from "@/components/layout";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
 import { 
   MessageCircle, 
   Phone, 
   Mail, 
   FileText, 
   Video,
   Search,
   Send,
   ExternalLink
 } from "lucide-react";
 import { useState } from "react";
 import { useToast } from "@/hooks/use-toast";
 
 const faqs = [
   {
     question: "How do I scan my crops for diseases?",
     answer: "Go to the Camera tab, take a clear photo of the affected plant part (leaf, stem, or fruit), and our AI will analyze it within seconds. Make sure to capture the affected area clearly with good lighting."
   },
   {
      question: "What crops does CropCure support?",
      answer: "CropCure currently supports Rice, Wheat, Cotton, Tomato, Potato, Maize, Sugarcane, and many more. We're constantly adding support for new crops based on user feedback."
   },
   {
     question: "How accurate is the disease detection?",
     answer: "Our AI model has been trained on millions of crop images and achieves 90%+ accuracy for common diseases. The confidence score shown with each analysis helps you understand the reliability of the prediction."
   },
   {
     question: "Can I use CropCure offline?",
     answer: "Yes! You can capture images offline, and they will be automatically analyzed when you're back online. Your history and recommendations are also cached for offline viewing."
   },
   {
     question: "How do I get personalized recommendations?",
     answer: "After each crop analysis, you'll receive tailored treatment recommendations based on the detected disease, your location, and local weather conditions."
   },
   {
     question: "Is my data secure?",
     answer: "Absolutely. All your data is encrypted and stored securely. We never share your personal information or farm data with third parties without your consent."
   },
   {
     question: "How can I change the app language?",
     answer: "Go to Settings > Language and select your preferred language. CropCure supports English, Hindi, Marathi, Telugu, and Tamil."
   },
   {
     question: "What should I do if the analysis seems incorrect?",
     answer: "You can use the Chat feature to discuss your concerns with our AI assistant, or contact our support team. Providing a clearer image often helps improve accuracy."
   }
 ];
 
 export default function Help() {
   const [searchQuery, setSearchQuery] = useState("");
   const [message, setMessage] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const { toast } = useToast();
 
   const filteredFaqs = faqs.filter(
     faq => 
       faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
       faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   const handleSubmitQuery = async () => {
     if (!message.trim()) return;
     
     setIsSubmitting(true);
     // Simulate sending
     await new Promise(resolve => setTimeout(resolve, 1000));
     
     toast({
       title: "Message Sent",
       description: "We'll get back to you within 24 hours.",
     });
     
     setMessage("");
     setIsSubmitting(false);
   };
 
   return (
     <AppLayout title="Help & Support">
       <div className="p-4 space-y-6">
         {/* Search FAQs */}
         <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Search help topics..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-10"
           />
         </div>
 
         {/* Quick Actions */}
         <div className="grid grid-cols-2 gap-3">
           <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
             <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
               <div className="p-2 rounded-full bg-primary/10">
                 <MessageCircle className="h-5 w-5 text-primary" />
               </div>
               <span className="text-sm font-medium">Live Chat</span>
               <span className="text-xs text-muted-foreground">Chat with AI</span>
             </CardContent>
           </Card>
           
           <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
             <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
               <div className="p-2 rounded-full bg-green-500/10">
                 <Phone className="h-5 w-5 text-green-600" />
               </div>
               <span className="text-sm font-medium">Call Us</span>
               <span className="text-xs text-muted-foreground">1800-XXX-XXXX</span>
             </CardContent>
           </Card>
           
           <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
             <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
               <div className="p-2 rounded-full bg-blue-500/10">
                 <Mail className="h-5 w-5 text-blue-600" />
               </div>
               <span className="text-sm font-medium">Email</span>
               <span className="text-xs text-muted-foreground">support@cropcure.in</span>
             </CardContent>
           </Card>
           
           <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
             <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
               <div className="p-2 rounded-full bg-orange-500/10">
                 <Video className="h-5 w-5 text-orange-600" />
               </div>
               <span className="text-sm font-medium">Tutorials</span>
               <span className="text-xs text-muted-foreground">Video guides</span>
             </CardContent>
           </Card>
         </div>
 
         {/* FAQs */}
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-base font-heading flex items-center gap-2">
               <FileText className="h-4 w-4" />
               Frequently Asked Questions
             </CardTitle>
           </CardHeader>
           <CardContent>
             {filteredFaqs.length > 0 ? (
               <Accordion type="single" collapsible className="w-full">
                 {filteredFaqs.map((faq, index) => (
                   <AccordionItem key={index} value={`item-${index}`}>
                     <AccordionTrigger className="text-left text-sm">
                       {faq.question}
                     </AccordionTrigger>
                     <AccordionContent className="text-muted-foreground text-sm">
                       {faq.answer}
                     </AccordionContent>
                   </AccordionItem>
                 ))}
               </Accordion>
             ) : (
               <p className="text-center text-muted-foreground py-4">
                 No matching FAQs found. Try a different search term.
               </p>
             )}
           </CardContent>
         </Card>
 
         {/* Contact Form */}
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-base font-heading flex items-center gap-2">
               <Send className="h-4 w-4" />
               Send us a Message
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <Textarea
               placeholder="Describe your issue or question..."
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               rows={4}
             />
             <Button 
               className="w-full" 
               onClick={handleSubmitQuery}
               disabled={!message.trim() || isSubmitting}
             >
               {isSubmitting ? "Sending..." : "Send Message"}
             </Button>
           </CardContent>
         </Card>
 
         {/* Additional Resources */}
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-base font-heading">Additional Resources</CardTitle>
           </CardHeader>
           <CardContent className="space-y-2">
             <Button variant="ghost" className="w-full justify-between" size="sm">
               <span>User Guide (PDF)</span>
               <ExternalLink className="h-4 w-4" />
             </Button>
             <Button variant="ghost" className="w-full justify-between" size="sm">
               <span>Video Tutorials</span>
               <ExternalLink className="h-4 w-4" />
             </Button>
             <Button variant="ghost" className="w-full justify-between" size="sm">
               <span>Community Forum</span>
               <ExternalLink className="h-4 w-4" />
             </Button>
           </CardContent>
         </Card>
       </div>
     </AppLayout>
   );
 }