import { Star } from "lucide-react";

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
    text: "Hands-on learning with friendly mentors made complex concepts easy to understand. Highly recommend DECCAN AI labs.",
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

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={16}
          className={index < rating ? "text-accent fill-accent" : "text-subtle"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="theme-card shrink-0 w-[300px] sm:w-[340px] md:w-[380px] p-6 flex flex-col">
      <StarRating rating={review.rating} />
      <p className="mt-4 text-muted leading-relaxed flex-1">&ldquo;{review.text}&rdquo;</p>
      <div className="mt-6 pt-4 border-t border-border">
        <p className="font-medium text-fg">{review.name}</p>
        <p className="text-sm text-accent mt-1">{review.program}</p>
      </div>
    </article>
  );
}

function Reviews() {
  const marqueeReviews = [...reviews, ...reviews];

  return (
    <section className="theme-section overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="theme-label mb-4">STUDENT REVIEWS</p>
          <h2 className="theme-heading">What Our Interns Say</h2>
          <p className="mt-6 text-lg text-muted max-w-3xl mx-auto">
            Real feedback from students who completed our internship programs.
          </p>
        </div>
      </div>

      <div className="reviews-track">
        <div className="reviews-marquee flex gap-6 w-max px-6">
          {marqueeReviews.map((review, index) => (
            <ReviewCard key={`${review.name}-${index}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Reviews;
