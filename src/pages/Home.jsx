import Hero from "../components/Hero";
import ImpactStats from "../components/ImpactStats";
import About from "../components/About";
import FocusAreas from "../components/FocusAreas";
import Framework from "../components/Framework";
import InternshipPrograms from "../components/InternshipPrograms";
import WhyChooseUs from "../components/WhyChooseUs";
import Reviews from "../components/Reviews";
import VisionMission from "../components/VisionMission";
import Contact from "../components/Contact";

function Home() {
  return (
    <>
      <Hero />
      <About />
      <FocusAreas />
      <Framework />
      <InternshipPrograms />
      <WhyChooseUs />
      <Reviews />
      <ImpactStats />
      <VisionMission />
      <Contact />
    </>
  );
}

export default Home;