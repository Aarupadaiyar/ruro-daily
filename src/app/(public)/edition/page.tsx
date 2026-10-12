import type { Metadata } from "next";
import { EditionView } from "@/components/edition/EditionView";
import { getEdition } from "@/lib/edition";
import { getPrefs } from "@/lib/prefs-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Today's edition: the 10 stories that matter",
  description: "Today's top AI, Tech and Finance stories in one five-minute, finishable edition.",
};

export default async function TodayEditionPage() {
  const prefs = await getPrefs();
  return <EditionView edition={await getEdition(undefined, prefs)} prefs={prefs} />;
}
