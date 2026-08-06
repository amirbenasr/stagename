import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "StageName.Club — Find Your Perfect Artist Name",
  description: "Stop struggling with your identity. Start building your legacy.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const redditPixelId = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {redditPixelId ? (
          <>
            <Script id="reddit-pixel" strategy="afterInteractive">
              {`!function(w,d){var r=w.rdt=w.rdt||[];if(!w.rdt.init){w.rdt.init=function(i){r.push(["init",i])};var s=d.createElement("script");s.async=1;s.src="https://www.redditstatic.com/ads/pixel.js";var e=d.getElementsByTagName("script")[0];e.parentNode.insertBefore(s,e)}}(window,document); rdt.init("${redditPixelId}");`}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.reddit.com/rdr_pixel?pixel_id=${redditPixelId}`}
                alt=""
              />
            </noscript>
          </>
        ) : null}
        <Analytics/>
        {children}
      </body>
    </html>
  );
}
