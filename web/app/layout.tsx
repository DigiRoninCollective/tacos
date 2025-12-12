import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "T.A.C.O.S War Room",
    template: "%s | T.A.C.O.S War Room",
  },
  description: "Verified token holders can send secure updates to the T.A.C.O.S War Room.",
  icons: {
    icon: "/globe.svg",
    shortcut: "/globe.svg",
    apple: "/globe.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="w-full bg-[#050018] flex justify-center">
          <div className="w-full max-w-[1225px]">
            <img
              src="/tacosbanner6-18-54.png"
              alt="T.A.C.O.S banner"
              className="w-full h-auto object-contain block"
            />
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
