import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Classroom | Enterprise Faculty Monitoring",
  description: "Next-generation realtime faculty monitoring and analytics platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jakarta.className}>
        <div className="mesh-background" />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
