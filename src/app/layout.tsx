import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FLZ | Portfolio",
  description: "Portfolio and private AutoPiac intranet by FLZ.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col text-slate-950">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=localStorage.getItem("autopiac.palette")||"aqua";var g=localStorage.getItem("autopiac.glass")||"clear";document.documentElement.dataset.themePalette=p;document.documentElement.dataset.glass=g;}catch(e){}`,
          }}
        />
        <noscript>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#03040a] text-white p-6 text-center">
            <div className="max-w-md">
              <h1 className="text-3xl font-black mb-4">FLZ WORKS</h1>
              <p className="text-sm font-mono text-white/70 mb-6">
                Fotorealisztikus 3D gépjárműtervezés, rendszerarchitektúra, nagyteljesítményű webrenderelés és prototípus-fejlesztés.
              </p>
              <p className="text-xs text-white/50">
                A webhely teljes élményéhez kérjük, engedélyezze a JavaScriptet a böngészőjében.
              </p>
            </div>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
