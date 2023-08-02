"use client";
import { FC } from "react";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import dynamic from "next/dynamic";
//import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export const AppBar: FC = () => {
  return (
    <div className={styles.AppHeader}>
      <Image src="/solanaLogo.png" height={30} width={200} alt="Solana Logo" />
      <span>Wallet-Adapter Example</span>
      <WalletMultiButton className="z-10" />
    </div>
  );
};
