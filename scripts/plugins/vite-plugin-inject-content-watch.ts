import path from "node:path";
import fs from "fs-extra";

import { Plugin } from "vite";

import manifest from "../../public/manifest.json";

export const injectContentWatch = (): Plugin => {
  return {
    name: "vite-plugin-inject-content-watch",
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
};
