import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  Nft,
  NftWithToken,
} from "@metaplex-foundation/js";
import * as fs from "fs";

const tokenName = "Squidward Handsome Boi";
const description = "Handsome boi";
const symbol = "SQUID";
const sellerFeeBasisPoints = 100;
const imageFile = "squidbetter.jpg";

// create NFT
async function createNft(metaplex: Metaplex, uri: string): Promise<Nft> {
  const { nft } = await metaplex.nfts().create({
    uri: uri,
    name: tokenName,
    sellerFeeBasisPoints: sellerFeeBasisPoints,
    symbol: symbol,
  });

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
  );

  return nft;
}

// update NFT
async function updateNft(
  metaplex: Metaplex,
  uri: string,
  mintAddress: web3.PublicKey,
) {
  const nft = await metaplex.nfts().findByMint({ mintAddress });

  await metaplex.nfts().update({
    nftOrSft: nft,
    name: tokenName,
    symbol: symbol,
    uri: uri,
    sellerFeeBasisPoints: sellerFeeBasisPoints,
  });

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
  );
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      }),
    );
  // file to buffer
  const buffer = fs.readFileSync("src/" + imageFile);

  // buffer to metaplex
  const file = toMetaplexFile(buffer, imageFile);

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);

  console.log("image uri:", imageUri);

  // upload metadata and get metadata uri
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: tokenName,
    description: description,
    image: imageUri,
  });

  console.log("Metadata uri: ", uri);

  // await createNft(metaplex, uri);

  const mintAddress = new web3.PublicKey(
    "Fffhc6eZhNQ7PpHgdGM3qcA62sg3f9qZAgLptunxTox",
  );

  await updateNft(metaplex, uri, mintAddress);
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
