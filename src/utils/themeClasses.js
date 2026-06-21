export const inputClass = (hasError) =>
  `w-full bg-input border rounded-lg p-4 text-fg text-[15px] placeholder-subtle ${
    hasError ? "border-red-500/60" : "border-border"
  }`;
