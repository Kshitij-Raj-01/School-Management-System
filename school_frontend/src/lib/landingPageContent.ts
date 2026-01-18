// Landing Page Content Management - localStorage based

export interface LandingPageContent {
  home: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    applyButtonText: string;
    learnMoreButtonText: string;
    stats: {
      students: { value: string; label: string };
      ratio: { value: string; label: string };
      years: { value: string; label: string };
    };
  };
  about: {
    title: string;
    titleHighlight: string;
    description: string;
    missionTitle: string;
    missionText: string;
    features: Array<{
      title: string;
      description: string;
      emoji: string;
    }>;
  };
  gallery: {
    title: string;
    titleHighlight: string;
    description: string;
    images: Array<{
      src: string;
      title: string;
      category: string;
      emoji: string;
    }>;
  };
  contact: {
    title: string;
    titleHighlight: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    formTitle: string;
    formDescription: string;
  };
}

const DEFAULT_CONTENT: LandingPageContent = {
  home: {
    badge: "🎨 Nursery to 7th Grade Excellence",
    title: "Where Young Minds",
    titleHighlight: "Grow & Thrive",
    subtitle: "A nurturing primary school environment where children from Nursery to 7th grade develop strong foundations in academics, character, and creativity through engaging, age-appropriate learning experiences! 🌈",
    applyButtonText: "Apply Now 🚀",
    learnMoreButtonText: "Learn More 📚",
    stats: {
      students: { value: "400+", label: "Happy Students 🎓" },
      ratio: { value: "30:1", label: "Student-Teacher 👥" },
      years: { value: "10+", label: "Years of Fun 🎉" },
    },
  },
  about: {
    title: "About Our",
    titleHighlight: "Primary School",
    description: "For over 25 years, we've been nurturing young minds from Nursery to 7th grade! Our primary school creates a safe, joyful environment where children build strong academic foundations while developing confidence, creativity, and essential life skills through play-based and experiential learning. 🌈✨",
    missionTitle: "Our Mission",
    missionText: "To nurture curious, confident, and kind young learners by providing an engaging primary education that sparks imagination, builds strong foundations, and instills values that will guide them throughout their educational journey and beyond! 🚀💫",
    features: [
      {
        title: "Age-Appropriate Learning",
        description: "Engaging curriculum designed for young learners from Nursery through 7th grade.",
        emoji: "📚",
      },
      {
        title: "Caring Teachers",
        description: "Dedicated educators who understand child development and create nurturing environments.",
        emoji: "👩‍🏫",
      },
      {
        title: "Holistic Development",
        description: "Focus on academics, arts, sports, and social-emotional learning.",
        emoji: "🏆",
      },
      {
        title: "Small Class Sizes",
        description: "Individual attention with a 15:1 student-teacher ratio for personalized learning.",
        emoji: "🎯",
      },
      {
        title: "Creative Programs",
        description: "Art, music, drama, and hands-on activities that spark imagination and creativity.",
        emoji: "🎨",
      },
      {
        title: "Safe Environment",
        description: "Warm, secure campus where children feel loved, valued, and excited to learn.",
        emoji: "💖",
      },
    ],
  },
  gallery: {
    title: "Campus",
    titleHighlight: "Gallery",
    description: "Explore our colorful facilities and vibrant campus life! 🏫🎉",
    images: [
      { src: "/gallery-field-trip-1.jpeg", title: "Educational Trip", category: "Activities", emoji: "🎒" },
      { src: "/gallery-achievement.jpeg", title: "Student Achievement", category: "Awards", emoji: "🏆" },
      { src: "/gallery-students-1.jpeg", title: "Happy Students", category: "Activities", emoji: "😊" },
      { src: "/gallery-field-trip-2.jpeg", title: "Outdoor Learning", category: "Activities", emoji: "🌳" },
      { src: "/gallery-students-2.jpeg", title: "Our Bright Stars", category: "Students", emoji: "⭐" },
    ],
  },
  contact: {
    title: "Get in",
    titleHighlight: "Touch",
    description: "Interested in enrolling your child? We'd love to show you around our school and answer any questions about our Nursery to 7th grade programs! 🏫✨",
    phone: "+917654637472",
    email: "rntpublics@gmail.com",
    address: "123 Education Street, Learning City",
    formTitle: "Send Us a Message 💌",
    formDescription: "We typically respond within 24 hours! ⏰",
  },
};

const STORAGE_KEY = "landingPageContent";

export const getLandingPageContent = (): LandingPageContent => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading landing page content:", error);
  }
  // Initialize with default content
  saveLandingPageContent(DEFAULT_CONTENT);
  return DEFAULT_CONTENT;
};

export const saveLandingPageContent = (content: LandingPageContent): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch (error) {
    console.error("Error saving landing page content:", error);
  }
};

export const resetLandingPageContent = (): void => {
  saveLandingPageContent(DEFAULT_CONTENT);
};
