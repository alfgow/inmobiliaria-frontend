import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-dark)]">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedProperties />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
