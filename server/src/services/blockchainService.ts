import { createHash } from "crypto";
import {
  getLastBlock,
  insertBlock,
  getFullChain,
  type BlockRow
} from "../repos/blockchainRepo";

function computeHash(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

const GENESIS_HASH = "0".repeat(64);

export async function recordToBlockchain(
  eventId: string,
  eventData: Record<string, any>
): Promise<{ dataHash: string; prevHash: string; blockNumber: number }> {
  const lastBlock = await getLastBlock();
  const prevHash = lastBlock ? lastBlock.data_hash : GENESIS_HASH;

  const serializedData = JSON.stringify({
    eventId,
    ...eventData,
    prevHash,
    timestamp: new Date().toISOString()
  });

  const dataHash = computeHash(serializedData);

  await insertBlock({
    event_id: eventId,
    data_hash: dataHash,
    prev_hash: prevHash
  });

  return {
    dataHash,
    prevHash,
    blockNumber: lastBlock ? lastBlock.id + 1 : 1
  };
}

export async function verifyBlockchainIntegrity(): Promise<{
  isValid: boolean;
  totalBlocks: number;
  invalidBlocks: number[];
}> {
  const chain = await getFullChain();

  if (chain.length === 0) {
    return { isValid: true, totalBlocks: 0, invalidBlocks: [] };
  }

  const invalidBlocks: number[] = [];

  // Verify first block has genesis prev_hash
  if (chain[0].prev_hash !== GENESIS_HASH) {
    invalidBlocks.push(chain[0].id);
  }

  // Verify chain linkage
  for (let i = 1; i < chain.length; i++) {
    if (chain[i].prev_hash !== chain[i - 1].data_hash) {
      invalidBlocks.push(chain[i].id);
    }
  }

  return {
    isValid: invalidBlocks.length === 0,
    totalBlocks: chain.length,
    invalidBlocks
  };
}

export async function getBlockchainLedger(): Promise<
  Array<{
    blockNumber: number;
    eventId: string;
    dataHash: string;
    prevHash: string;
    createdAt: Date;
  }>
> {
  const chain = await getFullChain();
  return chain.map((block) => ({
    blockNumber: block.id,
    eventId: block.event_id,
    dataHash: block.data_hash,
    prevHash: block.prev_hash,
    createdAt: block.created_at
  }));
}
