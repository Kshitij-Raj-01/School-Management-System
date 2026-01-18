import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { getLandingPageContent } from "@/lib/landingPageContent";

// Import default images as fallback
import galleryFieldTrip1 from "@/assets/gallery-field-trip-1.jpeg";
import galleryAchievement from "@/assets/gallery-achievement.jpeg";
import galleryStudents1 from "@/assets/gallery-students-1.jpeg";
import galleryFieldTrip2 from "@/assets/gallery-field-trip-2.jpeg";
import galleryStudents2 from "@/assets/gallery-students-2.jpeg";

const defaultImages = [
  galleryFieldTrip1,
  galleryAchievement,
  galleryStudents1,
  galleryFieldTrip2,
  galleryStudents2,
];

const Gallery = () => {
  const content = getLandingPageContent();
  
  // Use content images, fallback to default if src is relative path
  const galleryImages = content.gallery.images.map((img, index) => ({
    ...img,
    src: img.src.startsWith('/') || img.src.startsWith('http') 
      ? img.src 
      : defaultImages[index] || img.src,
  }));
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isVisible, setIsVisible] = useState(false);

  const categories = [
    { name: "All", emoji: "🌟" },
    { name: "Activities", emoji: "🎒" },
    { name: "Awards", emoji: "🏆" },
    { name: "Students", emoji: "😊" },
  ];

  // Simple "Reveal on Scroll" using native browser API (No GSAP needed)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Only trigger once
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

  const filteredImages =
    selectedCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-background via-tertiary/5 to-quaternary/5 relative overflow-hidden pattern-dots"
    >
      {/* Fun decorative elements */}
      <div className="absolute top-20 left-10 text-7xl animate-float opacity-20">📸</div>
      <div className="absolute bottom-20 right-10 text-6xl animate-wiggle opacity-20">🎨</div>
      <div className="absolute top-1/2 left-20 text-5xl animate-bounce-slow opacity-20">🌈</div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div 
          className={`text-center mb-12 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Camera className="w-10 h-10 text-primary animate-wiggle" />
            <span className="text-5xl animate-bounce-slow">📷</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {content.gallery.title}{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              {content.gallery.titleHighlight}
            </span>
            <span className="inline-block ml-2 animate-wiggle">✨</span>
          </h2>
          <p className="text-lg text-foreground/80 font-medium mb-8">
            {content.gallery.description}
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-110 border-2 ${
                  selectedCategory === category.name
                    ? "bg-gradient-hero text-white shadow-glow border-transparent scale-110"
                    : "bg-card hover:bg-muted text-foreground border-border hover:border-primary/30"
                }`}
              >
                <span className="mr-2">{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <div
              key={`${image.title}-${index}`}
              className={`gallery-item group relative overflow-hidden rounded-3xl aspect-[4/3] cursor-pointer shadow-card hover:shadow-glow transition-all duration-700 border-4 border-transparent hover:border-primary/30 transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }} // Stagger effect
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 group-hover:rotate-3"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-4xl">{image.emoji}</span>
                    <span className="inline-block px-4 py-1.5 bg-gradient-hero text-white text-sm font-bold rounded-full shadow-colorful">
                      {image.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {image.title}
                  </h3>
                </div>
              </div>
              
              {/* Decorative corner */}
              <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-wiggle">
                <span className="text-lg">✨</span>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😢</div>
            <p className="text-foreground/70 text-lg font-medium">No images found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;