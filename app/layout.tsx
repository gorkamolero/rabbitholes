import type { Metadata } from 'next';
import './globals.css';
import { PHProvider } from './providers';

export const metadata: Metadata = {
  title: 'RabbitHoles AI Open Source | Seek Knowledge',
  description: '🐰 Open Source RabbitHole Explorer - Hop into a warren of knowledge! Chase fascinating ideas through AI-powered mind maps. Warning: Side effects may include uncontrollable curiosity and frequent \'aha!\' moments. Built with 🥕 by the community.',
  keywords: ['open source', 'rabbit hole', 'mind map', 'AI research', 'knowledge explorer', 'deep learning', 'research tool', 'knowledge graph', 'curiosity', 'exploration'],
  applicationName: 'RabbitHoles',
  openGraph: {
    type: 'website',
    url: 'https://rabbitholes.dojoma.ai/',
    title: 'RabbitHoles Open Source | Seek Knowledge',
    description: '🐰 Open Source RabbitHole Explorer - Hop into a warren of knowledge! Chase fascinating ideas through AI-powered mind maps. Warning: Side effects may include uncontrollable curiosity and frequent \'aha!\' moments. Built with 🥕 by the community.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RabbitHoles Open Source | Seek Knowledge',
    description: '🐰 Open Source RabbitHole Explorer - Hop into a warren of knowledge! Chase fascinating ideas through AI-powered mind maps. Warning: Side effects may include uncontrollable curiosity and frequent \'aha!\' moments. Built with 🥕 by the community.',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    title: 'RabbitHoles',
    statusBarStyle: 'black',
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#000000',
    'msapplication-tap-highlight': 'no',
    'format-detection': 'telephone=no',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'RabbitHoles',
              url: 'https://rabbitholes.dojoma.ai',
              description: '🐰 Open Source RabbitHole Explorer - Hop into a warren of knowledge! Chase fascinating ideas through AI-powered mind maps. Warning: Side effects may include uncontrollable curiosity and frequent \'aha!\' moments.',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              provider: {
                '@type': 'Organization',
                name: 'Open Source Community',
                url: 'https://github.com/AsyncFuncAI/rabbitholes',
              },
              featureList: [
                'Open source knowledge exploration',
                'AI-powered curiosity engine',
                'Warren of interconnected ideas',
                'Community-driven development',
              ],
            }),
          }}
        />
      </head>
      <body style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <PHProvider>{children}</PHProvider>
      </body>
    </html>
  );
}
