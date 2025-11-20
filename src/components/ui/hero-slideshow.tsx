import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroImage {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
}

interface HeroSlideshowProps {
  children: React.ReactNode;
  className?: string;
}

export function HeroSlideshow({ children, className = "" }: HeroSlideshowProps) {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  const fetchHeroImages = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_images" as any)
        .select("*")
        .eq("is_active", true)
        .order("order_priority", { ascending: true });

      if (error) throw error;
      setHeroImages((data as any) || []);
    } catch (error) {
      console.error("Error fetching hero images:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <section className={`bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white ${className}`}>
        {children}
      </section>
    );
  }

  // Fallback to gradient if no images
  if (heroImages.length === 0) {
    return (
      <section className={`bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white ${className}`}>
        {children}
      </section>
    );
  }

  const currentImage = heroImages[currentImageIndex];

  return (
    <section className={`relative overflow-hidden text-white ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentImage.image_url}
          alt={currentImage.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Navigation Controls */}
      {heroImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex space-x-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentImageIndex 
                      ? "bg-white" 
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}