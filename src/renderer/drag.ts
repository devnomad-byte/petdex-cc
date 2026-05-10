import type { BrowserWindow } from "electron";
import { showBubble } from "./bubble.js";
import { setPetAction } from "./pet-sprite.js";

let dragging = false;
let startX = 0;
let startY = 0;

// Click easter egg
let clickCount = 0;
let clickTimer: ReturnType<typeof setTimeout> | null = null;

const CLICK_WINDOW_MS = 1500; // time window for counting clicks

const CLICK_MESSAGES: { threshold: number; text: string; state?: string }[] = [
  { threshold: 2, text: "你戳我干嘛？" },
  { threshold: 4, text: "好痛！别戳了！" },
  { threshold: 6, text: "再点我就不理你了！", state: "failed" },
  { threshold: 9, text: "呜呜...你欺负人", state: "failed" },
  { threshold: 12, text: "我要报警了！再点一下试试！", state: "jumping" },
  { threshold: 15, text: "✨ 勇敢的冒险者，你解锁了隐藏成就！", state: "jumping" },
];

function handleClick(): void {
  clickCount++;

  if (clickTimer) clearTimeout(clickTimer);
  clickTimer = setTimeout(() => {
    clickCount = 0;
  }, CLICK_WINDOW_MS);

  // Find the highest matching message
  let matched = CLICK_MESSAGES[0];
  for (const msg of CLICK_MESSAGES) {
    if (clickCount >= msg.threshold) matched = msg;
  }

  if (clickCount >= CLICK_MESSAGES[0].threshold) {
    showBubble(matched.text, 4000);
    if (matched.state) setPetAction(matched.state);
  }
}

export function initDrag(petEl: HTMLElement, win: BrowserWindow): void {
  petEl.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.screenX;
    startY = e.screenY;
    e.preventDefault();
    handleClick();
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const [wx, wy] = win.getPosition();
    win.setPosition(wx + e.screenX - startX, wy + e.screenY - startY);
    startX = e.screenX;
    startY = e.screenY;
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });
}
