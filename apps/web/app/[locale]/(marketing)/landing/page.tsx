export const metadata = {
  description:
    "Placeholder proving the marketing route group works end-to-end.",
  title: "Landing",
};

/**
 * Placeholder page — proves the `(marketing)` route group (no
 * `GuestSessionProvider`, shared `<Header>` from
 * `app/[locale]/(marketing)/layout.tsx`) works on a real route, not a full
 * feature build.
 */
const LandingPage = () => (
  <div className="flex min-h-svh flex-col gap-4 p-6">
    <h1 className="text-lg font-semibold">Landing</h1>
  </div>
);

export default LandingPage;
