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
import ContactModal from "@/components/SubscribeModal";
import ClientContactModalWrapper from '@/components/ClientModel'
import { Bricolage_Grotesque } from 'next/font/google';
import AcceptCookies from '@/components/Acceptcookies/Acceptcookies'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Choose weights as needed
  variable: '--font-bricolage', // optional: CSS variable
  display: 'swap',
});

async function fetchLogoData() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}api/general-settings/logo`,
      {
        cache: "no-store",
      }
    );
    const logoData = await response.json();
    const faviconUrl = logoData[0]?.favicon || "/default-favicon.ico"; // Fallback
    const logoUrl = logoData[0]?.logo || "/default-logo.png"; // Fallback
    return { faviconUrl, logoUrl };
  } catch (error) {
    console.error("Error fetching logo or favicon:", error);
    return { faviconUrl: "/default-favicon.ico", logoUrl: "/default-logo.png" };
  }
}

// Define metadata dynamically with fetched data
export async function generateMetadata(): Promise<Metadata> {
  const { faviconUrl, logoUrl } = await fetchLogoData();

  return {
    title: {
      default:
        "Race Auto India - Latest News on Cars, Bikes, and Commercial Vehicles",
      template: "%s - Race Auto India",
    },
    description:
      "Stay updated with the latest news and updates on cars, bikes, and commercial vehicles in India. Explore reviews, launches, and more.",
    keywords: [
      "cars",
      "bikes",
      "commercial vehicles",
      "automotive news",
      "car reviews",
      "bike reviews",
      "vehicle launches",
      "Race Auto India",
    ],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "article",
      title:
        "Race Auto India - Latest News on Cars, Bikes, and Commercial Vehicles",
      description:
        "Stay updated with the latest news and updates on cars, bikes, and commercial vehicles in India. Explore reviews, launches, and more.",
      url: "https://raceautoindia.com/",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoUrl}`,
          width: 1200,
          height: 630,
          alt: "Race Auto India - Latest News on Cars, Bikes, and Commercial Vehicles",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title:
        "Race Auto India - Latest News on Cars, Bikes, and Commercial Vehicles",
      description:
        "Stay updated with the latest news and updates on cars, bikes, and commercial vehicles in India. Explore reviews, launches, and more.",
      site: "@raceautoindia",
      images: [`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoUrl}`],
    },
    alternates: {
      canonical: "https://raceautoindia.com/",
    },
    other: {
      MetaKeywords: "cars, bikes, commercial vehicles, automotive news",
      MetaDescription:
        "Stay updated with the latest news and updates on cars, bikes, and commercial vehicles in India. Explore reviews, launches, and more.",
    },
    icons: [
      {
        url: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${faviconUrl}`, // Correct property is 'url' instead of 'href'
        rel: "icon",
        type: "image/x-icon",
      },
    ],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { faviconUrl, logoUrl } = await fetchLogoData(); // Fetch logo dynamically

  return (
    <html lang="en" suppressHydrationWarning className={bricolage.className}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-5751151754746971" />
        <link rel="preconnect" href="https://cdn.raceautoindia.com" />
        <link rel="dns-prefetch" href="https://cdn.raceautoindia.com" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5751151754746971"
          crossOrigin="anonymous"
        ></script>

        {/* Dynamic Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              headline:
                "Latest Updates on Cars, Bikes, Trucks, Buses, Agriculture & Construction Equipment",
              alternativeHeadline:
                "Breaking News & Reviews on Automobiles, Heavy Vehicles, and Machinery",
              description:
                "Stay updated with the latest automotive news, vehicle reviews, industry trends, and expert insights on cars, bikes, trucks, buses, agricultural machinery, and construction equipment.",
              keywords:
                "Car News, Bike Reviews, Truck Updates, Bus Launches, Tractor Trends, Construction Equipment, Automotive Industry",
              datePublished: "2025-04-03T12:00:00+05:30",
              dateModified: "2025-04-03T12:30:00+05:30",
              isAccessibleForFree: true,
              author: {
                "@type": "Organization",
                name: "Race Auto India",
                url: "https://raceautoindia.com",
                logo: {
                  "@type": "ImageObject",
                  url: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoUrl}`, // Updated logo URL
                  width: 600,
                  height: 60,
                },
              },
              publisher: {
                "@type": "Organization",
                name: "Race Auto India",
                logo: {
                  "@type": "ImageObject",
                  url: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoUrl}`, // Updated logo URL
                  width: 600,
                  height: 60,
                },
              },
              url: "https://raceautoindia.com/",
              articleSection:
                "Automobile, Transportation, Heavy Vehicles, Construction",
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": "https://raceautoindia.com/",
              },
              articleBody:
                "Get the latest insights on automotive industry trends, vehicle launches, and reviews from experts at Race Auto India.",
            }),
          }}
        />
      </head>
      <body>
        <Script
          type="text/javascript"
          src="https://checkout.razorpay.com/v1/checkout.js"
        />
        <AddBootstrap />
        <ToastContainer />
        <ConditionalChatbot />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AcceptCookies/>
          <SignupSuccessBanner />
          <AuthModalProvider>{children}
            <ClientContactModalWrapper />
          </AuthModalProvider>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-SF0F8Y7GZ6" />
    </html>
  );
}
