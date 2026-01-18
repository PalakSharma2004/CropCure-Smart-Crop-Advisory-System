import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Eye, EyeOff, Globe, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  location: z.string().optional(),
  cropTypes: z.array(z.string()).default([]),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const states = [
  { value: "andhraPradesh", label: "Andhra Pradesh" },
  { value: "bihar", label: "Bihar" },
  { value: "gujarat", label: "Gujarat" },
  { value: "haryana", label: "Haryana" },
  { value: "karnataka", label: "Karnataka" },
  { value: "madhyaPradesh", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "tamilNadu", label: "Tamil Nadu" },
  { value: "uttarPradesh", label: "Uttar Pradesh" },
  { value: "westBengal", label: "West Bengal" },
];

const cropTypes = [
  { value: "wheat", labelKey: "wheat" },
  { value: "rice", labelKey: "rice" },
  { value: "cotton", labelKey: "cotton" },
  { value: "sugarcane", labelKey: "sugarcane" },
  { value: "maize", labelKey: "maize" },
  { value: "potato", labelKey: "potato" },
  { value: "tomato", labelKey: "tomato" },
  { value: "onion", labelKey: "onion" },
  { value: "soybean", labelKey: "soybean" },
  { value: "groundnut", labelKey: "groundnut" },
];

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, currentLanguage, toggleLanguage } = useLanguage();
  const { signIn, signUp, signInWithGoogle, user, loading } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      location: "",
      cropTypes: [],
      termsAccepted: undefined,
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      let errorMessage = "Failed to sign in. Please try again.";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email address before signing in.";
      }

      toast({
        title: "Sign In Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Welcome back!",
      description: "You have successfully signed in.",
    });
    navigate("/dashboard");
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, {
      full_name: data.fullName,
      phone: data.phone,
      location: data.location,
      crops: data.cropTypes,
    });
    setIsLoading(false);

    if (error) {
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.message.includes("User already registered")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message.includes("Password")) {
        errorMessage = "Password is too weak. Please use a stronger password.";
      }

      toast({
        title: "Sign Up Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account Created!",
      description: "Welcome to CropGuard. Your account has been created successfully.",
    });
    navigate("/dashboard");
  };

  const handleGuestAccess = () => {
    navigate("/dashboard");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);

    if (error) {
      toast({
        title: "Google Sign In Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleCrop = (cropValue: string) => {
    const current = signupForm.getValues("cropTypes");
    const updated = current.includes(cropValue)
      ? current.filter((c) => c !== cropValue)
      : [...current, cropValue];
    setSelectedCrops(updated);
    signupForm.setValue("cropTypes", updated, { shouldValidate: true });
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
      {/* Language toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="text-muted-foreground gap-2"
        >
          <Globe className="h-4 w-4" />
          {currentLanguage === 'en' ? 'हिंदी' : 'EN'}
        </Button>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-primary">{t("common.appName")}</h1>
        <p className="text-sm text-muted-foreground">{t("common.tagline")}</p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="font-heading">{t("auth.welcome")}</CardTitle>
          <CardDescription>{t("auth.signInAccess")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 mt-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.password")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder={t("auth.passwordPlaceholder")}
                              autoComplete="current-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-right">
                    <Button variant="link" className="p-0 h-auto text-sm text-primary">
                      {t("auth.forgotPassword")}
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("auth.signingIn")}
                      </>
                    ) : (
                      t("auth.signIn")
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4 mt-4">
                  <FormField
                    control={signupForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.fullName")}</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("auth.namePlaceholder")}
                            autoComplete="name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.phoneNumber")} (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder={t("auth.phonePlaceholder")}
                            autoComplete="tel"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.password")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder={t("auth.createPassword")}
                              autoComplete="new-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.location")} (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("auth.locationPlaceholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {t(`states.${state.value}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="cropTypes"
                    render={() => (
                      <FormItem>
                        <FormLabel>{t("auth.cropTypes")} (Optional)</FormLabel>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {cropTypes.map((crop) => (
                            <button
                              key={crop.value}
                              type="button"
                              onClick={() => toggleCrop(crop.value)}
                              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                selectedCrops.includes(crop.value)
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background border-muted-foreground/30 hover:border-primary"
                              }`}
                            >
                              {t(`crops.${crop.labelKey}`)}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {t("auth.termsAgree")}
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("auth.creatingAccount")}
                      </>
                    ) : (
                      t("auth.createAccount")
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t("auth.orContinueWith")}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("auth.signInWithGoogle")}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Button variant="link" onClick={handleGuestAccess} className="text-muted-foreground">
              {t("auth.continueAsGuest")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
