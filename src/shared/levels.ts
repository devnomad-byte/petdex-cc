export type Level = {
  level: number;
  name: string;
  eventsRequired: number;
  effect: string;
};

export const LEVELS: Level[] = [
  { level: 1, name: "Byte", eventsRequired: 0, effect: "None" },
  { level: 2, name: "Process", eventsRequired: 50, effect: "Slight glow" },
  { level: 3, name: "Thread", eventsRequired: 200, effect: "Small aura under feet" },
  { level: 4, name: "Module", eventsRequired: 500, effect: "Afterimage trail" },
  { level: 5, name: "Kernel", eventsRequired: 1000, effect: "Periodic particles" },
  { level: 6, name: "Neural", eventsRequired: 2000, effect: "Icon flash above head" },
  { level: 7, name: "Quantum", eventsRequired: 5000, effect: "Teleport flicker" },
  { level: 8, name: "Singularity", eventsRequired: 10000, effect: "Golden halo + all effects" },
];

export function getLevelForEvents(totalEvents: number): Level {
  let result = LEVELS[0];
  for (const lvl of LEVELS) {
    if (lvl.eventsRequired <= totalEvents) {
      result = lvl;
    }
  }
  return result;
}

export type PersistedState = {
  petSlug: string;
  totalEvents: number;
  level: number;
  levelName: string;
  createdAt: string;
  lastActiveAt: string;
  version: number;
};
