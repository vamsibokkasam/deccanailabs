export const serviceWork = [
  {
    id: "sri-sandeep",
    title: "Sri Sandeep Mini Function Hall",
    description:
      "A live venue website for bookings, facilities, events, and gallery — built for a real business in Madanapalle.",
    url: "https://www.srisandeepminifunctionhall.com/",
    image: "/services/work/sri-sandeep.webp",
    category: "dynamic",
    kind: "live",
    featured: true,
    tags: ["Live client", "Bookings", "Local business"],
  },
  {
    id: "spice-route",
    title: "Spice Route Kitchen",
    description:
      "Restaurant demo with menu, gallery, reviews, and a table-reservation flow.",
    url: "https://spice-route-red.vercel.app/",
    image: "/services/work/spice-route.webp",
    category: "dynamic",
    kind: "demo",
    tags: ["Restaurant", "Menu", "Reservations"],
  },
  {
    id: "skyline",
    title: "Skyline Properties",
    description:
      "Luxury real-estate demo with curated listings, agent profiles, and enquiry forms.",
    url: "https://real-estate-xi-two-69.vercel.app/",
    image: "/services/work/skyline-properties.webp",
    category: "dynamic",
    kind: "demo",
    tags: ["Real estate", "Listings", "Lead forms"],
  },
  {
    id: "urban-thread",
    title: "Urban Thread",
    description:
      "Streetwear store demo with collections, product catalog, cart, and a conversion-focused shop flow.",
    url: "https://urban-thread-theta.vercel.app/",
    image: "/services/work/urban-thread.webp",
    category: "ecommerce",
    kind: "demo",
    featured: true,
    tags: ["Fashion", "Catalog", "Cart"],
  },
];

export function getServiceWork(category) {
  if (!category) return serviceWork;
  return serviceWork.filter((item) => item.category === category);
}

export const CATEGORY_LABELS = {
  dynamic: "Dynamic",
  ecommerce: "Ecommerce",
};
