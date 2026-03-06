import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: "FinVault — Your Digital Wallet",
  description: "Secure, real-time digital wallet platform",
  manifest: "/manifest.json",
  themeColor: "#080b12",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinVault",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="grid-bg"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
