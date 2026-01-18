import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Heart, Star } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "About Us": ["Our Story 📖", "Faculty 👩‍🏫", "Campus Tour 🏫", "Accreditation ⭐"],
    "Programs": ["Nursery & Pre-K 🍼", "Lower Primary (K-3) 📚", "Upper Primary (4-7) 🎓", "After School Care 🎨"],
    "Resources": ["Parent Portal 👨‍👩‍👧", "School Calendar 📅", "Lunch Menu 🍎", "Supply Lists 📝"],
    "Contact": ["Admissions 📋", "Schedule Tour 🚶", "Enrollment 📝", "Visit Us 📍"],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-primary" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-secondary" },
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-accent" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-tertiary" },
  ];

  return (
    <footer className="bg-gradient-to-br from-foreground/5 via-primary/5 to-secondary/5 border-t-4 border-primary/20 relative overflow-hidden">
      {/* Fun decorative background */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-hero" />
      <div className="absolute top-10 right-20 text-6xl opacity-10 animate-float">🎈</div>
      <div className="absolute bottom-20 left-20 text-5xl opacity-10 animate-wiggle">⭐</div>
      <div className="absolute top-1/2 right-1/3 text-4xl opacity-10 animate-bounce-slow">🌈</div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-colorful transform hover:rotate-12 transition-transform">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Excellence Academy
                </span>
                <span className="text-xs text-foreground/60 font-medium">Primary School 🌈</span>
              </div>
            </div>
            <p className="text-foreground/70 text-sm mb-4 font-medium">
              Empowering young minds through innovative education and holistic development! 🚀✨
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br from-muted to-muted/50 hover:from-primary/20 hover:to-secondary/20 flex items-center justify-center transition-all transform hover:scale-110 hover:rotate-12 shadow-card ${social.color} group`}
                >
                  <social.icon className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2">
                {category}
                {category === "About Us" && <span className="animate-wiggle">📖</span>}
                {category === "Programs" && <span className="animate-bounce-slow">🎓</span>}
                {category === "Resources" && <span className="animate-wiggle">📚</span>}
                {category === "Contact" && <span className="animate-bounce-slow">📧</span>}
              </h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium hover:translate-x-1 inline-block transform duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-border/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-foreground/70 text-sm font-medium flex items-center gap-2">
              © {currentYear} Excellence Academy. Made with <Heart className="w-4 h-4 text-secondary fill-secondary animate-pulse" /> for amazing kids! 
              <Star className="w-4 h-4 text-quaternary fill-quaternary animate-wiggle" />
            </p>
            <div className="flex gap-6 items-center">
              <a
                href="#"
                className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium"
              >
                Privacy Policy 🔒
              </a>
              <a
                href="#"
                className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium"
              >
                Terms of Service 📜
              </a>
            </div>
          </div>
          
          <div className="text-center mt-6 pt-6 border-t-2 border-border/30">
            <p className="text-xs text-foreground/60 font-medium">
              🌟 Building bright futures, one child at a time! 🌟
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
