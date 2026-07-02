import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import JourneySection from "@/components/journey/JourneySection";
import ProjectsSection from "@/components/projects/ProjectsSection";
import AltitudeSection from "@/components/altitude/AltitudeSection";
import ContactSection from "@/components/ContactSection";
import VersionBadge from "@/components/VersionBadge";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <JourneySection />
        <ProjectsSection />
        <AltitudeSection />
        <ContactSection />
      </main>
      <VersionBadge />
    </>
  );
}
