import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import AddBootstrap from "@/components/BootstrapClient";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import ConditionalChatbot from "@/components/ConditionalChatBot";
import Script from "next/script";
import { AuthModalProvider } from "@/utils/AuthModelProvider";
import SignupSuccessBanner from "./register/successModal";
import ClientContactModalWrapper from "@/components/ClientModel";
import { Bricolage_Grotesque } from "next/font/google";
import AcceptCookies from "@/components/Acceptcookies/Acceptcookies";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://raceautoindia.com")
  .trim()
  .replace(/\/+$/, "");

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bricolage",
  display: "swap",
});

// ✅ Your attached keyword list (cleaned + deduped)
const SEO_KEYWORDS = Array.from(
  new Set([
    "Race Auto India",
    "automobile news india",
    "automotive news india",
    "auto industry news india",
    "automotive industry india",
    "car news india",
    "bike news india",
    "motorcycle news india",
    "scooter news india",
    "new bike launches india",
    "new car launches india",
    "price updates bikes india",
    "price updates cars india",
    "car reviews india",
    "bike reviews india",
    "test ride reviews india",
    "car comparison india",
    "bike comparison india",
    "upcoming bikes india",
    "upcoming cars india",
    "electric vehicle news india",
    "ev news india",
    "electric scooter india",
    "electric bike india",
    "electric car india",
    "charging infrastructure india",
    "ev policy india",
    "commercial vehicle news india",
    "truck news india",
    "bus news india",
    "fleet news india",
    "logistics sector india",
    "lcv news india",
    "mhcv news india",
    "tractor news india",
    "gst on vehicles india",
    "vehicle exports india",
    "auto sales india",
    "two wheeler sales india",
    "car sales india",
    "cv sales india",
    "emission norms india",
    "bs6 updates india",
    "auto component industry india",
  ])
).slice(0, 50); // ✅ keep reasonable; more doesn't help

async function fetchLogoData() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}api/general-settings/logo`,
      { next: { revalidate: 3600 } }
    );
    const logoData = await response.json();
    const faviconUrl = logoData?.[0]?.favicon || "/default-favicon.ico";
    const logoUrl = logoData?.[0]?.logo || "/default-logo.png";
    return { faviconUrl, logoUrl };
  } catch (error) {
    console.error("Error fetching logo or favicon:", error);
    return { faviconUrl: "/default-favicon.ico", logoUrl: "/default-logo.png" };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { faviconUrl, logoUrl } = await fetchLogoData();
  const logoAbs = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoUrl}`;

  return {
    metadataBase: new URL(SITE_URL),

    applicationName: "Race Auto India",
    generator: "Next.js",
    referrer: "origin-when-cross-origin",

    title: {
      default: "Race Auto India | Car, Bike, EV & Commercial Vehicle News in India",
      template: "%s | Race Auto India",
    },

    description:
      "Race Auto India brings the latest car, bike and commercial vehicle news, reviews, launches, EV updates, price changes and industry insights from India.",

    keywords: SEO_KEYWORDS,

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    alternates: { canonical: "/" },

    // ✅ Extra global metadata that can help trust signals
    authors: [{ name: "Race Auto India Editorial Team", url: SITE_URL }],
    publisher: "Race Auto India",
    category: "Automotive News",

    openGraph: {
      type: "website",
      title: "Race Auto India | Car, Bike, EV & Commercial Vehicle News in India",
      description:
        "Latest automobile news in India: cars, bikes, trucks, buses, tractors, EV launches, reviews, price updates and industry insights.",
      url: SITE_URL,
      siteName: "Race Auto India",
      locale: "en_IN",
      images: [
        {
          url: logoAbs,
          width: 1200,
          height: 630,
          alt: "Race Auto India",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: "Race Auto India | Car, Bike, EV & Commercial Vehicle News in India",
      description:
        "Latest automobile news in India: cars, bikes, trucks, buses, tractors, EV launches, reviews, price updates and industry insights.",
      site: "@raceautoindia",
      images: [logoAbs],
    },

    icons: {
      icon: [
        {
          url: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${faviconUrl}`,
          type: "image/x-icon",
        },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { logoUrl } = await fetchLogoData();
  const orgLogo = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoUrl}`;

  // ✅ Correct site-wide schema
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Race Auto India",
      url: SITE_URL,
      logo: orgLogo,
      sameAs: [
        // Add your real profiles if you have them (LinkedIn, X, Instagram, YouTube)
        'https://www.linkedin.com/company/race-auto-india/',
        'https://www.facebook.com/raceautoindia/',
        'https://x.com/raceautoindia',
        'https://www.instagram.com/race.auto.india/',
        'https://www.youtube.com/@RaceAutoIndia'
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Race Auto India",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <html lang="en" suppressHydrationWarning className={bricolage.className}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-5751151754746971" />

        {/* ✅ Performance hints */}
        <link rel="preconnect" href="https://cdn.raceautoindia.com" />
        <link rel="dns-prefetch" href="https://cdn.raceautoindia.com" />

        {/* ✅ AdSense script (non-blocking) */}
        <Script
          id="adsense"
          strategy="afterInteractive"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5751151754746971"
          crossOrigin="anonymous"
        />

        {/* ✅ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>

      <body>
        <AddBootstrap />
        <ToastContainer />
        <ConditionalChatbot />

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AcceptCookies />
          <SignupSuccessBanner />
          <AuthModalProvider>
            {children}
            <ClientContactModalWrapper />
          </AuthModalProvider>
        </ThemeProvider>

        <GoogleAnalytics gaId="G-SF0F8Y7GZ6" />
      </body>
    </html>
  );
}
