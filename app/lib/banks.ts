export const dealBanks = [
  {
    slug: "hbl",
    name: "HBL",
    title: "HBL Deals",
    description:
      "City-wise HBL card and Konnect offers scraped from official HBL deal pages.",
  },
  {
    slug: "meezan",
    name: "Meezan",
    title: "Meezan Deals",
    description:
      "Meezan debit card discount feed from the official Meezan card-discounts page.",
  },
  {
    slug: "ubl",
    name: "UBL",
    title: "UBL Deals",
    description:
      "UBL card and alliance offers scraped from official UBL Digital pages.",
  },
] as const;

export type DealBankSlug = (typeof dealBanks)[number]["slug"];

export function getDealBank(slug: string) {
  return dealBanks.find((bank) => bank.slug === slug);
}
