import pkg from "@/package.json";

export default function VersionBadge() {
  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-[95] select-none font-mono text-[0.58rem] tracking-[0.18em] text-muted/70">
      v{pkg.version}
    </div>
  );
}
