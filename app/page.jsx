import { headers } from "next/headers";

export const revalidate = 60;

export const metadata = {
  title: "Race Auto India | Car, Bike & CV News, Reviews, Launches and EV Updates",
  description:
    "Latest automobile news in India: cars, bikes, commercial vehicles, trucks, buses, tractors, EV launches, reviews, comparisons, prices, and industry insights from Race Auto India.",
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
    title:
      "Race Auto India | Car, Bike & CV News, Reviews, Launches and EV Updates",
    description:
      "Latest automobile news in India: cars, bikes, commercial vehicles, trucks, buses, tractors, EV launches, reviews, comparisons, prices, and industry insights from Race Auto India.",
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
