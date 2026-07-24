export async function register() {
  await import("reflect-metadata");
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("@coralogix/browser");
  }
}
