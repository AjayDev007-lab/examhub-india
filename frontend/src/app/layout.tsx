import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import VisitorTrackerClient from "@/components/VisitorTrackerClient";

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
      <body className="min-h-screen flex flex-col bg-brand-bg dark:bg-[#0B132B] text-brand-text dark:text-slate-100 selection:bg-brand-blue selection:text-white transition-colors duration-200">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingAIAssistant />
        <FloatingWhatsAppButton />
        <VisitorTrackerClient />
      </body>
    </html>
  );
}
