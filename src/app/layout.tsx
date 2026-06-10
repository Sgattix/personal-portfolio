import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import AdminIndicator from "@/components/AdminIndicator";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Alessandro Sgattoni - Portfolio",
  description:
    "Portfolio website of Alessandro Sgattoni, a passionate software developer and programmer.",
  icons: {
    icon: "/assets/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased relative`}>
        <Navbar />
        <AdminIndicator />
        {children}
      </body>
    </html>
  );
}
