import { Inter } from "next/font/google";
import "./globals.css";
import { SimulationProvider } from "@/context/SimulationContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "DOORA Presentation Demo",
  description: "Enterprise System Architecture Demo for Doora Smart Hospitality",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <SimulationProvider>
          {children}
        </SimulationProvider>
      </body>
    </html>
  );
}
