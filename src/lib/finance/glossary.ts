/**
 * Plain-English finance glossary. Used to (a) annotate beginner bites with
 * the jargon they contain and (b) power the glossary on /finance/beginners.
 * `match` is a case-insensitive regex source; it defaults to the term itself.
 */
export interface GlossaryTerm {
  term: string;
  meaning: string;
  match?: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  // Markets
  { term: "Stock", meaning: "A small piece of ownership in a company. If the company does well, the stock usually becomes worth more.", match: "stocks?|shares?|equit(?:y|ies)" },
  { term: "Index", meaning: "A scoreboard that tracks a group of big companies to show how the overall market is doing — e.g. Nifty 50, Sensex, S&P 500.", match: "index|indices|benchmark" },
  { term: "Nifty 50", meaning: "India's main stock index: the 50 largest companies on the National Stock Exchange (NSE).", match: "nifty" },
  { term: "Sensex", meaning: "An Indian stock index of 30 large companies on the Bombay Stock Exchange (BSE).", match: "sensex" },
  { term: "S&P 500", meaning: "A US stock index of about 500 of America's largest companies — the most-watched measure of the US market.", match: "s&p 500|s&p" },
  { term: "Nasdaq", meaning: "A US stock exchange and index packed with technology companies like Apple, Microsoft and Nvidia.", match: "nasdaq" },
  { term: "Dow Jones", meaning: "A US index of 30 big, well-known companies. Older and smaller than the S&P 500.", match: "dow jones|the dow" },
  { term: "Bull market", meaning: "A long stretch when prices keep rising and investors feel confident.", match: "bull(?:ish)?(?: market)?" },
  { term: "Bear market", meaning: "A long stretch when prices fall 20% or more and investors feel gloomy.", match: "bear(?:ish)?(?: market)?" },
  { term: "Rally", meaning: "A quick, strong rise in prices.", match: "rall(?:y|ied|ies)" },
  { term: "Sell-off", meaning: "Lots of investors selling at once, pushing prices down quickly.", match: "sell-?offs?" },
  { term: "Volatility", meaning: "How wildly prices swing up and down. High volatility = bigger, faster moves.", match: "volatil(?:e|ity)" },
  { term: "Market cap", meaning: "A company's total value on the stock market: share price × number of shares.", match: "market cap(?:italisation|italization)?|m-cap" },
  { term: "IPO", meaning: "Initial Public Offering — when a company sells its shares to the public for the first time.", match: "ipos?|initial public offering" },
  { term: "Dividend", meaning: "Cash a company pays its shareholders out of its profits, usually a few times a year.", match: "dividends?" },
  { term: "Earnings", meaning: "A company's profit report for a period (usually a quarter). It shows if the business is growing.", match: "earnings|quarterly results|q[1-4] results" },
  { term: "Revenue", meaning: "All the money a company brings in from sales, before costs are taken out.", match: "revenues?|sales" },
  { term: "Profit", meaning: "What is left after a company pays all its costs. Also called net income.", match: "profits?|net income" },
  { term: "Valuation", meaning: "What investors think a company is worth.", match: "valuations?" },
  { term: "Mutual fund", meaning: "A pool of money from many people, managed by professionals who invest it in stocks, bonds or both.", match: "mutual funds?" },
  { term: "SIP", meaning: "Systematic Investment Plan — investing a fixed amount every month into a mutual fund, regardless of market ups and downs.", match: "sips?|systematic investment plan" },
  { term: "ETF", meaning: "Exchange-Traded Fund — a basket of investments (often an index) that you can buy and sell like a single stock.", match: "etfs?|exchange-traded funds?" },
  { term: "Index fund", meaning: "A low-cost fund that simply copies an index like the Nifty 50 instead of picking stocks.", match: "index funds?" },
  { term: "Portfolio", meaning: "Everything you have invested, taken together.", match: "portfolios?" },
  { term: "Diversification", meaning: "Spreading money across different investments so one bad bet doesn't sink you.", match: "diversif(?:y|ied|ication)" },
  { term: "FII / FPI", meaning: "Foreign institutional / portfolio investors — big overseas funds buying or selling Indian stocks. Their moves can swing the market.", match: "fiis?|fpis?|foreign (?:institutional|portfolio) investors?" },
  { term: "Commodity", meaning: "A raw material traded in bulk — like oil, gold, wheat or copper.", match: "commodit(?:y|ies)" },

  // Rates, banks & the economy
  { term: "Interest rate", meaning: "The price of borrowing money. Higher rates make loans costlier and savings more rewarding.", match: "interest rates?|rates?" },
  { term: "Repo rate", meaning: "The rate at which the RBI lends to banks. When it changes, loan and FD rates across India usually follow.", match: "repo(?: rate)?" },
  { term: "Central bank", meaning: "A country's top bank that controls interest rates and money supply — the RBI in India, the Federal Reserve (Fed) in the US.", match: "central banks?|rbi|reserve bank|federal reserve|the fed|\\bfed\\b|ecb|bank of england" },
  { term: "Basis point", meaning: "One-hundredth of a percent. 25 basis points = 0.25%.", match: "basis points?|bps" },
  { term: "Rate cut", meaning: "When a central bank lowers interest rates to make borrowing cheaper and boost spending.", match: "rate cuts?|cut(?:s)? rates" },
  { term: "Rate hike", meaning: "When a central bank raises interest rates, usually to cool down inflation.", match: "rate hikes?|raise(?:s|d)? rates" },
  { term: "Hawkish", meaning: "Leaning toward higher interest rates to fight inflation.", match: "hawkish" },
  { term: "Dovish", meaning: "Leaning toward lower interest rates to support growth and jobs.", match: "dovish" },
  { term: "Inflation", meaning: "How quickly prices rise over time. 5% inflation means what cost ₹100 last year costs ₹105 now.", match: "inflation|cpi|consumer prices?" },
  { term: "Recession", meaning: "When the economy shrinks for a sustained period — usually with job losses and lower spending.", match: "recessions?" },
  { term: "GDP", meaning: "Gross Domestic Product — the total value of everything a country produces. Its growth rate shows how fast the economy is expanding.", match: "gdp|gross domestic product" },
  { term: "Bond", meaning: "A loan you give to a government or company. They pay you interest and return your money at the end.", match: "bonds?|treasur(?:y|ies)|gilts?|g-secs?" },
  { term: "Yield", meaning: "The yearly return you get on an investment, shown as a percentage — most often used for bonds.", match: "yields?" },
  { term: "Fiscal deficit", meaning: "When a government spends more than it earns in a year and has to borrow the difference.", match: "fiscal deficit|budget deficit|deficit" },
  { term: "Liquidity", meaning: "How easily something can be turned into cash without losing value — or how much cash is flowing in a market.", match: "liquidity" },
  { term: "FD", meaning: "Fixed Deposit — you lock money with a bank for a set time and earn a guaranteed interest rate.", match: "fds?|fixed deposits?" },
  { term: "EMI", meaning: "Equated Monthly Instalment — the fixed amount you repay each month on a loan.", match: "emis?" },
  { term: "Credit score", meaning: "A number (300–900 in India) that tells lenders how reliably you repay. Higher = easier, cheaper loans.", match: "credit scores?|cibil" },
  { term: "Rupee", meaning: "India's currency. A 'weaker' rupee means you need more rupees to buy one US dollar.", match: "rupee|inr" },
  { term: "Tariff", meaning: "A tax on imported goods. Tariffs make foreign products more expensive.", match: "tariffs?" },

  // Regulators & crypto
  { term: "SEBI", meaning: "Securities and Exchange Board of India — the regulator that protects investors and polices India's stock markets.", match: "sebi" },
  { term: "SEC", meaning: "The US Securities and Exchange Commission — America's stock-market regulator.", match: "\\bsec\\b|securities and exchange commission" },
  { term: "Crypto", meaning: "Digital currencies like Bitcoin that run on blockchains instead of banks. Very volatile and high-risk.", match: "crypto(?:currenc(?:y|ies))?|bitcoin|ethereum|btc|eth" },
  { term: "Stablecoin", meaning: "A cryptocurrency designed to stay at a fixed price, usually $1.", match: "stablecoins?" },
];

const COMPILED = GLOSSARY.map((g) => ({
  ...g,
  re: new RegExp(`(?<![\\w-])(?:${g.match ?? escapeRegex(g.term)})(?![\\w-])`, "i"),
}));

// Terms so common they would be noise on every bite unless nothing better shows up.
const LOW_PRIORITY = new Set(["Stock", "Interest rate", "Revenue", "Profit", "Index"]);

/** Glossary terms that appear in `text`, most specific first, at most `limit`. */
export function findTerms(text: string, limit = 3): GlossaryTerm[] {
  const hits = COMPILED.filter((g) => g.re.test(text));
  const ordered = [...hits.filter((h) => !LOW_PRIORITY.has(h.term)), ...hits.filter((h) => LOW_PRIORITY.has(h.term))];
  return ordered.slice(0, limit).map(({ term, meaning }) => ({ term, meaning }));
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
