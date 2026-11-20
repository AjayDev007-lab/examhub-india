import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "EXAMHUB INDIA | All Your Examination Documents and Results in One Place",
  description: "Centralized platform allowing Indian students to discover and access examination results, admit cards/hall tickets, and student identity cards across all Indian states and union territories.",
  keywords: "India exam results, admit cards, hall ticket download, UPSC, SSC, NEET, JEE, CUET, student ID card, state university results",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
