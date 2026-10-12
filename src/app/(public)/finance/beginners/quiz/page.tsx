import type { Metadata } from "next";
import { Quiz } from "@/components/finance/Quiz";
import { listArticles } from "@/lib/articles";
import { buildQuiz, weekKey } from "@/lib/finance/quiz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Weekly money quiz",
  description: "Five quick questions on the money terms in this week's news.",
};

export default async function QuizPage() {
  const week = weekKey();
  const headlines = (await listArticles({ pillar: "finance", orderBy: "importance", sinceHours: 24 * 7, take: 40 })).map((a) => a.title);
  const questions = buildQuiz(headlines, week);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pillar-finance">Finance for Beginners · {week}</p>
        <h1 className="mt-2 font-serif text-display-md text-ink">This week&apos;s money quiz</h1>
        <p className="mt-2 text-gray-body">Five terms from this week&apos;s finance news. A new quiz every Monday.</p>
        <div className="mt-8">
          <Quiz week={week} questions={questions} />
        </div>
      </div>
    </main>
  );
}
