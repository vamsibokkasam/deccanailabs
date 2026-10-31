import { useRef } from "react";
import Hero from "../components/Hero";
import TrustStrip from "../components/TrustStrip";
import FocusAreas from "../components/FocusAreas";
import Framework from "../components/Framework";
import InternshipPrograms from "../components/InternshipPrograms";
import WhyChooseUs from "../components/WhyChooseUs";
import Reviews from "../components/Reviews";
import ImpactStats from "../components/ImpactStats";
import Team from "../components/Team";
import { useHomeCinematic } from "../hooks/useHomeCinematic";

function Home() {
  const rootRef = useRef(null);
  useHomeCinematic(rootRef);

  return (
    <div ref={rootRef} className="cine-home">
      <Hero />
      <TrustStrip />
      <InternshipPrograms />
      <Framework />
      <FocusAreas />
      <WhyChooseUs />
      <Reviews />
      <ImpactStats />
      <Team />
    </div>
  );
}

export default Home;
