// This is a simplified NFT contract for Massa blockchain
// You would need to deploy this contract to the Massa blockchain

/*
import {
  Context,
  Storage,
  Address,
  generateEvent,
} from "@massalabs/massa-as-sdk";
import { Args, Serializable, Result, stringToBytes, bytesToString } from "@massalabs/as-types";

const OWNER_KEY = stringToBytes("owner");
const NFT_COUNTER_KEY = stringToBytes("nftCounter");
const NFT_OWNER_PREFIX = stringToBytes("nftOwner_");
const NFT_METADATA_PREFIX = stringToBytes("nftMetadata_");

export function constructor(binArgs: StaticArray<u8>): void {
  assert(Context.isDeployingContract(), "Not in deployment context");
  
  // Store the contract owner (deployer)
  Storage.set(OWNER_KEY, stringToBytes(Context.caller().toString()));
  
  // Initialize NFT counter
  Storage.set(NFT_COUNTER_KEY, new Args().add(0 as u64).serialize());
  
  generateEvent("NFT Contract initialized successfully");
}

export function mint(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const recipient = args.nextString().expect("Missing recipient address");
  const metadata = args.nextString().expect("Missing metadata");
  
  // Get and increment NFT counter
  const counterData = Storage.get(NFT_COUNTER_KEY);
  const counter = new Args(counterData).nextU64().expect("Failed to read counter");
  const newCounter = counter + 1;
  
  // Generate NFT ID
  const nftId = `MF-${newCounter}`;
  
  // Store NFT owner
  Storage.set(
    concat(NFT_OWNER_PREFIX, stringToBytes(nftId)),
    stringToBytes(recipient)
  );
  
  // Store NFT metadata
  Storage.set(
    concat(NFT_METADATA_PREFIX, stringToBytes(nftId)),
    stringToBytes(metadata)
  );
  
  // Update counter
  Storage.set(NFT_COUNTER_KEY, new Args().add(newCounter).serialize());
  
  generateEvent(`NFT minted: ${nftId} to ${recipient}`);
  
  return stringToBytes(nftId);
}

export function ownerOf(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const nftId = args.nextString().expect("Missing NFT ID");
  
  const ownerKey = concat(NFT_OWNER_PREFIX, stringToBytes(nftId));
  assert(Storage.has(ownerKey), "NFT does not exist");
  
  return Storage.get(ownerKey);
}

export function getMetadata(binArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binArgs);
  const nftId = args.nextString().expect("Missing NFT ID");
  
  const metadataKey = concat(NFT_METADATA_PREFIX, stringToBytes(nftId));
  assert(Storage.has(metadataKey), "NFT does not exist");
  
  return Storage.get(metadataKey);
}

function concat(a: StaticArray<u8>, b: StaticArray<u8>): StaticArray<u8> {
  const result = new StaticArray<u8>(a.length + b.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i];
  }
  for (let i = 0; i < b.length; i++) {
    result[a.length + i] = b[i];
  }
  return result;
}
*/
