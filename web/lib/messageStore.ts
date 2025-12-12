import { getStore } from "@netlify/blobs";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

export interface StoredMessage {
  id: string;
  wallet_address: string;
  sender_name: string;
  text: string;
  created_at: string;
}

const tmpMessagesPath = join(tmpdir(), "tacoooo-messages.json");
let blobStore: ReturnType<typeof getStore> | null | undefined;

function getBlobStore() {
  if (blobStore !== undefined) {
    return blobStore;
  }

  try {
    blobStore = getStore("messages");
  } catch (error) {
    console.warn("Netlify blob store is unavailable, falling back to tmp file store", error);
    blobStore = null;
  }

  return blobStore;
}

async function readLocalMessages(): Promise<StoredMessage[]> {
  try {
    const contents = await fs.readFile(tmpMessagesPath, "utf-8");
    return JSON.parse(contents) as StoredMessage[];
  } catch {
    return [];
  }
}

async function writeLocalMessages(messages: StoredMessage[]) {
  await fs.mkdir(tmpdir(), { recursive: true });
  await fs.writeFile(tmpMessagesPath, JSON.stringify(messages, null, 2), "utf-8");
}

async function readMessages(): Promise<StoredMessage[]> {
  const store = getBlobStore();
  if (store) {
    const messages = await store.get("all-messages", { type: "json" });
    return (messages as StoredMessage[]) || [];
  }

  return readLocalMessages();
}

async function writeMessages(messages: StoredMessage[]) {
  const store = getBlobStore();
  if (store) {
    await store.setJSON("all-messages", messages);
    return;
  }

  await writeLocalMessages(messages);
}

export async function fetchMessages(): Promise<StoredMessage[]> {
  const messages = await readMessages();
  return messages.sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return bTime - aTime;
  });
}

export async function appendMessage(payload: Omit<StoredMessage, "id" | "created_at">): Promise<StoredMessage> {
  const messages = await readMessages();
  const newMessage: StoredMessage = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    ...payload,
  };
  const updated = [...messages, newMessage];
  await writeMessages(updated);
  return newMessage;
}
