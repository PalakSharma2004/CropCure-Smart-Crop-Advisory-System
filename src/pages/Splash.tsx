import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        // Check if user has completed onboarding
        const hasOnboarded = localStorage.getItem("cropcare_onboarded");
        navigate(hasOnboarded ? "/dashboard" : "/onboarding");
      }, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center bg-primary transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6">
          <Leaf className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-white mb-2">
          CropCare
        </h1>
        <p className="text-white/80 text-sm">
          Smart Farming Assistant
        </p>
        <p className="text-white/60 text-xs mt-1">
          स्मार्ट खेती सहायक
        </p>
      </div>

      <div className="absolute bottom-10">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}
