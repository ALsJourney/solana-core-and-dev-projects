import "./globals.css";
import type { Metadata } from "next";
import { SolanaProvider } from "./context/solanaContext";

export const metadata: Metadata = {
  title: "SOL Sender",
  description: "Send Devnet Solana from 1 Wallet to Another",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
