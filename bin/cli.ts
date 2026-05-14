#!/usr/bin/env node
import { install } from "../src/cli/install.js";
import { start } from "../src/cli/start.js";
import { stop } from "../src/cli/stop.js";
import { list } from "../src/cli/list.js";
import { switchPet } from "../src/cli/switch.js";
import { status } from "../src/cli/status.js";
import { uninstall } from "../src/cli/uninstall.js";
import { config } from "../src/cli/config.js";
import { autostart } from "../src/cli/autostart.js";

const args = process.argv.slice(2);
const command = args[0];
const rest = args.slice(1);

async function main() {
  switch (command) {
    case "install":
      if (!rest[0]) {
        console.error("Usage: petdex-cc install <pet-slug>");
        process.exit(1);
      }
      await install(rest[0]);
      break;
    case "start":
      start();
      break;
    case "stop":
      stop();
      break;
    case "list":
      await list();
      break;
    case "switch":
      if (!rest[0]) {
        console.error("Usage: petdex-cc switch <pet-slug>");
        process.exit(1);
      }
      await switchPet(rest[0]);
      break;
    case "status":
      status();
      break;
    case "uninstall":
      await uninstall();
      break;
    case "config":
      config(rest);
      break;
    case "autostart":
      await autostart(rest[0]);
      break;
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;
    default:
      console.log(`Unknown command: ${command ?? ""}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  console.log(`
petdex-cc - Desktop pet companion for Claude Code

Commands:
  install <slug>    Install a pet from Petdex and configure hooks
  start             Start the desktop pet
  stop              Stop the desktop pet
  list              List available pets from Petdex
  switch <slug>     Switch to a different pet
  status            Show current pet status and level
  uninstall         Remove petdex-cc hooks and data
  config            Configure API key and settings
  autostart         Enable/disable auto-start on login (--enable / --disable)
  help              Show this help message
`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
