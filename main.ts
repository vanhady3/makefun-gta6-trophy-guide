import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outDir = resolve(repoRoot, "out");

mkdirSync(outDir, { recursive: true });
cpSync(resolve(repoRoot, "app"), resolve(outDir, "app"), { recursive: true });
cpSync(resolve(repoRoot, "screenshots"), resolve(outDir, "screenshots"), { recursive: true });
writeFileSync(outDir + '/dossier.json', buildDossier(outDir, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648, app_path_max_bytes: 1000 }));
console.log("Built dossier at " + outDir + "/dossier.json");
