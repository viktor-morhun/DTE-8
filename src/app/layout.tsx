import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-dmSans",
});

export const metadata: Metadata = {
  title: "DTE-6",
  description: "DTE-6 Your Competitor Identity",
  icons: {
    icon: [
      { url: "/web-app-manifest-192x192.png", sizes: "192x192" },
      { url: "/web-app-manifest-512x512.png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png?v=2", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DTE-6",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${dmSans.variable} antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
