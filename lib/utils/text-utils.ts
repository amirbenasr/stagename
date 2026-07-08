export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
}

export function generateSlug(): string {
  return crypto.randomUUID().slice(0, 8);
}
