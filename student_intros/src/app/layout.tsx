import WalletContextProvider from "./components/WalletContextProvider";
import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <WalletContextProvider>{children}</WalletContextProvider>
        </Providers>
      </body>
    </html>
  );
}
