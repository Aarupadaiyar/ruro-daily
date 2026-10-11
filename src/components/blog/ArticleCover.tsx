import {
  BarChart3, Bitcoin, Bot, Brain, Briefcase, Code, Cpu, Eye, FlaskConical, GitBranch, Globe,
  GraduationCap, HandCoins, Landmark, LineChart, Newspaper, PiggyBank, Quote, Rocket, Server,
  ShieldCheck, Smartphone, Sparkles, Workflow, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PillarSlug } from "@/lib/categories";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  llms: Brain, agents: Bot, "open-source": GitBranch, research: FlaskConical,
  "prompt-engineering": Sparkles, infrastructure: Server, robotics: Bot, "computer-vision": Eye,
  mlops: Workflow, "data-science": BarChart3, opinion: Quote, tutorials: GraduationCap,
  "tech-news": Newspaper, software: Code, cybersecurity: ShieldCheck, gadgets: Smartphone,
  startups: Rocket, funding: HandCoins,
  markets: LineChart, economy: Globe, policy: Landmark, business: Briefcase,
  "personal-finance": PiggyBank, crypto: Bitcoin,
};

const PILLAR_STYLE: Record<PillarSlug, { bg: string; fg: string; line: string }> = {
  ai:      { bg: "bg-pillar-ai/[0.07]",      fg: "text-pillar-ai",      line: "rgba(110,90,158,0.10)" },
  tech:    { bg: "bg-pillar-tech/[0.07]",    fg: "text-pillar-tech",    line: "rgba(61,106,153,0.10)" },
  finance: { bg: "bg-pillar-finance/[0.07]", fg: "text-pillar-finance", line: "rgba(60,122,85,0.10)" },
};

const PILLAR_LABEL: Record<PillarSlug, string> = { ai: "AI", tech: "Tech", finance: "Finance" };
const PAPER_SOURCES = new Set(["arxiv-ai", "arxiv-lg", "paperswithcode"]);

// Three quiet textures, picked per article so a grid of covers doesn't look cloned.
const PATTERNS: ((c: string) => React.CSSProperties)[] = [
  (c) => ({ backgroundImage: `repeating-linear-gradient(0deg, ${c} 0 1px, transparent 1px 22px)` }),                     // ruled paper
  (c) => ({ backgroundImage: `radial-gradient(circle, ${c} 1.2px, transparent 1.4px)`, backgroundSize: "18px 18px" }),   // dots
  (c) => ({ backgroundImage: `repeating-linear-gradient(135deg, ${c} 0 1px, transparent 1px 16px)` }),                   // hatching
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Typographic cover used when a story has no real image (or only a generic
 * site logo). Calm pillar tint + texture + topic icon + source name.
 */
export function ArticleCover({
  id, pillar, categorySlug, sourceSlug, sourceName, size = "md", className,
}: {
  id: string;
  pillar: PillarSlug;
  categorySlug: string;
  sourceSlug: string;
  sourceName: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const style = PILLAR_STYLE[pillar];
  const Icon = CATEGORY_ICON[categorySlug] ?? Cpu;
  const h = hash(id);
  const pattern = PATTERNS[h % PATTERNS.length]!(style.line);
  const iconRight = h % 2 === 0;
  // The card's badge already names the category, so label the *kind* of piece.
  const label = PAPER_SOURCES.has(sourceSlug) ? "Research paper" : PILLAR_LABEL[pillar];

  return (
    <div className={cn("relative h-full w-full overflow-hidden", style.bg, className)} style={pattern} aria-hidden="true">
      <Icon
        strokeWidth={1.1}
        className={cn(
          "absolute opacity-[0.22]",
          style.fg,
          size === "lg" ? "h-48 w-48" : "h-28 w-28",
          iconRight ? "-right-4 top-1/2 -translate-y-1/2" : "-bottom-6 right-1/4"
        )}
      />
      <div className={cn("absolute inset-0 flex flex-col justify-between", size === "lg" ? "p-8" : "p-5")}>
        <span className={cn("text-[0.65rem] font-semibold uppercase tracking-[0.2em]", style.fg)}>{label}</span>
        <span className={cn("max-w-[70%] font-serif italic leading-tight text-ink/60", size === "lg" ? "text-2xl" : "text-base")}>
          {sourceName}
        </span>
      </div>
    </div>
  );
}
