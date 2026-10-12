/**
 * Shown instantly while a public page renders on the server, so navigation
 * feels immediate instead of freezing on the previous page.
 */
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading stories" className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl animate-pulse motion-reduce:animate-none">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div className="aspect-[4/3] rounded-card bg-cream-dim" />
            <div className="space-y-4">
              <div className="h-3 w-24 rounded bg-cream-dim" />
              <div className="h-8 w-full rounded bg-cream-dim" />
              <div className="h-8 w-4/5 rounded bg-cream-dim" />
              <div className="h-4 w-full rounded bg-cream-dim" />
              <div className="h-4 w-2/3 rounded bg-cream-dim" />
            </div>
          </div>
          <div className="space-y-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 rounded bg-cream-dim" />
                <div className="h-5 w-full rounded bg-cream-dim" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="overflow-hidden rounded-card border border-border bg-paper">
              <div className="aspect-[16/9] bg-cream-dim" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-20 rounded bg-cream-dim" />
                <div className="h-5 w-full rounded bg-cream-dim" />
                <div className="h-4 w-3/4 rounded bg-cream-dim" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
