import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillProof — Don't just claim skills. Prove them.",
  description: "Evidence-based technical skill verification from authentic GitHub code.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-[#F4E2D3] selection:text-[#6D351F]">
        {children}
      </body>
    </html>
  );
}
