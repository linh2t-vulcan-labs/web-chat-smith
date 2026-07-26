export const metadata = {
  description:
    "Placeholder proving the marketing route group works end-to-end.",
  title: "Blog",
};

/**
 * Placeholder page — proves the `(marketing)` route group (no
 * `GuestSessionProvider`, shared `<Header>` from `[locale]/layout.tsx`)
 * works on a real route, not a full feature build.
 */
const BlogPage = () => (
  <div className="flex min-h-svh flex-col gap-4 p-6">
    <h1 className="font-semibold text-lg">Blog</h1>
  </div>
);

export default BlogPage;
