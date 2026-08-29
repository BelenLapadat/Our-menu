export function assertAuthEnv() {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is required in production.");
  }
}
