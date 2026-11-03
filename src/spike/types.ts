// Temporary code for T-R1-05. This branch is never merged; only
// docs/spike-platform.md is.
export type SpikeResult = { name: string; pass: boolean; detail: string };

export async function timed<T>(run: () => Promise<T>): Promise<{ value: T; ms: number }> {
  const start = performance.now();
  const value = await run();
  return { value, ms: Math.round(performance.now() - start) };
}
