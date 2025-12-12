import { getBlobStore } from "@netlify/blobs";
import { randomUUID } from "crypto";

export interface StoredMessage {
  id: string;
  wallet_address: string;
  sender_name: string;
  text: string;
  created_at: string;
}

const store = getBlobStore("messages");

async function readMessages(): Promise<StoredMessage[]> {
  const messages = await store.get("all-messages", { type: "json" });
  return (messages as StoredMessage[]) || [];
}

async function writeMessages(messages: StoredMessage[]) {
  await store.setJSON("all-messages", messages);
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
