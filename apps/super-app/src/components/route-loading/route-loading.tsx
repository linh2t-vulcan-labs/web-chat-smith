import Spinner from "@/components/spinner/spinner";

/**
 * Instant route-transition fallback. Next.js renders this the moment a `<Link>`
 * is clicked while the destination Server Component streams in, so navigation
 * no longer appears to "hang" on the current page. The surrounding layout
 * (header / sidebar) stays mounted; this only fills the page content area.
 */
export default function RouteLoading() {
  return (
    <div
      aria-busy="true"
      className="flex min-h-[60vh] w-full items-center justify-center"
    >
      <Spinner size={32} className="text-v1-action-icon-secondary" />
    </div>
  );
}
