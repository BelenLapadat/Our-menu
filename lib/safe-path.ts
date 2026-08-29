export function sanitizeInternalPath(
  value: string | null | undefined,
): string {
  if (value?.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/";
}
