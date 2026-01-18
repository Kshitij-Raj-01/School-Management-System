import Navbar from "@/components/Navbar";
import Hero3D from "@/components/Hero3D";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero3D />
      <About />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
