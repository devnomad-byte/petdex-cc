import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

const DEFAULT_PORT = 17321;
const MAX_PORT_ATTEMPTS = 10;

type EventHandler = (event: Record<string, unknown>) => void;
type SwitchHandler = (slug: string) => void;

let eventHandler: EventHandler | null = null;
let switchHandler: SwitchHandler | null = null;
let activePort = DEFAULT_PORT;

export function onEvent(handler: EventHandler): void {
  eventHandler = handler;
}

export function onSwitch(handler: SwitchHandler): void {
  switchHandler = handler;
}

export function getActivePort(): number {
  return activePort;
}

export function startServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    function tryPort(port: number): void {
      const server = createServer((req: IncomingMessage, res: ServerResponse) => {
        if (req.method === "POST" && req.url === "/event") {
          const chunks: Buffer[] = [];
          req.on("data", (chunk: Buffer) => chunks.push(chunk));
          req.on("end", () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString());
              if (eventHandler) eventHandler(body);
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end('{"ok":true}');
            } catch {
              res.writeHead(400);
              res.end('{"ok":false,"error":"invalid json"}');
            }
          });
        } else if (req.method === "POST" && req.url === "/switch-pet") {
          const chunks: Buffer[] = [];
          req.on("data", (chunk: Buffer) => chunks.push(chunk));
          req.on("end", () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString());
              if (switchHandler && body.slug) switchHandler(body.slug);
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end('{"ok":true}');
            } catch {
              res.writeHead(400);
              res.end('{"ok":false,"error":"invalid json"}');
            }
          });
        } else if (req.method === "POST" && req.url === "/shutdown") {
          res.writeHead(200);
          res.end('{"ok":true}');
          process.exit(0);
        } else {
          res.writeHead(404);
          res.end('{"ok":false}');
        }
      });

      server.on("error", () => {
        attempts++;
        if (attempts >= MAX_PORT_ATTEMPTS) {
          reject(new Error("No available port found"));
          return;
        }
        tryPort(port + 1);
      });

      server.listen(port, "127.0.0.1", () => {
        activePort = port;
        resolve(port);
      });
    }

    tryPort(DEFAULT_PORT);
  });
}
