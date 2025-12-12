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
const fallbackMessagesPath = join(process.cwd(), "data", "messages.json");

async function readPersistedMessages(): Promise<StoredMessage[]> {
  const loadFile = async (path: string) => {
    try {
      const contents = await fs.readFile(path, "utf-8");
      return JSON.parse(contents) as StoredMessage[];
    } catch {
      return null;
    }
  };

  const fromTemp = await loadFile(tmpMessagesPath);
  if (fromTemp) {
    return fromTemp;
  }

  const fromFallback = await loadFile(fallbackMessagesPath);
  return fromFallback ?? [];
}

async function writeMessages(messages: StoredMessage[]) {
  await fs.writeFile(tmpMessagesPath, JSON.stringify(messages, null, 2), "utf-8");
}

export async function fetchMessages(): Promise<StoredMessage[]> {
  const messages = await readPersistedMessages();
  return messages.sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return bTime - aTime;
  });
}

export async function appendMessage(payload: Omit<StoredMessage, "id" | "created_at">): Promise<StoredMessage> {
  const messages = await readPersistedMessages();
  const newMessage: StoredMessage = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    ...payload,
  };
  const updated = [...messages, newMessage];
  await writeMessages(updated);
  return newMessage;
}
