/* eslint-disable no-console */
const path = require("path");
const fs = require("fs");
const esbuild = require("esbuild");

const pkgRoot = path.resolve(__dirname, "..");
const webviewSrc = path.join(pkgRoot, "webview");
const outDir = path.join(pkgRoot, "dist", "webview");

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function build() {
  await ensureDir(outDir);
  const htmlSrc = path.join(webviewSrc, "index.html");
  const htmlDest = path.join(outDir, "index.html");
  const html = await fs.promises.readFile(htmlSrc, "utf8");

  const isDev = process.env.WEBVIEW_DEBUG === "1";

  const buildResult = await esbuild.build({
    entryPoints: [path.join(pkgRoot, "webview", "index.tsx")],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    write: false,
    external: [],
    define: {
      "process.env.NODE_ENV": isDev ? '"development"' : '"production"',
    },
    loader: { ".png": "dataurl", ".svg": "dataurl", ".css": "empty" },
    jsx: "automatic",
    minify: !isDev,
    sourcemap: isDev ? "inline" : false,
    absWorkingDir: pkgRoot,
    alias: {
      "graph-view": path.join(pkgRoot, "src"),
    },
  });

  const jsFile = buildResult.outputFiles.find((f) => f.path.endsWith(".js"));
  const jsText = jsFile ? jsFile.text : "";
  const cssSrc = require.resolve("reactflow/dist/style.css", {
    paths: [pkgRoot],
  });
  const cssText = await fs.promises.readFile(cssSrc, "utf8");

  const processed = html
    .replace("</head>", `  <style>${cssText}</style>\n  </head>`)
    .replace("</body>", `  <script>${jsText}</script>\n  </body>`);
  await fs.promises.writeFile(htmlDest, processed, "utf8");

  console.log("Built graph-view webview to", outDir);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
