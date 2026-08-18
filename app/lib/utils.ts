// Shared UI helpers
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function initials(name: string): string {
  return name.charAt(0).toUpperCase();
}
