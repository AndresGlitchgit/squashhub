import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10B981',
};

export const metadata: Metadata = {
  title: 'SquashHub - Comunidade de Squash',
  description: 'Encontre parceiros, reserve quadras e participe de torneios de squash',
  keywords: 'squash, esportes, comunidade, reservas, torneios',
  authors: [{ name: 'SquashHub Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SquashHub',
  },
  icons: {
    icon: [
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    url: 'https://squashhub.com',
    title: 'SquashHub - Comunidade de Squash',
    description: 'Encontre parceiros, reserve quadras e participe de torneios de squash',
    siteName: 'SquashHub',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SquashHub" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#0c0c0c" />
        <meta name="msapplication-TileImage" content="/icon-144x144.png" />
      </head>
      <body className="bg-[#0c0c0c] text-[#f0f0f0]">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) {
                  console.log('SW registered:', reg.scope);
                })
                .catch(function(err) {
                  console.log('SW registration failed:', err);
                });
            });
          }
        `,
      }}
    />
  );
}
