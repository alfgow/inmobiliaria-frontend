import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";

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
