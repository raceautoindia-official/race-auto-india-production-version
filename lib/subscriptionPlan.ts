export const PLAN_CODE = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
} as const;

export const PLAN_NAME = {
  0: "none",
  1: "bronze",
  2: "silver",
  3: "gold",
  4: "platinum",
} as const;

export const PLAN_LABEL = {
  none: "No Plan",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
} as const;

export const PLAN_TEXT_CLASS = {
  none: "text-muted",
  bronze: "text-warning",
  silver: "text-secondary",
  gold: "text-success",
  platinum: "text-primary",
} as const;

export const PLAN_RANK = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
} as const;

export type PlanName = keyof typeof PLAN_CODE;
export type PaidPlanName = "bronze" | "silver" | "gold" | "platinum";

export function normalizePlanName(plan: any): PlanName {
  const value = String(plan || "").toLowerCase().trim();

  if (value === "bronze") return "bronze";
  if (value === "silver") return "silver";
  if (value === "gold") return "gold";
  if (value === "platinum") return "platinum";

  return "none";
}

export function getPlanCodeFromName(plan: any): number {
  return PLAN_CODE[normalizePlanName(plan)];
}

export function getPlanNameFromCode(code: any): PlanName {
  const numericCode = Number(code);

  if (numericCode === 1) return "bronze";
  if (numericCode === 2) return "silver";
  if (numericCode === 3) return "gold";
  if (numericCode === 4) return "platinum";

  return "none";
}

export function getPlanLabel(plan: any): string {
  return PLAN_LABEL[normalizePlanName(plan)];
}

export function getPlanTextClass(plan: any): string {
  return PLAN_TEXT_CLASS[normalizePlanName(plan)];
}

export function isPlanActive(subscriptionPack: any[] = []): boolean {
  return (
    Array.isArray(subscriptionPack) &&
    subscriptionPack.length > 0 &&
    subscriptionPack[0]?.status === "Active" &&
    !!subscriptionPack[0]?.plan_name
  );
}

export function getActivePlanName(subscriptionPack: any[] = []): PlanName {
  if (!isPlanActive(subscriptionPack)) return "none";
  return normalizePlanName(subscriptionPack[0]?.plan_name);
}

export function getPlanRank(plan: any): number {
  return PLAN_RANK[normalizePlanName(plan)];
}

export function getPlanAction(currentPlan: any, viewedPlan: any) {
  const currentRank = getPlanRank(currentPlan);
  const viewedRank = getPlanRank(viewedPlan);

  if (currentRank === 0) return "buy";
  if (currentRank === viewedRank) return "current";
  if (currentRank > viewedRank) return "included";
  return "upgrade";
}

// UI display titles — Bronze/Silver/Gold/Platinum are NOT shown as main labels in UI.
// Internal DB values remain bronze/silver/gold/platinum.
export const PLAN_UI_TITLE: Record<string, string> = {
  none: "No Plan",
  bronze: "Individual Basic",
  silver: "Individual Pro",
  gold: "Business",
  platinum: "Business Pro",
};

export function getPlanUITitle(plan: any): string {
  return PLAN_UI_TITLE[normalizePlanName(plan)] ?? "No Plan";
}

// Business seat limits — gold=5, platinum=10
export const BUSINESS_SEAT_LIMIT: Record<string, number> = {
  gold: 5,
  platinum: 10,
};

export function isBusinessPlan(plan: any): boolean {
  const p = normalizePlanName(plan);
  return p === "gold" || p === "platinum";
}

export function getBusinessSeatLimit(plan: any): number {
  return BUSINESS_SEAT_LIMIT[normalizePlanName(plan)] ?? 0;
}