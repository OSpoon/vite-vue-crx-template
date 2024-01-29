import path from "node:path";

import { Plugin, build } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import fs from "fs-extra";
import manifest from "../public/manifest.json";
import { WebSocketServer, WebSocket } from "ws";

import {
  CRX_BACKGROUND_OUTDIR,
  CRX_CONTENT_OUTDIR,
  CRX_OUTDIR,
} from "../global.config";

let ws: WebSocket;
function startWebSocketServer(port: number) {
  if (process.env.NODE_ENV_WATCH === "true") {
    const wss = new WebSocketServer({ port: port || 18001 });
    wss.on("connection", function connection(client) {
      ws = client;
      console.log(`\x1B[32m[NOTIFY_RELOAD]\x1B[0m client connected.`);
      ws.on("message", () => {
        ws.send("keep websocket alive.");
      });
      ws.on("close", () => {
        console.log(`\x1B[32m[NOTIFY_RELOAD]\x1B[0m client disconnected.`);
      });
    });
  }
}

function injectWatchClient(): Plugin {
  return {
    name: "injectWatchClient",
    apply: "build",
    async closeBundle() {
      if (process.env.NODE_ENV_WATCH === "true") {
        manifest.content_scripts.push({
          matches: ["<all_urls>"],
          js: ["conetnt-watch.js"],
          css: [],
          run_at: "document_start",
        });
        await fs.outputJSONSync(
          path.resolve(process.cwd(), "build/manifest.json"),
          manifest
        );
        await fs.copyFileSync(
          path.resolve(process.cwd(), "scripts/conetnt-watch.js"),
          path.resolve(process.cwd(), "build/conetnt-watch.js")
        );
      }
    },
  };
}

function mergeOutputFiles(options: { root: string; files: string[] }): Plugin {
  const { root, files } = options;

  return {
    name: "mergeOutputFiles",
    apply: "build",
    async closeBundle() {
      for (const filename of files) {
        await fs.copyFileSync(
          path.resolve(process.cwd(), `${root}/${filename}`),
          path.resolve(process.cwd(), `${CRX_OUTDIR}/${filename}`),
          fs.constants.COPYFILE_FICLONE
        );
      }
      await fs.removeSync(path.resolve(process.cwd(), root));
      ws && ws.send("WATCH_RELOAD");
    },
  };
}

function watchConfig() {
  return {
    buildDelay: 300,
    chokidar: {
      usePolling: true,
    },
  };
}

async function buildPopupScript() {
  try {
    await build({
      // 根目录的 vite.config.ts 配置会在执行 build api 时将选项进行合并,容易造成混乱
      configFile: false,
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "src"),
        },
      },
      build: {
        outDir: CRX_OUTDIR,
        watch: process.env.NODE_ENV_WATCH === "true" ? watchConfig() : null,
      },
      plugins: [
        vue(),
        Components({
          resolvers: [
            AntDesignVueResolver({
              importStyle: false, // css in js
            }),
          ],
        }),
        injectWatchClient(),
      ],
    });
    console.log("\x1B[32m✓ build popup script success");
  } catch (error) {
    console.error("\x1B[32m× build popup script error", error);
  }
}

async function buildContentScript() {
  try {
    await build({
      configFile: false,
      publicDir: false,
      build: {
        outDir: CRX_CONTENT_OUTDIR,
        lib: {
          entry: [path.resolve(process.cwd(), "src/content/index.ts")],
          formats: ["cjs"],
          fileName: () => "content.js",
        },
        rollupOptions: {
          output: {
            assetFileNames: (_) => {
              return "content.css";
            },
          },
        },
        watch: process.env.NODE_ENV_WATCH === "true" ? watchConfig() : null,
      },
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "src"),
        },
      },
      // 解决代码中包含process.env.NODE_ENV导致无法使用的问题
      define: {
        "process.env.NODE_ENV": null,
      },
      plugins: [
        vue(),
        Components({
          resolvers: [
            AntDesignVueResolver({
              importStyle: false, // css in js
            }),
          ],
        }),
        mergeOutputFiles({
          root: CRX_CONTENT_OUTDIR,
          files: ["content.js", "content.css"],
        }),
      ],
    });
    console.log("\x1B[32m✓ build content script success");
  } catch (error) {
    console.log("\x1B[32m× build content script error", error);
  }
}

async function buildBackgroundScript() {
  try {
    await build({
      configFile: false,
      publicDir: false,
      build: {
        outDir: CRX_BACKGROUND_OUTDIR,
        lib: {
          entry: [path.resolve(process.cwd(), "src/background/index.ts")],
          formats: ["es"],
          fileName: () => "background.js",
        },
        watch: process.env.NODE_ENV_WATCH === "true" ? watchConfig() : null,
      },
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "src"),
        },
      },
      plugins: [
        mergeOutputFiles({
          root: CRX_BACKGROUND_OUTDIR,
          files: ["background.js"],
        }),
      ],
    });
    console.log("\x1B[32m✓ build background script success");
  } catch (error) {
    console.log("\x1B[32m× build background script error", error);
  }
}

(async () => {
  startWebSocketServer(18001);
  await buildPopupScript();
  await buildContentScript();
  await buildBackgroundScript();
  console.log("\x1B[32m✓ build all success");
})();
