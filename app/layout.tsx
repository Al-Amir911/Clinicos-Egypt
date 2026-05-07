import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "ClinicOS Egypt",
  description: "Clinic Management System",
};

import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} font-sans antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-slate-50 flex flex-col">
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
