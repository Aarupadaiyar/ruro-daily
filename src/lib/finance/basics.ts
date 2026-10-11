/**
 * "Finance basics" lessons shown on /finance/beginners. Each one is short
 * enough to read in under a minute, with a concrete example.
 */
export interface BasicsLesson {
  slug: string;
  title: string;
  oneLiner: string;
  body: string;
  example: string;
}

export const BASICS: BasicsLesson[] = [
  {
    slug: "stocks",
    title: "What is a stock?",
    oneLiner: "Owning a tiny slice of a company.",
    body: "When you buy a share of a company, you own a very small part of it. If the business grows and earns more, other people will pay more for that slice, so the price goes up. If it struggles, the price falls.",
    example: "Buy 10 shares at ₹500 = ₹5,000. If the price rises to ₹600, your shares are worth ₹6,000.",
  },
  {
    slug: "index",
    title: "Sensex, Nifty & S&P 500",
    oneLiner: "A scoreboard for the whole market.",
    body: "An index tracks a group of large companies so you can see the market's mood at a glance. When the news says 'Nifty rose 1%', it means those 50 big companies, taken together, gained 1% that day.",
    example: "Nifty 50 = India's top 50 companies on NSE. Sensex = 30 on BSE. S&P 500 = ~500 big US companies.",
  },
  {
    slug: "mutual-funds-sip",
    title: "Mutual funds & SIPs",
    oneLiner: "Invest a little every month, let professionals handle it.",
    body: "A mutual fund pools money from many people and invests it for them. A SIP lets you put in a fixed amount every month. Because you buy every month, you automatically buy more units when prices are low.",
    example: "₹2,000/month SIP for 15 years at a 12% average return grows to roughly ₹10 lakh (you put in ₹3.6 lakh).",
  },
  {
    slug: "compounding",
    title: "The power of compounding",
    oneLiner: "Returns that earn their own returns.",
    body: "When your returns are reinvested, next year you earn on your original money and on last year's gains. Over long periods this snowballs — which is why starting early matters more than starting big.",
    example: "₹1 lakh at 10% a year → ₹1.1 lakh after 1 year, ₹2.6 lakh after 10, ₹17.4 lakh after 30.",
  },
  {
    slug: "interest-rates",
    title: "Interest rates & the RBI",
    oneLiner: "The price of borrowing money.",
    body: "The RBI sets the repo rate — what banks pay to borrow from it. Banks pass changes on to you: when the RBI cuts, loans and FD rates usually fall; when it hikes, both usually rise. In the US, the Federal Reserve plays the same role.",
    example: "A 0.25% cut on a ₹30 lakh, 20-year home loan (8.5% → 8.25%) lowers the EMI by roughly ₹470 a month.",
  },
  {
    slug: "inflation",
    title: "Inflation",
    oneLiner: "Why ₹100 buys less every year.",
    body: "Inflation is the rate at which prices rise. If inflation is 6% and your savings account pays 3%, your money is actually losing buying power. Investing aims to grow money faster than inflation.",
    example: "At 6% inflation, something that costs ₹1,000 today will cost about ₹1,790 in 10 years.",
  },
  {
    slug: "bonds-fds",
    title: "Bonds & fixed deposits",
    oneLiner: "Lending your money for a fixed return.",
    body: "With an FD you lend to a bank; with a bond you lend to a government or company. You get regular interest and your money back at the end. Lower risk than stocks, but usually lower returns too.",
    example: "₹1 lakh in a 7% FD for 3 years ≈ ₹1.23 lakh at maturity (before tax).",
  },
  {
    slug: "diversification",
    title: "Don't put all eggs in one basket",
    oneLiner: "Spread your money to reduce risk.",
    body: "Diversification means owning different kinds of investments — stocks from many companies, some bonds or FDs, maybe a little gold — so one bad outcome doesn't wipe you out. Index funds are an easy way to diversify.",
    example: "One stock can fall 50%. A Nifty 50 index fund holding 50 companies rarely moves that much.",
  },
  {
    slug: "emergency-fund",
    title: "Emergency fund first",
    oneLiner: "3–6 months of expenses, kept safe.",
    body: "Before investing, keep enough cash in a savings account or liquid fund to cover 3–6 months of essential costs. It stops you from having to sell investments at a bad time when life surprises you.",
    example: "Monthly essentials ₹25,000 → aim for an emergency fund of ₹75,000–₹1.5 lakh.",
  },
  {
    slug: "crypto",
    title: "Crypto, honestly",
    oneLiner: "High risk, high swings.",
    body: "Cryptocurrencies like Bitcoin are digital assets that can rise or fall 10% or more in a single day. They have no earnings or interest backing them. If you invest, keep it small and only use money you could afford to lose.",
    example: "Bitcoin has fallen more than 70% from its peak several times before recovering.",
  },
];
