import { deals as fallbackDeals } from "./mock-data";

export type BankDeal = {
  title: string;
  bank: string;
  category: string;
  city: string;
  value: string;
  expiry: string;
  sourceUrl: string;
  scrapedAt: string;
};

type BankDealSource = {
  bank: string;
  url: string;
  categories: string[];
  parser?: "hbl-konnect-foodie" | "generic";
};

const dealSources: BankDealSource[] = [
  {
    bank: "HBL",
    url: "https://www.hbl.com/personal/cards/cards/hbl-deals-and-discounts",
    categories: ["Dining", "Shopping", "Travel", "Grocery"],
    parser: "generic",
  },
  {
    bank: "HBL",
    url: "https://www.hbl.com/personal/konnect/konnect-account/konnect-foodie-package",
    categories: ["Dining"],
    parser: "hbl-konnect-foodie",
  },
  {
    bank: "Meezan",
    url: "https://www.meezanbank.com/card-discounts/",
    categories: ["Dining", "Shopping", "Travel", "Grocery"],
    parser: "generic",
  },
  {
    bank: "UBL",
    url: "https://ubldigital.com/Discount-Alliance-UBL-and-BYKEA",
    categories: ["Transport"],
    parser: "generic",
  },
  {
    bank: "UBL",
    url: "https://www.ubldigital.com/Loans/Cards-Products/UBL-Premium-Visa-Debit-Card",
    categories: ["Dining", "Shopping", "Travel", "Fuel"],
    parser: "generic",
  },
];

const valuePattern = /(?:\b\d{1,2}\s?%|\b\d+x\b|cashback|discount|off)/i;
const knownCities = [
  "Karachi",
  "Lahore",
  "Lhe",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Sialkot",
  "Nationwide",
];

export const bankDealSources = dealSources.map(({ bank, url }) => ({
  bank,
  url,
}));

export async function scrapeBankDeals(): Promise<BankDeal[]> {
  const scrapedAt = new Date().toISOString();
  const results = await Promise.allSettled(
    dealSources.map((source) => scrapeSource(source, scrapedAt)),
  );

  const deals = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  if (deals.length > 0) {
    return deals;
  }

  return fallbackDeals.map((deal) => ({
    ...deal,
    city: "Nationwide",
    sourceUrl: "local-fallback",
    scrapedAt,
  }));
}

async function scrapeSource(
  source: BankDealSource,
  scrapedAt: string,
): Promise<BankDeal[]> {
  const response = await fetch(source.url, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "FinPointsDealScraper/1.0 (+https://localhost; educational project)",
    },
    signal: AbortSignal.timeout(7000),
  });

  if (!response.ok) {
    throw new Error(`Failed to scrape ${source.bank}: ${response.status}`);
  }

  const html = await response.text();
  const plainText = stripHtml(html);
  const structuredDeals =
    source.parser === "hbl-konnect-foodie"
      ? parseHblKonnectFoodie(plainText, source, scrapedAt)
      : [];

  if (structuredDeals.length > 0) {
    return structuredDeals;
  }

  const candidates = extractDealCandidates(plainText, source);

  return candidates.slice(0, 8).map((title) => ({
    title,
    bank: source.bank,
    category: inferCategory(title, source.categories),
    city: inferCity(title),
    value: inferValue(title),
    expiry: "See bank source",
    sourceUrl: source.url,
    scrapedAt,
  }));
}

function parseHblKonnectFoodie(
  text: string,
  source: BankDealSource,
  scrapedAt: string,
): BankDeal[] {
  const normalized = normalizeWhitespace(text);
  const tableStart = normalized.indexOf("Restaurant Names Cities Flat % Off");

  if (tableStart === -1) {
    return [];
  }

  const tableText = normalized.slice(tableStart, tableStart + 600);
  const rowPattern =
    /([A-Za-z][A-Za-z0-9 '&.-]+?)\s+(Karachi|Lhe|Lahore|Islamabad|Rawalpindi|Faisalabad)\s+Flat\s+(\d{1,2}%)(?:\s+OFF)?/gi;
  const deals: BankDeal[] = [];
  let match: RegExpExecArray | null;

  while ((match = rowPattern.exec(tableText)) !== null) {
    const merchant = normalizeWhitespace(match[1]);
    const city = normalizeCity(match[2]);
    const value = `Flat ${match[3]} OFF`;

    deals.push({
      title: merchant,
      bank: source.bank,
      category: "Dining",
      city,
      value,
      expiry: "See bank source",
      sourceUrl: source.url,
      scrapedAt,
    });
  }

  return deals;
}

function extractDealCandidates(text: string, source: BankDealSource) {
  const chunks = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((chunk) => normalizeWhitespace(chunk))
    .filter((chunk) => chunk.length >= 18 && chunk.length <= 120);

  const dealish = chunks.filter((chunk) => {
    const lower = chunk.toLowerCase();

    return (
      valuePattern.test(chunk) ||
      source.categories.some((category) =>
        lower.includes(category.toLowerCase()),
      )
    );
  });

  return Array.from(new Set(dealish)).slice(0, 12);
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;|&#8212;/g, "-")
    .replace(/&#x27;|&#39;/g, "'");
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function inferCategory(title: string, categories: string[]) {
  const lower = title.toLowerCase();
  const match = categories.find((category) =>
    lower.includes(category.toLowerCase()),
  );

  return match ?? "General";
}

function inferCity(title: string) {
  const lower = title.toLowerCase();
  const city = knownCities.find((candidate) =>
    lower.includes(candidate.toLowerCase()),
  );

  return normalizeCity(city ?? "Nationwide");
}

function normalizeCity(city: string) {
  if (city.toLowerCase() === "lhe") {
    return "Lahore";
  }

  return city;
}

function inferValue(title: string) {
  const match = title.match(valuePattern);

  if (!match) {
    return "Offer";
  }

  return normalizeWhitespace(match[0]).replace(/\b\w/g, (char) =>
    char.toUpperCase(),
  );
}
