import MemeGenerator from "@/app/components/MemeGenerator";

export default function MemePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center">Meme Generator</h1>
      </div>
      <MemeGenerator />
    </main>
  );
}
