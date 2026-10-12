import type { Metadata } from "next";
import { UnsubscribeButton } from "@/components/newsletter/UnsubscribeButton";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

// A confirm step (not unsubscribe-on-GET): mail scanners prefetch links, and
// would otherwise unsubscribe people who never clicked.
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ e?: string; t?: string }> }) {
  const { e = "", t = "" } = await searchParams;
  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-serif text-display-sm text-ink">Unsubscribe from Ruro Daily?</h1>
      {e && t ? (
        <>
          <p className="mt-3 text-gray-body">
            We&apos;ll stop sending the daily edition to <span className="font-medium text-ink">{e}</span>.
          </p>
          <UnsubscribeButton email={e} token={t} />
        </>
      ) : (
        <p className="mt-3 text-gray-body">Please use the unsubscribe link at the bottom of any Ruro Daily email.</p>
      )}
    </main>
  );
}
