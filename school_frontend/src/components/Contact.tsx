import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { getLandingPageContent } from "@/lib/landingPageContent";

const Contact = () => {
  const content = getLandingPageContent();
  
  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      details: content.contact.phone,
      color: "text-primary",
      bgColor: "bg-gradient-to-br from-primary/20 to-primary/10",
      emoji: "📞",
    },
    {
      icon: Mail,
      title: "Email Us",
      details: content.contact.email,
      color: "text-secondary",
      bgColor: "bg-gradient-to-br from-secondary/20 to-secondary/10",
      emoji: "📧",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: content.contact.address,
      color: "text-tertiary",
      bgColor: "bg-gradient-to-br from-tertiary/20 to-tertiary/10",
      emoji: "📍",
    },
  ];
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! 🎉", {
      description: "We'll get back to you soon! 📧✨",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-muted/50 via-quaternary/10 to-background relative overflow-hidden pattern-grid"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse-color" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-tertiary/10 to-accent/10 rounded-full blur-3xl animate-pulse-color" style={{ animationDelay: "1.5s" }} />
      
      {/* Fun decorative emojis */}
      <div className="absolute top-20 right-20 text-7xl animate-float opacity-20">✉️</div>
      <div className="absolute bottom-32 left-20 text-6xl animate-wiggle opacity-20">💌</div>
      <div className="absolute top-1/2 right-1/3 text-5xl animate-bounce-slow opacity-20">📬</div>

      <div className="container mx-auto px-4 relative z-10">
        <div 
          className={`text-center mb-16 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <MessageCircle className="w-10 h-10 text-primary animate-wiggle" />
            <span className="text-5xl animate-bounce-slow">💬</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {content.contact.title}{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              {content.contact.titleHighlight}
            </span>
            <span className="inline-block ml-2 animate-wiggle">🤝</span>
          </h2>
          <p className="text-lg text-foreground/80 font-medium max-w-2xl mx-auto">
            {content.contact.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {contactInfo.map((info, index) => (
            <Card
              key={index}
              className={`contact-card p-6 text-center hover:shadow-colorful transition-all duration-700 hover:-translate-y-3 hover:rotate-2 bg-card border-3 border-border/50 hover:border-primary/30 group relative overflow-hidden transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="absolute top-0 right-0 text-7xl opacity-10 group-hover:opacity-20 transition-opacity">
                {info.emoji}
              </div>
              <div
                className={`${info.bgColor} w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg relative`}
              >
                <info.icon className={`w-9 h-9 ${info.color}`} />
                <span className="absolute -top-2 -right-2 text-3xl">{info.emoji}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                {info.title}
              </h3>
              <p className="text-foreground/70 font-medium">{info.details}</p>
            </Card>
          ))}
        </div>

        <Card 
          className={`contact-card max-w-3xl mx-auto p-8 md:p-12 bg-card border-4 border-primary/20 shadow-glow relative overflow-hidden transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-hero" />
          <div className="absolute -top-8 -right-8 text-8xl opacity-10 animate-wiggle">📝</div>
          <div className="absolute -bottom-8 -left-8 text-8xl opacity-10 animate-float">✉️</div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {content.contact.formTitle}
              </h3>
              <p className="text-foreground/70">{content.contact.formDescription}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-foreground flex items-center gap-2">
                    👤 Your Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Rahul Kumar"
                    required
                    className="border-2 border-border focus:ring-primary focus:border-primary rounded-xl h-12 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-foreground flex items-center gap-2">
                    📧 Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="youremail@example.com"
                    required
                    className="border-2 border-border focus:ring-primary focus:border-primary rounded-xl h-12 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-bold text-foreground flex items-center gap-2">
                  📌 Subject *
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Inquiry about admission"
                  required
                  className="border-2 border-border focus:ring-primary focus:border-primary rounded-xl h-12 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-foreground flex items-center gap-2">
                  💬 Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry... 😊"
                  rows={6}
                  required
                  className="border-2 border-border focus:ring-primary focus:border-primary rounded-xl resize-none font-medium"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 text-lg font-bold transform hover:scale-105 hover:-rotate-1 shadow-colorful h-14"
              >
                Send Message 🚀
                <Send className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Contact;