import type { PetStateId } from "./pet-states.js";

type CommonHookFields = {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: string;
};

export type SessionStartEvent = CommonHookFields & {
  hook_event_name: "SessionStart";
  source: "startup" | "resume" | "clear" | "compact";
  model: string;
};

export type PostToolUseEvent = CommonHookFields & {
  hook_event_name: "PostToolUse";
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_response?: unknown;
  tool_use_id: string;
  duration_ms?: number;
};

export type PostToolUseFailureEvent = CommonHookFields & {
  hook_event_name: "PostToolUseFailure";
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_use_id: string;
  error: string;
  duration_ms?: number;
};

export type StopEvent = CommonHookFields & {
  hook_event_name: "Stop";
  stop_hook_active: boolean;
  last_assistant_message: string;
};

export type StopFailureEvent = CommonHookFields & {
  hook_event_name: "StopFailure";
  error: string;
  error_details?: string;
};

export type NotificationEvent = CommonHookFields & {
  hook_event_name: "Notification";
  message: string;
  title?: string;
  notification_type: string;
};

export type TaskCompletedEvent = CommonHookFields & {
  hook_event_name: "TaskCompleted";
  task_id: string;
  task_subject: string;
};

export type SessionEndEvent = CommonHookFields & {
  hook_event_name: "SessionEnd";
  reason: string;
};

export type HookEvent =
  | SessionStartEvent
  | PostToolUseEvent
  | PostToolUseFailureEvent
  | StopEvent
  | StopFailureEvent
  | NotificationEvent
  | TaskCompletedEvent
  | SessionEndEvent;

export type PetAction = {
  stateId: PetStateId;
  bubbleText: string;
  triggerAi: boolean;
  aiScene?: string;
};
