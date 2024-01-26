import { Plugin } from "vite";

/**
 * 注册
 * @returns
 */
export function vitePluginReloadSw(): Plugin {
  return {
    name: "vitePluginReloadSw",
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
