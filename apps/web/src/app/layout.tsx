import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ActiveTimeTracker } from "@/components/activity/active-time-tracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stackaudit.santlaj.in"),
  title: {
    default: "StackAudit — Open-Source Contribution Intelligence",
    template: "%s | StackAudit",
  },
  description:
    "StackAudit is a developer platform that matches your skills to real open-source GitHub issues, providing architectural context, relevant files, and structured investigation checklists.",
  keywords: [
    "StackAudit",
    "Open Source Contribution Intelligence",
    "GitHub repository discovery",
    "good first issues",
    "developer portfolio",
    "contribute to open source",
    "codebase architecture",
  ],
  authors: [{ name: "StackAudit", url: "https://stackaudit.santlaj.in" }],
  creator: "StackAudit",
  publisher: "StackAudit",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stackaudit.santlaj.in",
    siteName: "StackAudit",
    title: "StackAudit — Open-Source Contribution Intelligence",
    description:
      "Match with open-source issues that fit your developer skills and get architectural code context to start contributing immediately.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "StackAudit - Open-Source Contribution Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StackAudit — AI-Powered Open-Source Contribution Intelligence",
    description:
      "Match with open-source issues that fit your developer skills and get architectural code context to start contributing immediately.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "StackAudit",
  alternateName: ["StackAudit AI", "Stack Audit", "stackaudit"],
  url: "https://stackaudit.santlaj.in/",
  description:
    "StackAudit is a developer platform that matches your skills to real open-source GitHub issues, providing architectural context, relevant files, and structured investigation checklists.",
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "StackAudit",
  alternateName: "StackAudit",
  url: "https://stackaudit.santlaj.in/",
  logo: "https://stackaudit.santlaj.in/icon.png",
  sameAs: ["https://github.com/Santlaj/stackAudit"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body className={`${geistSans.className} min-h-full flex flex-col bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <ActiveTimeTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
