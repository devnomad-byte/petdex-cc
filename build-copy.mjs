import { cpSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

mkdirSync(`${__dirname}/dist/src/renderer`, { recursive: true });
cpSync(`${__dirname}/src/renderer/index.html`, `${__dirname}/dist/src/renderer/index.html`);

mkdirSync(`${__dirname}/dist/src/assets`, { recursive: true });
cpSync(`${__dirname}/src/assets/tray-icon.png`, `${__dirname}/dist/src/assets/tray-icon.png`);
