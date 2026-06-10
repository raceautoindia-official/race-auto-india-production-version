import { headers } from "next/headers";

export const revalidate = 60;

export const metadata = {
  // `absolute` keeps the title exactly as written (the layout's
  // "%s | Race Auto India" template is NOT appended), and trimmed to ~55 chars
  // for the 50-60 character SEO sweet spot.
  title: { absolute: "Race Auto India | Car, Bike, Truck & EV News in India" },
  description:
    "Latest automobile news in India — cars, bikes, trucks, buses, tractors, EV launches, reviews, prices and industry insights from Race Auto India.",
  keywords: [
    "Race Auto India",
    "automobile news India",
    "car news",
    "bike news",
    "commercial vehicle news",
    "truck news",
    "bus news",
    "tractor news",
    "EV news India",
    "car launches India",
    "bike launches India",
    "car reviews",
    "bike reviews",
    "vehicle prices India",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Race Auto India | Car, Bike, Truck & EV News in India",
    description:
      "Latest automobile news in India — cars, bikes, trucks, buses, tractors, EV launches, reviews, prices and industry insights from Race Auto India.",
    url: "/",
    type: "website",
  },
};

function isMobileUA(ua = "") {
  return /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
}

export default async function Page() {
  const ua = headers().get("user-agent") || "";
  const mobile = isMobileUA(ua);

  // ✅ Dynamic import so only ONE version is used (cuts JS/hydration)
  const { default: Component } = await (mobile
    ? import("@/components/mobile-view/Home")
    : import("./Home"));

  return <Component />;
}
