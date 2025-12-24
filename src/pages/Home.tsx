import { BookOpen, MessageSquare, ArrowRight, Users, Shield, GraduationCap, Award, Globe, TrendingUp, CheckCircle2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface HeroImage {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  order_priority: number;
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeStudents: 0,
    germanStates: 0,
    universities: 0
  });
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t } = useTranslation('home');

  useEffect(() => {
    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const fetchHeroImages = async () => {
    try {
      const { data } = await supabase
        .from("hero_images" as any)
        .select("*")
        .eq("is_active", true)
        .order("order_priority", { ascending: true });

      if (data) {
        setHeroImages(data as unknown as HeroImage[]);
      }
    } catch (error) {
      console.error("Error fetching hero images:", error);
    }
  };



  const features = [
    {
      icon: Users,
      title: "Student Network",
      description: "Connect with fellow Ghanaian students across Germany's universities and cities.",
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/students"
    },
    {
      icon: Shield,
      title: "Support Services",
      description: "Access financial assistance, academic support, and emergency help when you need it most.",
      color: "text-accent",
      bgColor: "bg-accent/10",
      link: "/assistance"
    },
    {
      icon: BookOpen,
      title: "Latest Updates",
      description: "Stay informed with announcements, opportunities, and important news from NUGSA-Germany.",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      link: "/announcements"
    },
    {
      icon: GraduationCap,
      title: "Academic Excellence",
      description: "Resources, mentorship, and programs designed to support your academic journey in Germany.",
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/support"
    }
  ];

  const benefits = [
    "Verified student community across Germany",
    "24/7 support and assistance programs",
    "Academic and professional development resources",
    "Cultural events and networking opportunities",
    "Emergency financial support when needed"
  ];



  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden">
        {/* Background Images */}
        {heroImages.length > 0 ? (
          heroImages.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              style={{ backgroundImage: `url(${image.image_url})` }}
            />
          ))
        ) : (
          <div className="absolute inset-0 hero-background bg-cover bg-center" />
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10"></div>

        <div className="relative z-20 section-container section-padding">
          <div className="max-w-4xl mx-auto text-center fade-in">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Official Student Association</span>
            </div>

            <h1 className="heading-1 text-white mb-6 leading-tight">
              {t('hero.welcome')}
            </h1>

            <p className="body-large text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 text-base font-semibold px-8 py-6 shadow-lg">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 text-base font-semibold px-8 py-6 shadow-lg">
                    <Link to="/auth">
                      {t('hero.joinCommunity')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 text-base font-semibold px-8 py-6 shadow-lg">
                    <Link to="/about">{t('hero.learnMore')}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-16 slide-up">
            <h2 className="heading-2 mb-4">{t('features.title')}</h2>
            <p className="body-large max-w-2xl mx-auto">
              Comprehensive resources and support designed specifically for Ghanaian students in Germany
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link} className="group">
                <Card className="professional-card-elevated h-full hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className={`w-14 h-14 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <div className="mt-4 flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Learn more</span>
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="slide-up">
              <h2 className="heading-2 mb-6">{t('cta.title')}</h2>
              <p className="body-large mb-8 text-muted-foreground">
                {t('cta.description')}
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild size="lg" className="btn-primary">
                  <Link to={user ? "/dashboard" : "/auth"}>
                    {user ? "Explore Dashboard" : "Get Started Today"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="professional-card-elevated p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Nationwide Network</h3>
                      <p className="text-sm text-muted-foreground">Connect with students across all German states</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Career Development</h3>
                      <p className="text-sm text-muted-foreground">Access job opportunities and professional mentorship</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Recognition Programs</h3>
                      <p className="text-sm text-muted-foreground">Celebrate achievements and academic excellence</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="section-padding bg-white border-y border-gray-100">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Partners & Supporters</h2>
            <p className="body-large text-muted-foreground max-w-2xl mx-auto">
              Working together with esteemed organizations to support Ghanaian students in Germany
            </p>
          </div>

          {/* Infinite Scrolling Logos */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll">
              {/* First set of logos */}
              <div className="flex items-center justify-around min-w-full shrink-0 gap-16 px-8">
                <img
                  src="/partners/ghana_embassy_logo_1765457041265.png"
                  alt="Ghana Embassy in Germany"
                  className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                />
                <img
                  src="/partners/daad_logo_1765457056937.png"
                  alt="DAAD - German Academic Exchange Service"
                  className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                />
                <img
                  src="/partners/german_universities_logo_1765457071392.png"
                  alt="German Universities"
                  className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                />
                <img
                  src="/partners/african_union_logo_1765457088679.png"
                  alt="African Student Organizations"
                  className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                />
                <img
                  src="/partners/community_partners_logo_1765457105779.png"
                  alt="Community Partners"
                  className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                />
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="flex items-center justify-around min-w-full shrink-0 gap-16 px-8">
                <img
                  src="/partners/ghana_embassy_logo_1765457041265.png"
                  alt="Ghana Embassy in Germany"
                  className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                />
                <img
                  src="/partners/daad_logo_1765457056937.png"
                  alt="DAAD - German Academic Exchange Service"
                  className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                />
                <img
                  src="/partners/german_universities_logo_1765457071392.png"
                  alt="German Universities"
                  className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                />
                <img
                  src="/partners/african_union_logo_1765457088679.png"
                  alt="African Student Organizations"
                  className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                />
                <img
                  src="/partners/community_partners_logo_1765457105779.png"
                  alt="Community Partners"
                  className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                />
              </div>
            </div>
          </div>

          {/* Partnership CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Interested in partnering with NUGSA-Germany?
            </p>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">
                Get in Touch
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary text-white">
        <div className="section-container text-center">
          <h2 className="heading-2 text-white mb-4">Ready to Begin Your Journey?</h2>
          <p className="body-large text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of Ghanaian students who are building their future in Germany.
            Your success is our mission.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-base font-semibold px-8 py-6">
            <Link to={user ? "/dashboard" : "/auth"}>
              {user ? "Go to Dashboard" : "Create Your Account"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
