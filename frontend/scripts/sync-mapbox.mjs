import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.join(__dirname, "..");
const backendEnv = path.join(frontendRoot, "..", "backend", ".env");
const localEnv = path.join(frontendRoot, ".env.local");

function parseKey(text, key) {
  const m = text.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!m) return "";
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const backend = fs.existsSync(backendEnv) ? fs.readFileSync(backendEnv, "utf8") : "";
const token = parseKey(backend, "MAPBOX_ACCESS_TOKEN");

let lines = fs.existsSync(localEnv) ? fs.readFileSync(localEnv, "utf8").split(/\r?\n/) : [];
let replaced = false;
lines = lines.map((line) => {
  if (line.startsWith("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=")) {
    replaced = true;
    return `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=${token}`;
  }
  return line;
});
if (!replaced) {
  lines.unshift(`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=${token}`);
}
fs.writeFileSync(localEnv, lines.join("\n").replace(/\s*$/, "\n"));

if (!token) {
  console.warn("backend/.env has no MAPBOX_ACCESS_TOKEN; set it, then: npm run sync-mapbox");
} else {
  console.log("frontend/.env.local updated — restart next dev");
}
