import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoadMaster Pro - ATS Companion",
  description: "Economic analysis and performance tracking for American Truck Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
