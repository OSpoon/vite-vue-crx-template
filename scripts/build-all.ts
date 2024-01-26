import path from "node:path";

import { Plugin, build } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import fs from "fs-extra";
import manifest from "../public/manifest.json";
// import { WebSocketServer, WebSocket } from "ws";

import {
  CRX_BACKGROUND_OUTDIR,
  CRX_CONTENT_OUTDIR,
  CRX_OUTDIR,
} from "../global.config";

function injectReloadMonitor(): Plugin {
  return {
    name: "injectReloadMonitor",
    apply: "build",
    transform(code, id) {
      if (
        process.env.NODE_ENV_WATCH === "true" &&
        id.endsWith("src/background/index.ts")
      ) {
        return `${code}
          // 监听模式下注入自动刷新功能
          chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.message == "RELOAD") {
              chrome.runtime.reload();
              sendResponse({ message: "RELOAD" });
            }
          });
      `;
      }
      return code;
    },
  };
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

function mergeOutputFiles(options: {
  root: string;
  files: string[];
  port: number;
}): Plugin {
  const { root, files, port } = options;

  let ws: WebSocket;

  return {
    name: "mergeOutputFiles",
    apply: "build",
    // configResolved(config) {
    //   if (config.build.watch) {
    //     const wss = new WebSocketServer({ port: port || 18001 });
    //     console.log(wss.path);
    //     wss.on("connection", function connection(client) {
    //       ws = client;
    //       console.log(`\x1B[32m[NOTIFY_RELOAD]\x1B[0m client connected.`);
    //       ws.on("message", () => {
    //         ws.send("keep websocket alive.");
    //       });
    //       ws.on("close", () => {
    //         console.log(`\x1B[32m[NOTIFY_RELOAD]\x1B[0m client disconnected.`);
    //       });
    //     });
    //   }
    // },
    async closeBundle() {
      for (const filename of files) {
        await fs.copyFileSync(
          path.resolve(process.cwd(), `${root}/${filename}`),
          path.resolve(process.cwd(), `${CRX_OUTDIR}/${filename}`),
          fs.constants.COPYFILE_FICLONE
        );
      }
      await fs.removeSync(path.resolve(process.cwd(), root));
      // ws && ws.send("RELOAD");
    },
  };
}

function watchConfig() {
  return process.env.NODE_ENV_WATCH === "true"
    ? {
        buildDelay: 300,
        chokidar: {
          usePolling: true,
        },
      }
    : null;
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
        watch: watchConfig(),
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
        watch: watchConfig(),
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
          port: 18001,
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
          formats: ["cjs"],
          fileName: () => "background.js",
        },
        watch: watchConfig(),
      },
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "src"),
        },
      },
      plugins: [
        injectReloadMonitor(),
        mergeOutputFiles({
          root: CRX_BACKGROUND_OUTDIR,
          files: ["background.js"],
          port: 18002,
        }),
      ],
    });
    console.log("\x1B[32m✓ build background script success");
  } catch (error) {
    console.log("\x1B[32m× build background script error", error);
  }
}

(async () => {
  // await buildPopupScript();
  // await buildContentScript();
  await buildBackgroundScript();
  console.log("\x1B[32m✓ build all success");
})();
