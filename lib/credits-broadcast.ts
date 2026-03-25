/** Fired when the signed-in user's credit balance may have changed (e.g. after payment). */
export const DIAGFLOW_CREDITS_UPDATED_EVENT = "diagflow:credits-updated";

export function broadcastCreditsUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DIAGFLOW_CREDITS_UPDATED_EVENT));
}
