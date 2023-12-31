import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import {
  DataV2,
  createCreateMetadataAccountV3Instruction,
  createUpdateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import * as fs from "fs";

async function createNewMint(
  connection: web3.Connection,
  payer: web3.Keypair,
  mintAuthority: web3.PublicKey,
  freezeAuthority: web3.PublicKey,
  decimals: number,
): Promise<web3.PublicKey> {
  const tokenMint = await token.createMint(
    connection,
    payer,
    mintAuthority,
    freezeAuthority,
    decimals,
  );

  console.log(`The token mint account address is ${tokenMint}`);
  console.log(
    `Token mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`,
  );
  return tokenMint;
}

async function createTokenAccount(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
) {
  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner,
  );

  console.log(`
              Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet
              `);
  return tokenAccount;
}

async function mintTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  destination: web3.PublicKey,
  authority: web3.Keypair,
  amount: number,
) {
  const mintInfo = await token.getMint(connection, mint);

  const transactionSignature = await token.mintTo(
    connection,
    payer,
    mint,
    destination,
    authority,
    amount * 10 ** mintInfo.decimals,
  );

  console.log(
    `Mint token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
  );
}

async function transferTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  source: web3.PublicKey,
  destination: web3.PublicKey,
  owner: web3.PublicKey,
  amount: number,
  mint: web3.PublicKey,
) {
  const mintInfo = await token.getMint(connection, mint);
  const transactionSignature = await token.transfer(
    connection,
    payer,
    source,
    destination,
    owner,
    amount * 10 ** mintInfo.decimals,
  );

  console.log(`
              Transfer Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet
              `);
}

async function burnTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  account: web3.PublicKey,
  mint: web3.PublicKey,
  owner: web3.Keypair,
  amount: number,
) {
  const mintInfo = await token.getMint(connection, mint);
  const transactionSignature = await token.burn(
    connection,
    payer,
    account,
    mint,
    owner,
    amount * 10 ** mintInfo.decimals,
  );

  console.log(
    `Burn Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
  );
}

//---------------

async function createTokenMetadata(
  connection: web3.Connection,
  metaplex: Metaplex,
  mint: web3.PublicKey,
  user: web3.Keypair,
  name: string,
  symbol: string,
  description: string,
) {
  // file to buffer
  const buffer = fs.readFileSync("assets/pizzacoin.png");

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, "pizzacoin.png");

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri: ", imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: name,
    description: description,
    image: imageUri,
  });

  console.log("metadata uri: ", uri);

  // get metadata account address
  const metadataPDA = metaplex.nfts().pdas().metadata({ mint });

  // onchain metadata format
  const tokenMetadata = {
    name: name,
    symbol: symbol,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  // transaction to create metadata account
  const transaction = new web3.Transaction().add(
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: mint,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          collectionDetails: null,
          data: tokenMetadata,
          isMutable: true,
        },
      },
    ),
  ); // send transaction
  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [user],
  );

  console.log(
    `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
  );
}
async function updateTokenMetadata(
  connection: web3.Connection,
  metaplex: Metaplex,
  mint: web3.PublicKey,
  user: web3.Keypair,
  name: string,
  symbol: string,
  description: string,
) {
  // file to buffer
  const buffer = fs.readFileSync("assets/pizzacoin.png");

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, "pizzacoin.png");

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri: ", imageUri);

  // upload metadata nad get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: name,
    description: description,
    image: imageUri,
  });

  console.log("metadata uri: ", uri);

  // get metadata account address
  const metadataPDA = metaplex.nfts().pdas().metadata({ mint });

  // onchain metadata format
  const tokenMetadata = {
    name: name,
    symbol: symbol,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  // transaction to update metadata account
  const transaction = new web3.Transaction().add(
    createUpdateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        updateAuthority: user.publicKey,
      },
      {
        updateMetadataAccountArgsV2: {
          data: tokenMetadata,
          updateAuthority: user.publicKey,
          primarySaleHappened: true,
          isMutable: true,
        },
      },
    ),
  );
  // send transaction
  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [user],
  );

  console.log(
    `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
  );
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  console.log("PublicKey: ", user.publicKey.toBase58());

  const MINT_ADDRESS = "C9r6QoSVegBnDZL63jmvvvhPGP86oDwSWcrsiNAEvKcr";

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      }),
    );

  // calling the token

  await createTokenMetadata(
    connection,
    metaplex,
    new web3.PublicKey(MINT_ADDRESS),
    user,
    "Pizza coin",
    "PZZZA",
    "Pizza is life",
  );
  /*
  const mint = await createNewMint(
    connection,
    user,
    user.publicKey,
    user.publicKey,
    2,
  );

  const tokenAccount = await createTokenAccount(
    connection,
    user,
    mint,
    user.publicKey,
  );

  await mintTokens(connection, user, mint, tokenAccount.address, user, 100);

  //const receiver = web3.Keypair.generate().publicKey;
  const receiver = new web3.PublicKey(
    "7dDc9rEvoHzcNA6ywgS3hNeSvAD4ovVFoCob9JcDwbKS",
  );

  const receiverTokenAccount = await createTokenAccount(
    connection,
    user,
    mint,
    receiver,
  );

  await transferTokens(
    connection,
    user,
    tokenAccount.address,
    receiverTokenAccount.address,
    user.publicKey,
    50,
    mint,
  );

  await burnTokens(connection, user, tokenAccount.address, mint, user, 25);*/
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
