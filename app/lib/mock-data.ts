export const providers = [
  {
    name: "HBL Rewards",
    product: "Visa Signature",
    points: 42800,
    value: "PKR 21,400",
    status: "Live",
    refreshed: "2 min ago",
  },
  {
    name: "Meezan Bank",
    product: "Platinum Card",
    points: 18750,
    value: "PKR 7,500",
    status: "Live",
    refreshed: "2 min ago",
  },
  {
    name: "UBL Go Green",
    product: "Debit Rewards",
    points: 9200,
    value: "PKR 3,220",
    status: "Locked",
    refreshed: "Needs refresh",
  },
];

export const deals = [
  {
    title: "15 percent dining discount",
    bank: "HBL",
    category: "Dining",
    value: "15%",
    expiry: "Jun 18",
  },
  {
    title: "5x points on groceries",
    bank: "Meezan",
    category: "Grocery",
    value: "5x",
    expiry: "Jun 26",
  },
  {
    title: "Travel booking cashback",
    bank: "UBL",
    category: "Travel",
    value: "8%",
    expiry: "Jul 04",
  },
];

export const cardRankings = [
  {
    card: "HBL Visa Signature",
    category: "Dining",
    points: "1,840 pts",
    value: "PKR 920",
    rank: "Best",
  },
  {
    card: "Meezan Platinum",
    category: "Dining",
    points: "1,120 pts",
    value: "PKR 448",
    rank: "Good",
  },
  {
    card: "UBL Go Green",
    category: "Dining",
    points: "620 pts",
    value: "PKR 217",
    rank: "Low",
  },
];

export const lifecycle = [
  "Login starts volatile session",
  "Secure Refresh fetches live data",
  "Dashboard renders values from RAM",
  "Snapshot can export user-approved PDF",
  "Logout or timeout wipes volatile memory",
];
