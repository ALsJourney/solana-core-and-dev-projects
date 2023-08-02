import { NextPage } from "next";
import styles from "./styles/Home.module.css";
import { AppBar } from "./components/AppBar";
import Head from "next/head";
import { TransferToken } from "./components/TransferToken";

const Home: NextPage = (props) => {
  return (
    <div className={styles.App}>
      <Head>
        <title>Wallet-Adapter Example</title>
        <meta name="description" content="Wallet-Adapter Example" />
      </Head>
      <AppBar />
      <div className={styles.AppBody}>
        <TransferToken />
      </div>
    </div>
  );
};

export default Home;
