import { Metadata } from 'next';
import Landing from "@/components/landing";
import Navbar from "@/components/navbar";
import IPOSection from "@/components/ipoSection";
import Footer from "@/components/footer";
import { fetchIPOData } from '@/lib/api';

export async function generateMetadata(): Promise<Metadata> {
  const ipoData = await fetchIPOData();
  
  // Generate dynamic keywords based on current IPOs
  const currentIPONames = ipoData
    .filter(ipo => ipo.status === 'open' || ipo.status === 'upcoming')
    .slice(0, 10)
    .map(ipo => `${ipo.ipoName} GMP`)
    .join(', ');

  const totalIPOs = ipoData.length;
  const openIPOs = ipoData.filter(ipo => ipo.status === 'open').length;

  return {
    title: `Live IPO GMP Tracker - ${totalIPOs} IPOs | ${openIPOs} Open for Bidding | IPOtrackr`,
    description: `Track live GMPs for ${totalIPOs} IPOs including ${currentIPONames}. Real-time grey market premium, subscription data, and investment analysis. Updated every 10 minutes.`,
    keywords: `IPO GMP live, ${currentIPONames}, IPO tracker, grey market premium today, IPO subscription status, IPO allotment status, IPO listing gains, ${new Date().getFullYear()} IPO GMP`,
    openGraph: {
      title: `Live IPO GMP Tracker - ${totalIPOs} IPOs Tracked`,
      description: `Real-time tracking of ${totalIPOs} IPOs with live GMP data, subscription status, and detailed analysis`,
      url: 'https://ipotrackr.davincin.eu.org',
      images: [
        {
          url: 'https://ipotrackr.davincin.eu.org/og-image.jpg', // Same single image
          width: 1200,
          height: 630,
          alt: `IPO GMP Tracker - ${totalIPOs} IPOs Live Data`,
        },
      ],
    },
  };
}

export default function HomePage() {
  return (
    <>
      {/* Rich snippets structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "IPOtrackr",
            "url": "https://ipotrackr.davincin.eu.org",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://ipotrackr.davincin.eu.org/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "sameAs": [
              "https://github.com/Dewanshnehra/ipotrackr"
            ]
          })
        }}
      />
      
      <main className="min-h-screen dotted-bg">
        <Navbar />
        <Landing />
        <IPOSection />
        <Footer />
      </main>
    </>
  );
}