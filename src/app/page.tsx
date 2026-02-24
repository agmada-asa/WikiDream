import { HomeSearch } from "@/components/home-search";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 md:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center justify-center space-y-12 pb-20">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-center font-[family-name:var(--font-geist)]">
          WikiDream
        </h1>

        <HomeSearch />

        <p className="text-muted-foreground text-sm text-center max-w-[400px]">
          A minimalist Wikipedia reader designed for deep focus and beautiful typography.
        </p>
      </div>
    </div>
  );
}
