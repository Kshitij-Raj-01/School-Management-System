import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Sphere, Box, Torus } from "@react-three/drei";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import schoolBuilding from "@/assets/school-building.png";
import { getLandingPageContent } from "@/lib/landingPageContent";

const FloatingShapes = () => {
  return (
    <>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Box args={[1, 1, 1]} position={[-2, 0, 0]}>
          <meshStandardMaterial color="#A855F7" />
        </Box>
      </Float>
      
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
        <Sphere args={[0.6, 32, 32]} position={[2, 1, -1]}>
          <meshStandardMaterial color="#EC4899" />
        </Sphere>
      </Float>
      
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={2.5}>
        <Torus args={[0.5, 0.2, 16, 100]} position={[0, -1, -2]}>
          <meshStandardMaterial color="#14B8A6" />
        </Torus>
      </Float>
      
      <Float speed={2.2} rotationIntensity={1.2} floatIntensity={2}>
        <Box args={[0.7, 0.7, 0.7]} position={[3, -0.5, 0]} rotation={[0.5, 0.5, 0]}>
          <meshStandardMaterial color="#F59E0B" />
        </Box>
      </Float>

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <pointLight position={[-10, -10, -5]} intensity={0.8} color="#EC4899" />
      <pointLight position={[10, 5, 5]} intensity={0.6} color="#14B8A6" />
    </>
  );
};

const Hero3D = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const content = getLandingPageContent();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
      
      gsap.from(".hero-subtitle", {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });
      
      gsap.from(".hero-buttons", {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.6,
        ease: "power3.out",
      });

      if (imageRef.current) {
        gsap.from(imageRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 1.2,
          delay: 0.4,
          ease: "power3.out",
        });
      }
    }, contentRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted to-primary/10 pt-20 pattern-dots">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <FloatingShapes />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
        </Canvas>
      </div>
      
      {/* Fun decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-pulse-color" />
      <div className="absolute top-40 right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse-color" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-tertiary/20 rounded-full blur-2xl animate-pulse-color" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-quaternary/20 rounded-full blur-3xl animate-pulse-color" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 z-10" ref={contentRef}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-full border-2 border-primary/30 animate-scale-in shadow-colorful">
              <Sparkles className="w-5 h-5 text-primary animate-wiggle" />
              <span className="text-sm font-semibold text-primary">
                {content.home.badge}
              </span>
            </div>

            <h1 className="hero-title text-5xl md:text-7xl font-bold leading-tight">
              {content.home.title}{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                {content.home.titleHighlight}
              </span>
              <span className="inline-block ml-3 animate-wiggle">✨</span>
            </h1>

            <p className="hero-subtitle text-xl text-foreground/80 leading-relaxed font-medium">
              {content.home.subtitle}
            </p>

            <div className="hero-buttons flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => scrollToSection("#contact")}
                className="bg-gradient-hero hover:shadow-glow transition-all duration-300 text-lg px-8 font-bold transform hover:scale-105 hover:-rotate-1 shadow-colorful"
              >
                {content.home.applyButtonText}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("#about")}
                className="text-lg px-8 border-3 border-primary hover:bg-primary/10 font-bold transform hover:scale-105 hover:rotate-1"
              >
                {content.home.learnMoreButtonText}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center group">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform">{content.home.stats.students.value}</div>
                <div className="text-sm text-foreground/70 font-medium">{content.home.stats.students.label}</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold bg-gradient-to-r from-secondary to-tertiary bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform">{content.home.stats.ratio.value}</div>
                <div className="text-sm text-foreground/70 font-medium">{content.home.stats.ratio.label}</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold bg-gradient-to-r from-tertiary to-accent bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform">{content.home.stats.years.value}</div>
                <div className="text-sm text-foreground/70 font-medium">{content.home.stats.years.label}</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div ref={imageRef} className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-glow border-4 border-gradient-hero transform hover:rotate-2 transition-transform duration-500">
              <img
                src={schoolBuilding}
                alt="R.N.T. Public School Campus"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-br from-primary to-secondary rounded-3xl blur-2xl animate-float opacity-60 rotate-12" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-gradient-to-br from-tertiary to-quaternary rounded-full blur-2xl animate-float opacity-60" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 -right-4 text-6xl animate-bounce-slow">🎨</div>
            <div className="absolute bottom-1/4 -left-4 text-5xl animate-bounce-slow" style={{ animationDelay: "0.5s" }}>📚</div>
            <div className="absolute top-1/4 -right-6 text-4xl animate-wiggle">⭐</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero3D;
