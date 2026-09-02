export function isPrismaUniqueError(error, field) {
  if (error?.code !== "P2002") return false;
  if (!field) return true;

  const target = error.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  return String(target || "").includes(field);
}

export function isPrismaNotFoundError(error) {
  return error?.code === "P2025";
}

export function isPrismaUnavailableError(error) {
  return ["P1000", "P1001", "P1002", "P1017", "P2024"].includes(error?.code);
}
