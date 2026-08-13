import Hero from "../components/Hero";
import ImpactStats from "../components/ImpactStats";
import About from "../components/About";
import FocusAreas from "../components/FocusAreas";
import Framework from "../components/Framework";
import InternshipPrograms from "../components/InternshipPrograms";
import WhyChooseUs from "../components/WhyChooseUs";
import Certifications from "../components/Certifications";
import Reviews from "../components/Reviews";
import VisionMission from "../components/VisionMission";
import Team from "../components/Team";

function Home() {
  return (
    <>
      <Hero />
      <About />
      <VisionMission />
      <Certifications />
      <FocusAreas />
      <Framework />
      <InternshipPrograms />
      <WhyChooseUs />
      <Reviews />
      <ImpactStats />
      <Team />
    </>
  );
}

export default Home;
