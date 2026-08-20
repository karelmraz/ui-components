export function ReadabilityScrim() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-[2] hidden bg-scrim-side lg:block" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-scrim-top lg:hidden" />
    </>
  );
}
