import { Send, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";
import { Newsletter } from "@/components/blog/Newsletter";

/** Ways to get tomorrow's edition: email, Telegram, WhatsApp (channels hide until configured). */
export function FollowLinks({ source }: { source: string }) {
  return (
    <div className="mx-auto mt-6 max-w-md space-y-3">
      <Newsletter variant="inline" source={source} />
      {(SITE.telegramUrl || SITE.whatsappUrl) && (
        <div className="flex flex-wrap justify-center gap-2">
          {SITE.telegramUrl && (
            <a href={SITE.telegramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-pill border border-border bg-paper px-4 py-2 text-sm text-ink hover:border-ink/30">
              <Send size={15} aria-hidden="true" /> Telegram
            </a>
          )}
          {SITE.whatsappUrl && (
            <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-pill border border-border bg-paper px-4 py-2 text-sm text-ink hover:border-ink/30">
              <MessageCircle size={15} aria-hidden="true" /> WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}
