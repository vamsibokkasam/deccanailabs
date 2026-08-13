import Reveal from "./Reveal";
import { TEAM_MEMBERS } from "./LeadershipTeam";

function Team() {
  return (
    <section className="about-team theme-section">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12 md:mb-14">
          <p className="theme-label mb-4">OUR TEAM</p>
          <h2 className="theme-heading">Meet Our Team</h2>
          <div className="about-team-rule mx-auto mt-6" aria-hidden="true" />
          <p className="mt-6 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            The people guiding DECCAN AI LABS — from vision and technology to
            growth and culture.
          </p>
        </Reveal>

        <Reveal className="about-team-grid" delay={80}>
          {TEAM_MEMBERS.map((member, index) => (
            <article
              key={member.name}
              className="home-reveal-item about-team-member group"
              style={{ "--i": index }}
            >
              <div className="about-team-photo">
                <div className="about-team-photo-glow" aria-hidden="true" />
                <div className="about-team-photo-ring">
                  <img
                    src={member.imageSrc}
                    alt={`${member.name} — ${member.title}`}
                    style={{ objectPosition: member.imagePosition }}
                  />
                </div>
              </div>

              <h3 className="about-team-name">{member.name}</h3>
              <p className="about-team-role">{member.title}</p>
              <p className="about-team-bio">{member.bio}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default Team;
