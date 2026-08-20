import { motion } from 'framer-motion';
import { useState } from 'react';
import { GlassInput } from './GlassInput';
import { SocialButtons } from './SocialButtons';

export function LoginCard() {
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => setSubmitting(false), 1400);
  };

  return (
    <motion.div
      data-glass
      data-glass-radius="32"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      className="relative w-[380px] rounded-[32px]"
      style={{
        // The glass surface (refraction, frost, tint, specular, edges) is
        // rendered in WebGL behind this card by <LiquidGlass>, keyed to this
        // element's bounding box. This card stays transparent and just holds
        // the content; the ambient drop shadow gives it weight on the glass.
        boxShadow:
          '0 30px 80px -20px rgba(0,0,0,0.75), 0 8px 24px -8px rgba(0,0,0,0.4)',
      }}
    >
      <div className="relative p-7">
        {/* Logo / mark */}
        <div className="mb-6 flex items-center gap-3">
          <Mark />
          <div className="text-sm font-medium text-white/80 tracking-wide">
            ember
          </div>
        </div>

        <h1 className="text-[26px] font-semibold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-white/60">
          Sign in to continue to your workspace
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-3">
          <GlassInput
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@studio.com"
            defaultValue="ava@ember.studio"
          />
          <GlassInput
            label="Password"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            defaultValue="hunter2hunter2"
            trailing={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                aria-pressed={showPw}
                className="inline-flex size-7 items-center justify-center rounded-md text-white/45 hover:text-white/85 transition"
              >
                {showPw ? <EyeOff /> : <Eye />}
              </button>
            }
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer select-none">
              <Checkbox />
              Remember me
            </label>
            <a
              href="#"
              className="text-xs text-white/65 hover:text-white transition"
            >
              Forgot?
            </a>
          </div>

          <LiquidButton submitting={submitting} />
        </form>

        <Divider />

        <SocialButtons />

        <div className="mt-6 text-center text-xs text-white/50">
          Don't have an account?{' '}
          <a href="#" className="text-white/90 hover:text-white transition">
            Get started
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function Mark() {
  return (
    <div className="relative size-8 rounded-xl overflow-hidden ring-1 ring-white/15">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #9b87ff 0%, #e54a8c 45%, #ff6b6b 75%, #ffd166 100%)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.7),transparent_55%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/60" />
    </div>
  );
}

function Checkbox() {
  const [on, setOn] = useState(true);
  return (
    <span
      role="checkbox"
      aria-checked={on}
      tabIndex={0}
      onClick={() => setOn((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setOn((v) => !v);
        }
      }}
      className={`relative inline-flex size-4 items-center justify-center rounded-md ring-1 transition ${
        on ? 'bg-white/90 ring-white/70' : 'bg-white/[0.08] ring-white/15'
      }`}
    >
      {on && (
        <svg viewBox="0 0 16 16" className="size-3 text-black/80">
          <path
            d="M3 8.5l3 3 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      )}
    </span>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
      <span className="text-[10px] uppercase tracking-widest text-white/40">
        or continue with
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
    </div>
  );
}

function LiquidButton({ submitting }: { submitting: boolean }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="group relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl text-sm font-semibold tracking-wide text-white transition active:scale-[0.98] disabled:opacity-90"
    >
      {/* Opaque base color — guarantees the button never reads as transparent
          against the glass card behind it. */}
      <span className="absolute inset-0 bg-[#a855f7]" />
      {/* Vibrant sunset gradient. Sized at 150% so the full purple→orange
          spectrum is visible at rest, with a moderate sweep on hover. */}
      <span
        className="absolute inset-0 bg-[length:150%_100%] bg-[position:0%_50%] transition-[background-position] duration-[1200ms] ease-out group-hover:bg-[position:100%_50%]"
        style={{
          backgroundImage: 'linear-gradient(110deg, #a855f7 0%, #ff6b35 100%)',
        }}
      />
      {/* Slow-drifting liquid blobs — vivid violet on the cool side, glowing
          amber on the warm side. They amplify the underlying gradient and
          give the surface its sense of motion. */}
      <span
        className="pointer-events-none absolute -inset-10 animate-[liquid-drift_9s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(42% 75% at 22% 40%, rgba(190,130,255,0.7), transparent 65%), radial-gradient(38% 70% at 78% 60%, rgba(255,170,80,0.7), transparent 65%)',
          filter: 'blur(16px)',
          willChange: 'transform',
        }}
      />
      {/* Glossy top sheen — soft white wash that makes the surface feel curved */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.22), transparent 100%)',
        }}
      />
      {/* Bottom inset shadow for grounding */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            'linear-gradient(0deg, rgba(0,0,0,0.18), transparent 100%)',
        }}
      />
      <span className="absolute inset-x-0 top-0 h-px bg-white/80" />
      <span className="absolute inset-x-6 bottom-0 h-px bg-white/15" />
      {/* Hover sheen — a brighter highlight near the top edge */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.25), transparent 60%)',
        }}
      />
      {/* Inner ring for crispness */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      />
      <span className="relative flex items-center gap-2">
        {submitting ? (
          <>
            <Spinner />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <span className="inline-flex transition-transform duration-300 ease-out group-hover:translate-x-1.5">
              <Arrow />
            </span>
          </>
        )}
      </span>
    </button>
  );
}

function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 6.1A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.5 7.6A17 17 0 0 0 2 12s3.5 6 10 6c1.6 0 3-.3 4.3-.8M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M3 7h8M7 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
