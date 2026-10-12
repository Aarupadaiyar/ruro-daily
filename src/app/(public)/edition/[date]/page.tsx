import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EditionView } from "@/components/edition/EditionView";
import { formatEditionDate, getEdition, isValidEditionDate, todayIST } from "@/lib/edition";
import { getPrefs } from "@/lib/prefs-server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  return isValidEditionDate(date) ? { title: `Edition: ${formatEditionDate(date)}` } : {};
}

export default async function EditionArchivePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (date === todayIST()) redirect("/edition");
  if (!isValidEditionDate(date)) notFound();
  const prefs = await getPrefs();
  return <EditionView edition={await getEdition(date, prefs)} prefs={prefs} />;
}
