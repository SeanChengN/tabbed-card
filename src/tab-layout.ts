export function tabLayout(mode: unknown): Record<string, string> {
  if (mode === "equal") return {flex: "1 1 0", width: "0", "min-width": "0"};
  if (mode === "dynamic") return {flex: "0 0 auto", width: "auto"};
  return {};
}
