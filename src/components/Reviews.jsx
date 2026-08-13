import { Quote, Star } from "lucide-react";
import Reveal from "./Reveal";

const reviews = [
  {
    name: "Ananya R.",
    program: "Python Development",
    text: "The mentorship and real-time projects helped me build confidence and practical skills I could showcase in interviews.",
    rating: 5,
  },
  {
    name: "Rahul K.",
    program: "Web Development",
    text: "Hands-on learning with friendly mentors made complex concepts easy to understand. Highly recommend DECCAN AI LABS.",
    rating: 5,
  },
  {
    name: "Priya S.",
    program: "AI & Machine Learning",
    text: "Great exposure to real-world AI use cases. The internship structure kept me motivated throughout the program.",
    rating: 5,
  },
  {
    name: "Arjun M.",
    program: "Java Development",
    text: "From basics to project work, everything was well organized. I gained industry-relevant experience in 45 days.",
    rating: 5,
  },
  {
    name: "Sneha T.",
    program: "Data Science",
    text: "Practical datasets and guided assignments helped me understand data analysis much better than classroom learning alone.",
    rating: 5,
  },
  {
    name: "Vikram P.",
    program: "Cyber Security",
    text: "Clear guidance, structured modules, and supportive mentors. A valuable step toward my cybersecurity career.",
    rating: 5,
  },
];

function initialsFromName(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StarRating({ rating }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={15}
          strokeWidth={1.75}
          className={
            index < rating ? "text-accent fill-accent" : "text-subtle"
          }
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="review-card group theme-card relative shrink-0 w-[300px] sm:w-[340px] md:w-[380px] overflow-hidden p-6 md:p-7 flex flex-col">
      <div className="review-card-glow" aria-hidden="true" />

      <div className="relative flex items-start justify-between gap-3">
        <StarRating rating={review.rating} />
        <Quote
          size={22}
          strokeWidth={1.5}
          className="text-accent/35 group-hover:text-accent/70 transition-colors duration-300 shrink-0"
          aria-hidden="true"
        />
      </div>

      <p className="relative mt-5 text-muted leading-relaxed flex-1 text-[0.95rem] md:text-base">
        &ldquo;{review.text}&rdquo;
      </p>

      <div className="relative mt-6 pt-5 border-t border-border flex items-center gap-3">
        <div className="review-avatar" aria-hidden="true">
          {initialsFromName(review.name)}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-fg truncate">{review.name}</p>
          <p className="text-sm text-accent mt-0.5 truncate">{review.program}</p>
        </div>
      </div>
    </article>
  );
}

function Reviews() {
  const marqueeReviews = [...reviews, ...reviews];

  return (
    <section className="reviews-section theme-section overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12 md:mb-14">
          <p className="theme-label mb-4">STUDENT REVIEWS</p>
          <h2 className="theme-heading">What Our Interns Say</h2>
          <p className="mt-5 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Real feedback from students who completed our internship programs.
          </p>

          <div className="reviews-summary mt-7 inline-flex flex-wrap items-center justify-center gap-3">
            <span className="reviews-summary-chip">
              <Star
                size={14}
                className="text-accent fill-accent"
                aria-hidden="true"
              />
              5.0 average rating
            </span>
            <span className="reviews-summary-chip text-subtle">
              From internship alumni
            </span>
          </div>
        </Reveal>
      </div>

      <Reveal className="reviews-track" delay={80}>
        <div className="reviews-marquee flex gap-5 md:gap-6 w-max px-6">
          {marqueeReviews.map((review, index) => (
            <ReviewCard key={`${review.name}-${index}`} review={review} />
          ))}
        </div>
      </Reveal>

      <p className="mt-8 text-center text-xs md:text-sm text-subtle">
        Hover to pause · Scroll continues automatically
      </p>
    </section>
  );
}

export default Reviews;
