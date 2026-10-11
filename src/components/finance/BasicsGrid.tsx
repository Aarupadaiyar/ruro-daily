import { BASICS } from "@/lib/finance/basics";

/** One-minute finance lessons. Each card expands to show the explanation and an example. */
export function BasicsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {BASICS.map((lesson, i) => (
        <details key={lesson.slug} id={lesson.slug} className="group rounded-card border border-border bg-paper p-5 open:shadow-soft">
          <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
            <span className="mt-0.5 font-serif text-lg font-semibold leading-none text-ink/25">{i + 1}</span>
            <span className="flex-1">
              <span className="block font-serif text-lg font-semibold text-ink">{lesson.title}</span>
              <span className="mt-0.5 block text-sm text-gray-body">{lesson.oneLiner}</span>
            </span>
            <span className="mt-1 text-gray-body transition-transform group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <div className="mt-4 space-y-3 pl-7 text-sm leading-relaxed">
            <p className="text-ink/80">{lesson.body}</p>
            <p className="rounded-card-sm bg-cream-dim p-3 text-ink/80">
              <span className="font-semibold text-ink">Example: </span>
              {lesson.example}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
