/* eslint-disable no-console */
const path = require("path");
const fs = require("fs");
const esbuild = require("esbuild");

const projectRoot = path.resolve(__dirname, "..");
const webviewSrc = path.join(projectRoot, "webview", "graph");
const outDir = path.join(projectRoot, "assets", "webview", "graph");

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function build() {
  await ensureDir(outDir);

  // Copy base HTML
  const htmlSrc = path.join(webviewSrc, "index.html");
  const htmlDest = path.join(outDir, "index.html");
  const html = await fs.promises.readFile(htmlSrc, "utf8");

  // Bundle TS entry (in-memory) and inline into HTML
  const buildResult = await esbuild.build({
    entryPoints: [path.join(webviewSrc, "index.tsx")],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    write: false,
    external: [],
    define: { "process.env.NODE_ENV": '"production"' },
    loader: { ".png": "dataurl", ".svg": "dataurl", ".css": "empty" },
    jsx: "automatic",
    minify: true,
    absWorkingDir: projectRoot,
    alias: {
      "graph-view": path.resolve(projectRoot, "..", "graph", "src"),
    },
  });
  const jsFile = buildResult.outputFiles.find((f) => f.path.endsWith(".js"));
  const jsText = jsFile ? jsFile.text : "";

  // Inline reactflow CSS from node_modules
  const cssSrc = require.resolve("reactflow/dist/style.css", {
    paths: [projectRoot],
  });
  const cssText = await fs.promises.readFile(cssSrc, "utf8");

  const processed = html
    .replace("</head>", `  <style>${cssText}</style>\n  </head>`)
    .replace("</body>", `  <script>${jsText}</script>\n  </body>`);
  await fs.promises.writeFile(htmlDest, processed, "utf8");

  console.log("Built webview to", outDir);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
