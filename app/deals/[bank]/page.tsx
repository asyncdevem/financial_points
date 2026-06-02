import { notFound } from "next/navigation";
import { BankDealsScreen } from "../../components/screens/deals-screen";
import { getDealBank } from "../../lib/banks";

export default async function BankDealsPage({
  params,
}: {
  params: Promise<{ bank: string }>;
}) {
  const { bank: bankSlug } = await params;
  const bank = getDealBank(bankSlug);

  if (!bank) {
    notFound();
  }

  return (
    <BankDealsScreen
      bank={bank.name}
      title={bank.title}
      description={bank.description}
    />
  );
}
