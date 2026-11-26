import prisma from "./prisma.js";

const defaultDurations = ["45 Days", "2 Months", "4 Months", "6 Months"];

const defaultPrograms = [
  {
    title: "Web Development",
    description:
      "Hands-on projects, mentorship, certification, and practical learning experience.",
    duration: defaultDurations.join(" / "),
    durations: defaultDurations,
  },
  {
    title: "Java Development",
    description:
      "Hands-on projects, mentorship, certification, and practical learning experience.",
    duration: defaultDurations.join(" / "),
    durations: defaultDurations,
  },
  {
    title: "Python Development",
    description:
      "Hands-on projects, mentorship, certification, and practical learning experience.",
    duration: defaultDurations.join(" / "),
    durations: defaultDurations,
  },
  {
    title: "AI & Machine Learning",
    description:
      "Hands-on projects, mentorship, certification, and practical learning experience.",
    duration: defaultDurations.join(" / "),
    durations: defaultDurations,
  },
  {
    title: "Data Science",
    description:
      "Hands-on projects, mentorship, certification, and practical learning experience.",
    duration: defaultDurations.join(" / "),
    durations: defaultDurations,
  },
  {
    title: "Cyber Security",
    description:
      "Hands-on projects, mentorship, certification, and practical learning experience.",
    duration: defaultDurations.join(" / "),
    durations: defaultDurations,
  },
];

const seedPrograms = async () => {
  const count = await prisma.program.count();

  if (count === 0) {
    await prisma.program.createMany({ data: defaultPrograms });
    console.log("Default programs seeded");
  }
};

export default seedPrograms;
