import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Added Outfit
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' }); // Added Outfit configuration

export const metadata: Metadata = {
  title: "AquaWatch | Monitor Water Hyacinth",
  description: "Community-driven water monitoring and conservation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${outfit.variable} font-sans`}>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} AquaWatch. Protecting our waters together.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

