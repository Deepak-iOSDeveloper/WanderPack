export function getInitials(value?: string | null) {
  if (!value) return "T";
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "T";
}

export function getFirstName(value?: string | null) {
  return value?.split(" ")[0] || "Traveler";
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "TBD";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString();
}

export function toJsDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function relativeDate(value: unknown) {
  const date = toJsDate(value);
  if (!date) return "Recently";
  const dayDiff = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (dayDiff <= 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  return `${dayDiff}d ago`;
}

export function normalizeImageUrl(value?: string | null) {
  if (!value) return "";

  const source = value.trim();
  const redirectPrefix = "https://commons.wikimedia.org/wiki/Special:Redirect/file/";

  if (source.startsWith(redirectPrefix)) {
    const fileName = source.slice(redirectPrefix.length);
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${fileName}`;
  }

  return source;
}
