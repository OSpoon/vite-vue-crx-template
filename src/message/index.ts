import camelCase from "camelcase";

export interface Payload {
  url: string;
  data?: any;
}

const ContentScriptRegex = /^cs:\/\/[a-zA-Z0-9-]+$/;
const serviceWorkerRegex = /^sw:\/\/[a-zA-Z0-9-]+$/;

export function inject(target: any, prefix: "sw" | "cs") {
  chrome.runtime.onMessage.addListener(
    async (request: Payload, _sender, sendResponse) => {
      const { url, data } = request;
      if (url === "sw://watch_reload_extend") {
        chrome.runtime.reload();
        sendResponse({ url: "cs://watch_reload_page" });
      } else if (url && url.startsWith(`${prefix}://`)) {
        const postId = camelCase(url.split("//")[1]);
        const response = await Reflect.get(target, postId)(data);
        sendResponse(response);
      }
    }
  );
}

export const request = (payload: Payload) => {
  return new Promise((resolve, reject) => {
    try {
      const { url } = payload;
      if (ContentScriptRegex.test(url)) {
        chrome.tabs
          .query({ active: true, currentWindow: true })
          .then((tabs) => {
            chrome.tabs.sendMessage(tabs[0]?.id || 0, payload, (response) =>
              resolve(response)
            );
          });
      } else if (serviceWorkerRegex.test(url)) {
        chrome.runtime.sendMessage(payload, (response) => resolve(response));
      }
    } catch (error) {
      reject(error);
    }
  });
};
