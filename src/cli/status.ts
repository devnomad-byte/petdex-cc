import { loadState } from "../main/storage.js";
import { isRunning } from "./start.js";

export function status(): void {
  const state = loadState();
  const running = isRunning();
  console.log(
    `Pet: ${state.petSlug || "(none)"} | Level ${state.level}: ${state.levelName} | Events: ${state.totalEvents} | Running: ${running ? "yes" : "no"}`,
  );
}
