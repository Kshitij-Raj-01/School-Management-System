import { useEffect, useRef, useState } from "react";
import { BookOpen, Users, Award, Target, Heart, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getLandingPageContent } from "@/lib/landingPageContent";

const iconMap: Record<string, any> = {
  "📚": BookOpen,
  "👩‍🏫": Users,
  "🏆": Award,
  "🎯": Target,
  "🎨": Palette,
  "💖": Heart,
};

const About = () => {
  const content = getLandingPageContent();
  
  const features = content.about.features.map((feature, index) => {
    const icons = [BookOpen, Users, Award, Target, Palette, Heart];
    const colors = ["text-primary", "text-secondary", "text-tertiary", "text-accent", "text-quaternary", "text-secondary"];
    const bgColors = [
      "bg-gradient-to-br from-primary/20 to-primary/10",
      "bg-gradient-to-br from-secondary/20 to-secondary/10",
      "bg-gradient-to-br from-tertiary/20 to-tertiary/10",
      "bg-gradient-to-br from-accent/20 to-accent/10",
      "bg-gradient-to-br from-quaternary/20 to-quaternary/10",
      "bg-gradient-to-br from-secondary/20 to-primary/10",
    ];
    return {
      icon: iconMap[feature.emoji] || icons[index % icons.length],
      title: feature.title,
      description: feature.description,
      color: colors[index % colors.length],
      bgColor: bgColors[index % bgColors.length],
      emoji: feature.emoji,
    };
  });
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Trigger animation only once
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-muted/50 via-background to-primary/5 relative overflow-hidden pattern-grid"
    >
      {/* Background Elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse-color" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-gradient-to-br from-tertiary/10 to-quaternary/10 rounded-full blur-3xl animate-pulse-color" style={{ animationDelay: "1.5s" }} />
      
      {/* Fun floating emojis */}
      <div className="absolute top-32 right-20 text-6xl animate-float opacity-40">🎈</div>
      <div className="absolute bottom-40 left-20 text-5xl animate-float opacity-40" style={{ animationDelay: "1s" }}>🌟</div>
      <div className="absolute top-1/2 right-1/4 text-4xl animate-wiggle opacity-40">🚀</div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 
            className={`text-4xl md:text-6xl font-bold mb-6 transition-all duration-1000 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {content.about.title}{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              {content.about.titleHighlight}
            </span>
            <span className="inline-block ml-2 animate-wiggle">🏫</span>
          </h2>
          <p 
            className={`text-lg text-foreground/80 leading-relaxed font-medium transition-all duration-1000 delay-200 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {content.about.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`feature-card p-6 hover:shadow-colorful transition-all duration-700 hover:-translate-y-3 hover:rotate-2 bg-card border-2 border-border/50 hover:border-primary/30 group relative overflow-hidden transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="absolute top-0 right-0 text-6xl opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 transform duration-300">
                {feature.emoji}
              </div>
              <div
                className={`${feature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg relative`}
              >
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
                <span className="absolute -top-2 -right-2 text-2xl">{feature.emoji}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="max-w-4xl mx-auto">
          <Card 
            className={`p-8 md:p-12 bg-gradient-to-br from-primary/10 via-secondary/10 to-tertiary/10 border-4 border-primary/30 shadow-glow relative overflow-hidden transition-all duration-1000 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-hero" />
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-hero" />
            <div className="text-center space-y-6 relative z-10">
              <div className="text-6xl mb-4 animate-bounce-slow">🌟</div>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {content.about.missionTitle}
              </h3>
              <p className="text-lg text-foreground/80 leading-relaxed font-medium">
                {content.about.missionText}
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <span className="text-4xl animate-wiggle">🎓</span>
                <span className="text-4xl animate-wiggle" style={{ animationDelay: "0.3s" }}>💡</span>
                <span className="text-4xl animate-wiggle" style={{ animationDelay: "0.6s" }}>❤️</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default About;