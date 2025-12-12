"use client";

import { useState, useEffect } from "react";

type Message = {
  id: string;
  sender: string;
  walletAddress: string;
  text: string;
  timestamp: string;
};

type WarRoomProps = {
  isVerified: boolean;
  walletAddress?: string;
};

export default function WarRoom({ isVerified, walletAddress }: WarRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      setIsFetching(true);
      try {
        const response = await fetch("/api/messages");
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setMessages(data.messages || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    };

    if (isVerified) {
      fetchMessages();
    } else {
      setMessages([]);
    }

    return () => {
      isMounted = false;
    };
  }, [isVerified]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !isVerified) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          walletAddress,
          senderName: walletAddress ? `Holder_${walletAddress.slice(0, 6)}` : "Holder",
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        if (newMessage?.message) {
          setMessages((prev) => [...prev, newMessage.message]);
        }
        setInputText("");
      } else {
        const err = await response.json();
        alert(`Error: ${err.error || "Failed to send message"}`);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-teal-500/10 backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-teal-200/70">War Room</p>
          <h3 className="text-2xl font-semibold text-white">T.A.C.O.S War Room</h3>
          <p className="text-sm text-white/60">
            {isVerified ? `Verified: ${walletAddress?.slice(0, 8)}...` : "Verify your address to access"}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
          isVerified ? "border border-green-400/60 text-green-200" : "border border-red-400/60 text-red-200"
        }`}>
          {isVerified ? "Verified" : "Unverified"}
        </span>
      </div>

      {/* Messages Feed */}
      <div className="mt-5 space-y-3 max-h-[400px] overflow-y-auto text-sm text-white/80">
        {isFetching ? (
          <div className="text-center py-8 text-white/50">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-teal-400 border-r-2 border-teal-400/50"></div>
            <p className="mt-3">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <p>No messages yet. Be the first to start the legend. 🚀</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 hover:bg-white/10 transition">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-teal-200/70">{message.sender}</p>
                <p className="text-xs text-white/40">{new Date(message.timestamp).toLocaleTimeString()}</p>
              </div>
              <p className="mt-1 font-semibold text-white">{message.text}</p>
              <p className="text-xs text-white/30 mt-2">{message.walletAddress}</p>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      {isVerified ? (
        <div className="mt-5 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Send a message to the war room..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none transition focus:border-teal-300/60 disabled:opacity-50"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="rounded-2xl border border-teal-300/60 bg-gradient-to-r from-teal-400/30 to-purple-500/30 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-200 transition disabled:opacity-50 hover:border-teal-200/90 hover:shadow-lg hover:shadow-teal-400/30"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 p-4 rounded-2xl border border-yellow-400/30 bg-yellow-900/20">
          <p className="text-sm text-yellow-200">🔒 Verify your address above to join the war room and send messages.</p>
        </div>
      )}
    </div>
  );
}
