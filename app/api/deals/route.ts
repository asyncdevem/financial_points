import { scrapeBankDeals } from "../../lib/bank-deal-scraper";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bank = searchParams.get("bank");
  const deals = await scrapeBankDeals();
  const filteredDeals = bank
    ? deals.filter((deal) => deal.bank.toLowerCase() === bank.toLowerCase())
    : deals;

  return Response.json({
    deals: filteredDeals,
    count: filteredDeals.length,
    source: filteredDeals.some((deal) => deal.sourceUrl !== "local-fallback")
      ? "scraped"
      : "fallback",
  });
}
