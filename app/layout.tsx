import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Simulator",
  description: "Practice behavioral, case, and situational interviews tailored to food & ag-tech.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}
