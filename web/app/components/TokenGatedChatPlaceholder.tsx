import contractMetadata from "@/data/contract-metadata.json";

type TokenGatedChatPlaceholderProps = {
  gatingToken?: string;
};

const mockMessages = [
  { id: 1, sender: "NeonCouncil", text: "Phantom holders, the next collage drop is live." },
  { id: 2, sender: "SolflareOps", text: "Check your wallet badge to confirm the unlocked channel." },
  { id: 3, sender: "NeonGuide", text: "Once Supabase auth is wired, this will stream live chat." },
];

export default function TokenGatedChatPlaceholder({ gatingToken }: TokenGatedChatPlaceholderProps) {
  // TODO: Replace this mock feed with Supabase-managed real-time data using RLS keyed to the gating token.
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-teal-500/10 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-teal-200/70">Token gated</p>
          <h3 className="text-2xl font-semibold text-white">Community Pulse</h3>
          <p className="text-sm text-white/60">Requires {gatingToken ?? contractMetadata.gatingToken}</p>
        </div>
        <span className="rounded-full border border-teal-400/40 px-3 py-1 text-xs text-teal-200">Live</span>
      </div>

      <div className="mt-5 space-y-3 text-sm text-white/80">
        {mockMessages.map((message) => (
          <div key={message.id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-200/70">{message.sender}</p>
            <p className="mt-1 font-semibold text-white">{message.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-white/60">
        <span>Chat readiness: awaiting proof of {gatingToken ?? contractMetadata.gatingToken}</span>
        <button className="rounded-full border border-teal-200/40 px-4 py-1 text-teal-200 transition hover:border-teal-100/90">Queue access</button>
      </div>
    </div>
  );
}
