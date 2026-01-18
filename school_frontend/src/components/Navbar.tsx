import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/school-logo.png";
import { useSelector } from "react-redux"; 
import { RootState } from "@/store"; 
import { User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation(); // Get current route

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home", emoji: "🏠" },
    { name: "About", href: "#about", emoji: "📖" },
    { name: "Gallery", href: "#gallery", emoji: "🖼️" },
    { name: "Contact", href: "#contact", emoji: "📧" },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    
    // Logic: If we are NOT on the home page ('/'), go there first
    if (location.pathname !== "/") {
      navigate("/");
      // Optional: We can't easily scroll immediately after navigating without complex logic,
      // so for now we just take them to the Home Page.
      return;
    }

    // If we ARE on the home page, scroll to the section
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-lg shadow-colorful border-b-4 border-primary/20"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#home");
            }}
            className="flex items-center gap-3 group"
          >
            <img 
              src={logo} 
              alt="R.N.T. Public School" 
              className="h-14 w-14 object-contain transform group-hover:scale-110 transition-all" 
            />
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                R.N.T. Public School
              </span>
              <span className="text-xs text-foreground/60 font-medium">Nursery to 7th Grade 🌈</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-foreground/80 hover:text-primary font-semibold transition-all relative group px-2 py-1 hover:scale-110 cursor-pointer"
              >
                <span className="mr-1">{link.emoji}</span>
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-hero rounded-full group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            {userInfo ? (
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              className="flex gap-2"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Button>
          ) : (
            <Button 
              variant="default" 
              className="bg-gradient-hero w-full font-bold shadow-colorful"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-primary/10 transition-colors border-2 border-primary/20"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-lg border-b-4 border-primary/20 shadow-colorful animate-fade-in-up">
            <div className="flex flex-col p-4 gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="text-foreground/80 hover:text-primary font-semibold py-3 px-4 transition-all hover:bg-primary/5 rounded-xl border-2 border-transparent hover:border-primary/20 cursor-pointer"
                >
                  <span className="mr-2">{link.emoji}</span>
                  {link.name}
                </a>
              ))}
              {userInfo ? (
            <Button 
              variant="outline" 
              onClick={() => {
                navigate("/dashboard");
                setIsOpen(false);
              }}
              className="flex gap-2"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Button>
          ) : (
            <Button 
              variant="default" 
              className="bg-gradient-hero w-full font-bold shadow-colorful"
              onClick={() => {
                navigate("/login");
                setIsOpen(false);
              }}
            >
              Login
            </Button>
          )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;