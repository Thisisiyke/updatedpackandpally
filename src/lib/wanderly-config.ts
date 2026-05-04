export function getWanderlyApiBaseUrl(): string {
  const base =
    process.env.API_BASE_URL ||
    "";
  return base.replace(/\/$/, "");
}

export function wanderlyUrl(path: string): string {
  const base = getWanderlyApiBaseUrl();
  if (!base) {
    throw new Error(
      "API_BASE_URL is not set. Point it at wanderly-1 (e.g. http://localhost:9000)."
    );
  }
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
