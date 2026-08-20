/** Empty-thread screen: greeting plus a handful of one-click starter prompts. */

const SUGGESTIONS = [
  'Give me a system status report.',
  'Sketch a React hook for debouncing input.',
  "What's on the agenda this evening?",
  'Tell me a joke.',
];

export function Welcome({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-8">
      <h1 className="text-[20px] font-medium tracking-tight text-cyan-50">Good to see you, sir.</h1>
      <p className="mt-1 text-[13px] text-cyan-200/75">What can I help you with?</p>
      <div className="mt-6 grid w-full max-w-xl grid-cols-2 gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPrompt(s)}
            className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-left text-[13px] text-cyan-50 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.06]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
