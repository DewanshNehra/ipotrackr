import type { Metadata } from "next";
import { Space_Grotesk, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "IPO GMP Tracker - Live IPO Grey Market Premium | IPOtrackr",
  description: "Real-time IPO GMP tracker with live grey market premium data, subscription status, and detailed analysis. Track IPO GMPs, subscription rates, and make informed investment decisions.",
  keywords: "IPO GMP, IPO tracker, grey market premium, IPO subscription, IPO analysis, IPO investment, IPO GMP live, IPO GMP tracker, IPO allotment, IPO listing gains",
  authors: [{ name: "Dewans Nehra", url: "https://github.com/Dewanshnehra" }],
  creator: "Dewans Nehra",
  publisher: "IPOtrackr",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ipotrackr.davincin.eu.org',
    siteName: 'IPOtrackr - IPO GMP Tracker',
    title: 'IPO GMP Tracker - Live Grey Market Premium Data',
    description: 'Track live IPO GMPs, subscription status, and analyze investment opportunities with comprehensive IPO data and trends.',
    images: [
      {
        url: 'https://ipotrackr.davincin.eu.org/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IPOtrackr - IPO GMP Tracker Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPO GMP Tracker - Live Grey Market Premium',
    description: 'Real-time IPO GMP tracking with subscription data and investment analysis',
    images: ['https://ipotrackr.davincin.eu.org/og-image.jpg'], // Same image
    creator: '@dewanshnehra',
  },
  verification: {
    google: 'b0Icbvcfd90gpkWWvwtW-nFGLGMTPKJxzIwTp77dd60',
  },
  alternates: {
    canonical: 'https://ipotrackr.davincin.eu.org',
  },
  category: 'Finance',
  classification: 'Investment Tools',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={cn("font-sans", geist.variable)}>
      <head>
        <meta name="google-site-verification" content="b0Icbvcfd90gpkWWvwtW-nFGLGMTPKJxzIwTp77dd60" />
        <link rel="canonical" href="https://ipotrackr.davincin.eu.org" />
        
        {/* Enhanced Open Graph tags for better social sharing */}
        <meta property="og:title" content="IPOtrackr - Live IPO GMP Tracker" />
        <meta property="og:description" content="Real-time IPO GMP tracker with live grey market premium data and subscription analysis" />
        <meta property="og:image" content="https://ipotrackr.davincin.eu.org/og-image.jpg" />
        <meta property="og:image:alt" content="IPOtrackr - Live IPO GMP Tracker Dashboard" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://ipotrackr.davincin.eu.org" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="IPOtrackr" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="IPOtrackr - Live IPO GMP Tracker" />
        <meta name="twitter:description" content="Real-time IPO GMP tracking with subscription data and investment analysis" />
        <meta name="twitter:image" content="https://ipotrackr.davincin.eu.org/og-image.jpg" />
        <meta name="twitter:creator" content="@dewanshnehra" />
        
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00FF7B" />
        <meta name="msapplication-TileColor" content="#00FF7B" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "IPOtrackr - IPO GMP Tracker",
              "description": "Real-time IPO GMP tracker with live grey market premium data and subscription analysis",
              "url": "https://ipotrackr.davincin.eu.org",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "creator": {
                "@type": "Person",
                "name": "Dewans Nehra"
              }
            })
          }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}