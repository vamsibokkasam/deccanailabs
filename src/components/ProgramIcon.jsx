const ICON_MAP = [
  { match: /web/i, slug: "html5", color: "E34F26" },
  { match: /python/i, slug: "python", color: "3776AB" },
  { match: /java/i, slug: "openjdk", color: "437291" },
  { match: /ai|machine learning|ml/i, slug: "pytorch", color: "EE4C2C" },
  { match: /data science/i, slug: "jupyter", color: "F37626" },
  { match: /cyber|security/i, slug: "kalilinux", color: "557C94" },
];

function getIconConfig(title = "") {
  const config = ICON_MAP.find(({ match }) => match.test(title));
  return config || { slug: "codeberg", color: "06B6D4" };
}

function ProgramIcon({ title, className = "w-10 h-10" }) {
  const { slug, color } = getIconConfig(title);

  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}/${color}`}
      alt=""
      className={className}
      loading="lazy"
    />
  );
}

export default ProgramIcon;
