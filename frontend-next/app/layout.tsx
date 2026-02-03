import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StarknetProvider from "./providers/StarknetProvider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VRF Random Generator | Cyberpunk Edition",
  description: "Cryptographically secure random numbers using Cartridge VRF on Starknet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-black`}>
        <StarknetProvider>
          {children}
        </StarknetProvider>
      </body>
    </html>
  );
}
