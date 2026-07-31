import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const outputDirectory = path.resolve(projectRoot, process.argv[2] || "_site");
const outputRelativePath = path.relative(projectRoot, outputDirectory);

if (
  !outputRelativePath ||
  outputRelativePath.startsWith(`..${path.sep}`) ||
  outputRelativePath === ".." ||
  path.isAbsolute(outputRelativePath)
) {
  throw new Error("公開用フォルダはプロジェクト内に指定してください。");
}

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
if (!googleMapsApiKey) {
  throw new Error(
    "GitHub Actions secret「GOOGLE_MAPS_API_KEY」が設定されていません。"
  );
}

const publicFiles = [
  "admin.html",
  "app.js",
  "config.js",
  "index.html",
  "styles.css",
  "traffic-schedule.js"
];
const publicDirectories = ["ads", "data", "mark"];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const filename of publicFiles) {
  await cp(
    path.join(projectRoot, filename),
    path.join(outputDirectory, filename)
  );
}

for (const directory of publicDirectories) {
  await cp(
    path.join(projectRoot, directory),
    path.join(outputDirectory, directory),
    { recursive: true }
  );
}

const sourceConfigPath = path.join(projectRoot, "config.js");
const publicConfigPath = path.join(outputDirectory, "config.js");
const sourceConfig = await readFile(sourceConfigPath, "utf8");
const apiKeySettingPattern = /googleMapsApiKey:\s*"[^"\r\n]*"/;

if (!apiKeySettingPattern.test(sourceConfig)) {
  throw new Error("config.jsのGoogle Maps APIキー設定箇所を確認できません。");
}

const publicConfig = sourceConfig.replace(
  apiKeySettingPattern,
  `googleMapsApiKey: ${JSON.stringify(googleMapsApiKey)}`
);

await writeFile(publicConfigPath, publicConfig, "utf8");
console.log("GitHub Pages用の公開ファイルを作成しました。");
