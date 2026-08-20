import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGlassHighlight } from '../hooks/useGlassHighlight';
import { GlassInput } from './GlassInput';
import { LiquidButton } from './LiquidButton';
import { SocialButtons } from './SocialButtons';

// Fake auth round-trip — just long enough for the submitting state to read.
const SUBMIT_DEMO_MS = 1400;

export function LoginCard() {
  const { hostRef, highlightRef } = useGlassHighlight<HTMLDivElement>();
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);

  const toggleRemember = () => setRemember((v) => !v);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => setSubmitting(false), SUBMIT_DEMO_MS);
  };

  return (
    <motion.div
      ref={hostRef}
      // Transform-only entrance (no opacity). Animating opacity on this element
      // would disable the descendant `backdrop-filter` until the fade finished,
      // making the glass blur "pop" in ~0.7s late on load.
      initial={{ y: 24, scale: 0.98 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      className="relative w-[380px] rounded-[32px]"
      style={{
        // Promote to its own compositor layer so the backdrop-filter below
        // only recomputes for this fixed rect, not the whole viewport.
        transform: 'translateZ(0)',
        isolation: 'isolate',
        // Strong ambient shadow + hairline ring give the card "weight" on glass.
        boxShadow:
          '0 30px 80px -20px rgba(0,0,0,0.75), 0 8px 24px -8px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.08)',
      }}
    >
      <GlassLayers highlightRef={highlightRef} />

      <div className="relative p-7">
        {/* Logo / mark */}
        <div className="mb-6 flex items-center gap-3">
          <Mark />
          <div className="text-sm font-medium text-white/80 tracking-wide">ember</div>
        </div>

        <h1 className="text-[26px] font-semibold tracking-tight text-white">Welcome back</h1>
        <p className="mt-1.5 text-sm text-white/60">Sign in to continue to your workspace</p>

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
            <label
              onClick={toggleRemember}
              className="flex items-center gap-2 text-xs text-white/60 cursor-pointer select-none"
            >
              <Checkbox checked={remember} onToggle={toggleRemember} />
              Remember me
            </label>
            <a href="#" className="text-xs text-white/65 hover:text-white transition">
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

/**
 * The glass stack. One backdrop-filter, all other layers are plain gradient
 * rasters. No mix-blend-mode, no mask-composite — both cause flicker/artifacts
 * in combination with backdrop-filter on several browsers.
 */
function GlassLayers({ highlightRef }: { highlightRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div className="absolute inset-0 rounded-[32px] overflow-hidden">
      {/* 1. The sample. Saturate boost makes orb colors pop through. */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        }}
      />

      {/* 2. Tinted fill — brighter at top, fades */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.04) 100%)',
        }}
      />

      {/* 3. Specular sheen, top-left light source */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.22), transparent 55%)',
        }}
      />

      {/* 4. Bottom darkening for weight */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(120% 80% at 100% 100%, rgba(0,0,0,0.16), transparent 55%)',
        }}
      />

      {/* 5. Pointer-tracked highlight (DOM-only, see useGlassHighlight) */}
      <div
        ref={highlightRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(380px circle at var(--gx,50%) var(--gy,0%), rgba(255,160,140,0.13), rgba(255,107,107,0.065) 30%, transparent 60%)',
        }}
      />

      {/* 6. Hard top bright edge — that iOS hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

      {/* 7. Bottom subtle reflection */}
      <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* 8. Inner highlight + 1px ring (single box-shadow rule, cheap) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          boxShadow:
            'inset 0 1px 0 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      />
    </div>
  );
}

function Mark() {
  return (
    <div className="relative size-8 rounded-xl overflow-hidden ring-1 ring-white/15">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #9b87ff 0%, #e54a8c 45%, #ff6b6b 75%, #ffd166 100%)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.7),transparent_55%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/60" />
    </div>
  );
}

function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      aria-label="Remember me"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`relative inline-flex size-4 items-center justify-center rounded-md ring-1 transition ${
        checked ? 'bg-white/90 ring-white/70' : 'bg-white/[0.08] ring-white/15'
      }`}
    >
      {checked && (
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
      <span className="text-[10px] uppercase tracking-widest text-white/40">or continue with</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
    </div>
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
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
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
