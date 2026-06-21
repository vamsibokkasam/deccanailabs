import Program from "../models/Program.js";

const defaultPrograms = [
  {
    title: "Web Development",
    description:
      "Hands-on projects, mentorship, certification, and practical learning experience.",
  },
  {
    title: "Java Development",
    description:
      "Hands-on projects, mentorship, certification, and practical learning experience.",
  },
  {
    title: "Python Development",
    description:
      "Hands-on projects, mentorship, certification, and practical learning experience.",
  },
  {
    title: "AI & Machine Learning",
    description:
      "Hands-on projects, mentorship, certification, and practical learning experience.",
  },
  {
    title: "Data Science",
    description:
      "Hands-on projects, mentorship, certification, and practical learning experience.",
  },
  {
    title: "Cyber Security",
    description:
      "Hands-on projects, mentorship, certification, and practical learning experience.",
  },
];

const seedPrograms = async () => {
  const count = await Program.countDocuments();

  if (count === 0) {
    await Program.insertMany(defaultPrograms);
    console.log("Default programs seeded");
  }
};

export default seedPrograms;
