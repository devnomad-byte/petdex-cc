import type { PetAction } from "../shared/events.js";

const PET_STATES: Record<string, { row: number; frames: number; durationMs: number; id: string }> = {
  idle:           { id: "idle",           row: 0, frames: 6, durationMs: 1100 },
  "running-right":{ id: "running-right",  row: 1, frames: 8, durationMs: 1060 },
  "running-left": { id: "running-left",   row: 2, frames: 8, durationMs: 1060 },
  waving:         { id: "waving",         row: 3, frames: 4, durationMs: 700  },
  jumping:        { id: "jumping",        row: 4, frames: 5, durationMs: 840  },
  failed:         { id: "failed",         row: 5, frames: 8, durationMs: 1220 },
  waiting:        { id: "waiting",        row: 6, frames: 6, durationMs: 1010 },
  running:        { id: "running",        row: 7, frames: 6, durationMs: 820  },
  review:         { id: "review",         row: 8, frames: 6, durationMs: 1030 },
};

function pathBasename(filePath: unknown): string {
  if (typeof filePath !== "string") return "...";
  return filePath.replace(/\\/g, "/").split("/").pop() ?? filePath;
}

export function mapEventToAction(event: Record<string, unknown>): PetAction {
  const eventName = event.hook_event_name as string;
  const toolName = event.tool_name as string | undefined;
  const toolInput = event.tool_input as Record<string, unknown> | undefined;

  switch (eventName) {
    case "SessionStart":
      return { stateId: "waving", bubbleText: "Let's get to work!", triggerAi: false };

    case "PostToolUse": {
      switch (toolName) {
        case "Read":
          return {
            stateId: "review",
            bubbleText: `Reading ${pathBasename(toolInput?.file_path)}...`,
            triggerAi: false,
          };
        case "Edit":
        case "Write":
          return {
            stateId: "idle",
            bubbleText: `Edited ${pathBasename(toolInput?.file_path)}`,
            triggerAi: false,
          };
        case "Bash":
          return { stateId: "running", bubbleText: "Running command...", triggerAi: false };
        case "Glob":
        case "Grep":
          return { stateId: "waiting", bubbleText: "Searching...", triggerAi: false };
        default:
          return { stateId: "idle", bubbleText: "Working...", triggerAi: false };
      }
    }

    case "PostToolUseFailure":
      return { stateId: "failed", bubbleText: "Oops, something went wrong", triggerAi: false, aiScene: "error" };

    case "Stop":
      return {
        stateId: "jumping",
        bubbleText: "Task complete!",
        triggerAi: Math.random() < 0.6,
        aiScene: "task_complete",
      };

    case "StopFailure":
      return {
        stateId: "failed",
        bubbleText: "Encountered an error...",
        triggerAi: Math.random() < 0.4,
        aiScene: "error",
      };

    case "Notification": {
      const notifType = event.notification_type as string;
      if (notifType === "idle_prompt") {
        return {
          stateId: "waiting",
          bubbleText: "Waiting for you...",
          triggerAi: true,
          aiScene: "idle",
        };
      }
      return { stateId: "idle", bubbleText: "", triggerAi: false };
    }

    case "TaskCompleted": {
      const subject = event.task_subject as string | undefined;
      return {
        stateId: "jumping",
        bubbleText: subject ? `Done: ${subject.slice(0, 40)}` : "Task done!",
        triggerAi: true,
        aiScene: "task_complete",
      };
    }

    case "SessionEnd":
      return { stateId: "waving", bubbleText: "See you next time!", triggerAi: false };

    default:
      return { stateId: "idle", bubbleText: "", triggerAi: false };
  }
}

export { PET_STATES };
