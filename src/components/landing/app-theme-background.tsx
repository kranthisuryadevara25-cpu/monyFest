'use client';

/**
 * Same dark gradient orbs / shades as the landing page.
 * Use inside admin, agent, merchant, member layouts and login for consistent UI.
 */
export function AppThemeBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute -top-[40%] -left-[20%] w-[90%] h-[90%] rounded-full bg-violet-600/25 blur-[140px]" />
      <div className="absolute top-[10%] -right-[25%] w-[75%] h-[75%] rounded-full bg-fuchsia-600/20 blur-[120px]" />
      <div className="absolute -bottom-[20%] left-[5%] w-[65%] h-[65%] rounded-full bg-cyan-500/15 blur-[100px]" />
      <div className="absolute top-[50%] left-[50%] w-[50%] h-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[90px]" />
    </div>
  );
}
