"use client";
import { FC, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";

export const TransferToken: FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const { connected, publicKey, signTransaction } = useWallet();
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [txSig, setTxSig] = useState("");

  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster="devnet"`
      : "";
  };
  useEffect(() => {
    if (connected && publicKey) {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      connection
        .getBalance(publicKey)
        .then((balance) => {
          setBalance(balance / LAMPORTS_PER_SOL);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [connected, publicKey]);

  const handleSolSendSol = async () => {
    if (!connected || !publicKey || !address || !amount || !signTransaction)
      return;
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(address),
        lamports: amount * LAMPORTS_PER_SOL,
      }),
    );
    transaction.feePayer = publicKey; // Set the fee payer
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;
    if (transaction) {
      let signed = await signTransaction(transaction);
      let txid = await connection.sendRawTransaction(signed.serialize());
      setTxSig(txid);
      console.log("Tx sent:" + `https://solscan.io/tx/${txid}"?cluster=devnet`);
    }
  };
  return (
    <div>
      <h1 className="text-4xl">Send SOL token to a wallet</h1>
      {/* Balance */}
      <div className="flex items-center justify-center flex-col">
        <p>Your Balance</p>
        <p>{balance} SOL</p>
      </div>
      {/* Amount of Sol to spend */}
      <div
        className="relative mb-3 flex items-center flex-col"
        data-te-input-wrapper-init
      >
        <input
          type="number"
          className="peer block min-h-[auto] bg-gray-800 w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <label
          htmlFor="exampleFormControlInputNumber"
          className="pointer-events-none absolute text-sm left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-blue-500"
        >
          Amount of SOL
        </label>
      </div>
      {/* Send SOL to */}
      <div
        className="relative mb-3 flex items-center flex-col"
        data-te-input-wrapper-init
      >
        <input
          type="text"
          className="peer block min-h-[auto] bg-gray-800 w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
          onChange={(e) => setAddress(e.target.value)}
        />
        <label
          htmlFor="exampleFormControlInputNumber"
          className="pointer-events-none absolute text-sm left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-blue-500"
        >
          Destination Address
        </label>
      </div>
      {/* Send Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleSolSendSol}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        >
          {" "}
          Send{" "}
        </button>
      </div>
      {txSig ? (
        <div>
          <p>View your transaction on </p>
          <a href={link()}>Solana Explorer</a>
        </div>
      ) : null}
    </div>
  );
};
