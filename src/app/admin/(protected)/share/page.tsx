import { CopyButton } from "@/components/admin/CopyButton";
import { getEdition } from "@/lib/edition";
import { renderEditionEmail, renderTelegram, renderWhatsApp } from "@/lib/newsletter/compose";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Today's edition formatted for each channel: copy for WhatsApp, preview email & Telegram. */
export default async function SharePage() {
  const edition = await getEdition();
  const whatsapp = renderWhatsApp(edition);

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Share today&apos;s edition</h1>
        <p className="mt-1 text-sm text-gray-body">
          Email and Telegram go out automatically each morning (once their keys are set). WhatsApp Channels have no API — paste this daily.
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">WhatsApp Channel post</h2>
          <CopyButton text={whatsapp} label="Copy for WhatsApp" />
        </div>
        <pre className="mt-3 whitespace-pre-wrap rounded-card border border-border bg-paper p-4 text-sm">{whatsapp}</pre>
      </section>

      <section>
        <h2 className="font-semibold">Telegram preview</h2>
        <pre className="mt-3 whitespace-pre-wrap rounded-card border border-border bg-paper p-4 text-xs">{renderTelegram(edition)}</pre>
      </section>

      <section>
        <h2 className="font-semibold">Email preview</h2>
        <iframe
          title="Email preview"
          srcDoc={renderEditionEmail(edition, `${SITE.url}/unsubscribe`)}
          className="mt-3 h-[900px] w-full rounded-card border border-border bg-white"
        />
      </section>
    </div>
  );
}
