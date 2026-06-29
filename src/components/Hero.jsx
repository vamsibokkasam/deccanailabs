import { Link } from "react-router-dom";
import heroImage from "../assets/hero-image.png";

function Hero() {
  return (
    <section className="min-h-screen hero-bg text-fg flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div>
            <p className="theme-label mb-4 tracking-wider">
              DECCAN AI labs
            </p>

            <h1 className="text-5xl md:text-7xl font-medium leading-[1.15] tracking-tight">
              Building The Future With
              <span className="block text-accent">
                Artificial Intelligence
              </span>
            </h1>

            <p className="mt-6 text-[17px] leading-relaxed text-muted max-w-xl">
              Empowering students and professionals through
              AI innovation, internships, research opportunities,
              and real-world industry projects.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/internships" className="theme-btn-primary">
                Explore Internships
              </Link>
              <Link to="/contact" className="theme-btn-outline">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <img
              src={heroImage}
              alt="AI Innovation"
              className="w-full max-w-lg mx-auto drop-shadow-2xl"
            />
          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;
