export default function HomeLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgb(10,10,10)]"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="h-9 w-9 rounded-full border-2 border-white/15 border-t-white motion-safe:animate-spin" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
          Loading SkillProof
        </span>
      </div>
    </div>
  );
}
