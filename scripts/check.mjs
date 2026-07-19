import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "index.html",
  "src/main.js",
  "src/config/operations.js",
  "src/styles/tokens.css",
  "src/styles/app.css"
];

const missingFiles = requiredFiles.filter((file) => !existsSync(file));

if (missingFiles.length > 0) {
  console.error(`Missing required files: ${missingFiles.join(", ")}`);
  process.exit(1);
}

const html = readFileSync("index.html", "utf8");
const hasAccessibleRoot = html.includes('id="app"') && html.includes('aria-live="polite"');

if (!hasAccessibleRoot) {
  console.error("Accessibility check failed: app root or live region missing.");
  process.exit(1);
}

console.log("Static integrity checks passed.");
